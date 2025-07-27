// let _isStart = true;         // 音声認識を開始したかどうか
// let _port = 5596;
// let _langMode = "ja-JP";  // 音声認識の言語モード
// let _infoMode = "simple"     // 接続されたサーバーの音声認識モード
// let _recognition = null;

// const startASR = document.getElementById("start");
// startASR.addEventListener("click", () => {         // startボタンを押されたときに呼ばれるイベントを設定
//     ASRManager();
// })

// const stopASR = document.getElementById("stop");
// stopASR.disabled = "disabled";
// stopASR.addEventListener("click", () => {
//     StopASR();
// })

// function ASRManager () {        // 開始ボタンを押したときに呼ばれるメソッド
//     StartASR();          // 音声認識を開始
//     // GetVolumePressure(); // 音圧取得を開始
//     startASR.disabled = "disabled";
//     console.log("音声認識開始ボタンを利用不可に設定");
//     stopASR.disabled = null;
//     console.log("音声認識停止ボタンを利用可能に設定");
// }

// function StartWebSocketServer () { // WebSocketサーバーを立てるメソッド

// }

// function StartASR () { // 音声認識開始メソッド
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     _recognition = new SpeechRecognition();           // 音声認識インスタンスを作成
//     _recognition.lang = _langMode;                    // 言語モードを指定
//     _recognition.interimResults =true;                // 音声認識の中間結果を取得するように設定
//     _recognition.continuous = true;                   // 音声認識を継続的に行うように設定

//     _recognition.onresult = async function (event) {  // 音声認識結果を受け取った際の処理
//         const index = event.results.length - 1;       // 最後の結果のインデックス
//         console.log(`${event.results[index].isFinal} ${event.results[index].confidence}  ${event.results[index][0].transcript}`);
//     }

//     _recognition.start(); // 音声認識を開始
// }

// function StopASR () {  // 音声認識終了メソッド
//     stopASR.disabled = "disabled";
//     console.log("音声認識停止ボタンを利用不可に設定");
//     startASR.disabled = null;
//     console.log("音声認識開始ボタンを利用可能に設定");
// } 

// function StartVolumeMeter () { // 音圧取得メソッド
//     const AudioContext = window.AudioContext || window.webkitAudioContext;
    
// }


// function SetMute () { // マイクをミュートモードに設定するメソッド

// }

// function DrawVolumnGraph () { // 音のグラフを表示するメソッド

// }

// class RequestFormat { // クライアント側に返す型定義(クラス形式)
//     asrResult;        // 音声認識の結果         
//     volumePressure;
//     confidence;
// }

function LogMessage(message){  // ログ追加メソッド
    const log = document.getElementById("logHistory");

    const now = new Date();
    const time= now.toLocaleDateString();

    const entry = document.createElement("div");
    entry.textContent = `[${time}] ${message}`;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight; // ログ表示領域の一番下までスクロール
}