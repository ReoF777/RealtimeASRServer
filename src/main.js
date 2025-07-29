let _isStart = true;           // 音声認識を開始したかどうか
let _langMode = "ja-JP";       // 音声認識の言語モード
let _infoMode = "simple"       // 接続されたサーバーの音声認識モード
let _recognition = null;       // 音声認識インスタンス
let _audioContext = null;      // 音圧取得を行う
let _volumeStream = null;      // 音圧の取得を行うストリーム
let _volumeAnimationId = null;
let _isDragging = false;       // 閾値バーが移動可能かどうか
let _setThresholdValue = 0;    // 閾値(音圧)の閾値(最初はすべての音圧を取得)
let _volumnHistory = [];       // 音圧履歴
let _volumnTimestamp = performance.now();
let VOLUMN_RECORD_SPAN = 100;  // 音圧履歴に入れるデータの時間間隔(ms)
let VOLUMN_HISTORY_LEN = 3000; // 音圧履歴から参照する時間幅(ミリセカンド)
let VOLUMN_CUTOFF = 3000;      // 音圧履歴に入れる最大時間幅(3000の場合だと、三秒前のデータまで保存、それ以外は削除)
let _webSocket = null;
let _prevIsFinal = false;      // 前の認識結果が、認識完了結果の場合

const startASR = document.getElementById("startASR");
startASR.addEventListener("click", () => {         // startボタンを押されたときに呼ばれるイベントを設定
    StartASR();
})

const startVolumeMeter = document.getElementById("startVolumePressure");
startVolumeMeter.addEventListener("click", () => {
    StartVolumeMeter();
})

const thresholdLine = document.getElementById("thresholdLine");
const container = document.getElementById("volumeBarContainer");
thresholdLine.addEventListener("mousedown", (e) => {
    _isDragging = true;
    e.preventDefault();
});

const startWebSocketServer = document.getElementById("startWebSocketServer");
startWebSocketServer.addEventListener("click", (e) => {
    StartWebSocketClient();
});

const volumeText = document.getElementById("volumePressureValue");

document.addEventListener("mousemove", (e) => {
    if(!_isDragging) return;

    const containerRect = container.getBoundingClientRect();
    let offsetY = e.clientY - containerRect.top;
    offsetY = Math.max(0, Math.min(offsetY, containerRect.height)); // 範囲制御

    const percent = ((offsetY / containerRect.height) * 100 - 100) * -1;
    thresholdLine.style.top = `${(percent - 100) * -1}%`;

    volumeText.textContent = `${Math.round(percent)}%`;
    _setThresholdValue = percent;
});

document.addEventListener("mouseup", () => {
    _isDragging = false;
});

function StartWebSocketClient () { // WebSocketクライアントを立てるメソッド
    let hostURLText = document.getElementById("hostURL").value;
    _webSocket = new WebSocket(hostURLText);

    _webSocket.onopen = function(e){
        startWebSocketServer.disabled = "disabled";
        LogMessage("WebSocketサーバーを立ち上げました。");
    }

    _webSocket.onerror = function(error){
        console.log(error);
        LogMessage(`エラーが発生:${error}`);
    }

    _webSocket.onmessage = function(e){
        // LogMessage(`サーバー側からのメッセージ:${e}`);
    };

    _webSocket.onclose = function(){
        _webSocket = null;
        LogMessage("WebSocketサーバーが閉じました");
        startWebSocketServer.disabled = null;
    }
}

