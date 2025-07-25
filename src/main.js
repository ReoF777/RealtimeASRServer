let _isStart = true;         // 音声認識を開始したかどうか
let _port = 5596;
let _langMode = "Japanese";  // 音声認識の言語モード
let _infoMode = "simple"     // 接続されたサーバーの音声認識モード

const startASR = document.getElementById("start");
startASR.addEventListener("click", () => {         // startボタンを押されたときに呼ばれるイベントを設定
    ASRManager();
})

const stopASR = document.getElementById("stop");
stopASR.disabled = "disabled";
stopASR.addEventListener("click", () => {
    StopASR();
})

function ASRManager () {        // 開始ボタンを押したときに呼ばれるメソッド
    StartASR();          // 音声認識を開始
    // GetVolumePressure(); // 音圧取得を開始
    startASR.disabled = "disabled";
    console.log("音声認識開始ボタンを利用不可に設定");
    stopASR.disabled = null;
    console.log("音声認識停止ボタンを利用可能に設定");
}

function StartWebSocketServer () { // WebSocketサーバーを立てるメソッド

}

function StartASR () { // 音声認識開始メソッド
    const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    const recognition = new SpeechRecognition(); // 音声認識インスタンスを作成
    recognition.interimResults =true;

    recognition.onresult = async function (event) {  // 音声認識結果を受け取った際の処理
        console.log(event.results[0][0].transcript);
    }

    recognition.start(); // 音声認識を開始
}

function StopASR () {  // 音声認識終了メソッド
    stopASR.disabled = "disabled";
    console.log("音声認識停止ボタンを利用不可に設定");
    startASR.disabled = null;
    console.log("音声認識開始ボタンを利用可能に設定");
} 

function GetVolumePressure () { // 音圧取得メソッド

}


function SetMute () { // マイクをミュートモードに設定するメソッド

}

function DrawVolumnGraph () { // 音のグラフを表示するメソッド

}

class RequestFormat { // クライアント側に返す型定義(クラス形式)
    asrResult;        // 音声認識の結果         
    volumePressure;
    confidence;
}