let _isStart = true;         // 音声認識を開始したかどうか
let _langMode = "ja-JP";  // 音声認識の言語モード
let _infoMode = "simple"     // 接続されたサーバーの音声認識モード
let _recognition = null;
let _audioContext = null;
let _volumeStream = null;
let _volumeAnimationId = null;
let isDragging = false;       // 閾値バーが移動可能かどうか

const startASR = document.getElementById("startASR");
startASR.addEventListener("click", () => {         // startボタンを押されたときに呼ばれるイベントを設定
    ASRManager();
})

const stopASR = document.getElementById("stopASR");
stopASR.disabled = "disabled";
stopASR.addEventListener("click", () => {
    StopASR();
})

const startVolumeMeter = document.getElementById("startVolumePressure");
startVolumeMeter.addEventListener("click", () => {
    StartVolumeMeter();
})

const thresholdLine = document.getElementById("thresholdLine");
const container = document.getElementById("volumeBarContainer");
thresholdLine.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
    if(!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    let offsetY = e.clientY - containerRect.top;
    offsetY = Math.max(0, Math.min(offsetY, containerRect.height)); // 範囲制御

    const percent = (offsetY / containerRect.height) * 100;
    thresholdLine.style.top = `${percent}%`;
});

document.addEventListener("mouseup", () => {
    if(isDragging){
        isDragging = false;
    }
});


function ASRManager () {        // 開始ボタンを押したときに呼ばれるメソッド
    StartASR();          // 音声認識を開始
    // GetVolumePressure(); // 音圧取得を開始
    startASR.disabled = "disabled";
    console.log("音声認識開始ボタンを利用不可に設定");
    stopASR.disabled = null;
    console.log("音声認識停止ボタンを利用可能に設定");
}

function StartWebSocketServer () { // WebSocketサーバーを立てるメソッド
    hostURLText = document.getElementById("hostURL");
    var connection = new WebSocket(hostURLText);

    connection.onopen = function(e){

    };

    connection.onerror = function(error){
        console.log(error);
    }

    connection.onmessage = function(e){};

    connection.onclose = function(){

    }
}

function StartASR () { // 音声認識開始メソッド
    if(_recognition) return;

    asrResultText = document.getElementById("asrResult");
    asrConfidenceText = document.getElementById("asrConfidenceValue");
    asrConditionText = document.getElementById("asrConditionValue");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    _recognition = new SpeechRecognition();           // 音声認識インスタンスを作成
    _recognition.lang = _langMode;                    // 言語モードを指定
    _recognition.interimResults =true;                // 音声認識の中間結果を取得するように設定
    _recognition.continuous = true;                   // 音声認識を継続的に行うように設定

    _recognition.onresult = async function (event) {  // 音声認識結果を受け取った際の処理
        const index = event.results.length - 1;       // 最後の結果のインデックス
        console.log(`${event.results[index].isFinal} ${event.results[index].confidence}  ${event.results[index][0].transcript}`);
        asrResultText.textContent = `${event.results[index][0].transcript}`;
        asrConfidenceText.textContent = `${event.results[index][0].confidence}`;
        asrConditionText.textContent = `${event.results[index].isFinal}`;
    }

    _recognition.start(); // 音声認識を開始
}

function StopASR () {  // 音声認識終了メソッド
    stopASR.disabled = "disabled";
    console.log("音声認識停止ボタンを利用不可に設定");
    startASR.disabled = null;
    console.log("音声認識開始ボタンを利用可能に設定");
} 

async function StartVolumeMeter () { // 音圧取得メソッド
    if(_audioContext) return;

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


function SetMute () { // マイクをミュートモードに設定するメソッド

}

class RequestFormat { // クライアント側に返す型定義(クラス形式)
    asrResult;        // 音声認識の結果         
    volumePressure;
    confidence;
}

function UpdateVolumeDisplay(dbValue){ // Volumeのデシベル値、バーの更新を行うメソッド
    const volumeBar = document.getElementById("volumeBar");
    const volumeText = document.getElementById("volumePressureValue");

    const minDb = 10;
    const maxDb = 70;
    const clampedDB = Math.min(Math.max(dbValue, minDb), maxDb);
    const percent = ((clampedDB - minDb)/ (maxDb - minDb)) * 100;

    volumeBar.style.height = `${percent}%`;
    volumeBar.textContent = `${dbValue}DB`;
}

function LogMessage(message){  // ログ追加メソッド
    const log = document.getElementById("logHistory");

    const now = new Date();
    const time= now.toLocaleDateString();

    const entry = document.createElement("div");
    entry.textContent = `[${time}] ${message}`;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight; // ログ表示領域の一番下までスクロール
}