function StartASR () { // 音声認識開始メソッド
    if(_webSocket == null){
        alert("WebSocketサーバーを立ち上げてください");
        return;
    }

    LogMessage("音声認識を開始しました。");

    startASR.disabled = "disabled";
    console.log("音声認識開始ボタンを利用不可に設定");

    asrResultText = document.getElementById("asrResult");
    asrConfidenceText = document.getElementById("asrConfidenceValue");
    asrConditionText = document.getElementById("asrConditionValue");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(_recognition == null){
        _recognition = new SpeechRecognition();           // 音声認識インスタンスを作成
        _recognition.lang = _langMode;                    // 言語モードを指定
        _recognition.interimResults =true;                // 音声認識の中間結果を取得するように設定
        _recognition.continuous = true;                   // 音声認識を継続的に行うように設定
    }

    _recognition.onresult = async function (event) {  // 音声認識結果を受け取った際の処理
        if(_prevIsFinal == true){    // 前回の認識結果が、認識完了データの場合
            _prevIsFinal = false;    // 認識フラグを初期化
            asrResultText.textContent = ""; // 音声認識結果を初期化
        }

        const now = performance.now();     // 現在時刻を取得
        const recentVolumes = _volumnHistory.filter(v => now - v.time <= VOLUMN_HISTORY_LEN); // 参照する時間幅分、データを取得(ms単位)
        let maxVolume = 0;                 // 最大音圧
        if(recentVolumes.length > 0){      // 空データでない場合
            maxVolume = Math.max(...recentVolumes.map(v => v.value)); // 参照する時間データ分、切り出し
        }

        if(maxVolume < _setThresholdValue){ // 音圧が設定した閾値よりも低い場合には認識結果を破棄
            return;
        }

        var prevResult = asrResultText.textContent;

        const index = event.results.length - 1;       // 最後の結果のインデックス
        console.log(`${event.results[index].isFinal} ${event.results[index][0].confidence}  ${event.results[index][0].transcript}`);
        
        if(event.results[index].isFinal || event.results[index][0].transcript.length > prevResult.length){
            asrResultText.textContent = event.results[index][0].transcript;
        }

        _prevIsFinal = event.results[index].isFinal;

        // asrResultText.textContent = event.results[index][0].transcript;
        asrConfidenceText.textContent = `${event.results[index][0].confidence}`;
        asrConditionText.textContent = `${event.results[index].isFinal}`;

        if(_webSocket != null){
            const data = {
                confidence: asrConfidenceText.textContent,
                result: asrResultText.textContent,
                isFinal: asrConditionText.textContent
            }

            _webSocket.send(JSON.stringify(data));
        }

        if(event.results[index].isFinal == true){
            LogMessage(`音声認識結果(完了):${asrResultText.textContent}`);
        }
        else{
            LogMessage(`音声認識結果(途中):${asrResultText.textContent}`);
        }
    }

    _recognition.start(); // 音声認識を開始
}

async function StartVolumeMeter () { // 音圧取得メソッド
    if(_webSocket == null){
        alert("WebSocketサーバーを立ち上げてください");
        return;
    }

    LogMessage("音圧取得を開始しました。")

    startVolumeMeter.disabled = "disabled";
    if(_audioContext){
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    _volumeStream = stream;
    _audioContext = new AudioContext();

    const source = _audioContext.createMediaStreamSource(stream);
    const analyser = _audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function update(){
        analyser.getByteFrequencyData(dataArray);

        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;

        UpdateVolumeDisplay(avg);

        _volumeAnimationId = requestAnimationFrame(update);
    }

    update();
}

class RequestFormat { // クライアント側に返す型定義(クラス形式)
    asrResult;        // 音声認識の結果         
    volumePressure;
    confidence;
}

function UpdateVolumeDisplay(dbValue){ // Volumeのデシベル値、バーの更新を行うメソッド
    const volumeBar = document.getElementById("volumeBar");

    const minDb = 10;
    const maxDb = 70;
    const clampedDB = Math.min(Math.max(dbValue, minDb), maxDb);
    const percent = ((clampedDB - minDb)/ (maxDb - minDb)) * 100;

    // ボリュームの値(%フォーマット)を音圧履歴に保存
    if(performance.now() - _volumnTimestamp > VOLUMN_RECORD_SPAN){
        _volumnHistory.push({time: performance.now(), value: percent});
        const cutoff = performance.now() - VOLUMN_CUTOFF; 
        _volumnHistory.filter(v => v.time >= cutoff);       // カットオフ時間以前のデータを削除

        volumeBar.style.height = `${percent}%`;

        _volumnTimestamp = performance.now();
    }
}

function LogMessage(message){  // ログ追加メソッド
    const log = document.getElementById("logHistory");

    const now = new Date();
    const time= now.toLocaleDateString();

    const entry = document.createElement("div");
    entry.textContent = `[${time}] ${message}`;

    log.appendChild(entry);
    
    requestAnimationFrame(() => {
        log.scrollTop = log.scrollHeight;
    });
}