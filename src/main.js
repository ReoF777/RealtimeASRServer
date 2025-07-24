let _isStart = true;         // 音声認識を開始したかどうか
let _lengMode = "Japanese";  // 音声認識の言語モード
let _infoMode = "simple"     // 接続されたサーバーの音声認識モード

const startEventTriggered = document.getElementById("start");
startEventTriggered.addEventListener("click", () => {         // startボタンを押されたときに呼ばれるイベントを設定
    ASRManager();
})

function ASRManager () {        // 開始ボタンを押したときに呼ばれるメソッド
    StartASR();          // 音声認識を開始
    GetVolumePressure(); // 音圧取得を開始
}

function StartWebSocketServer () { // WebSocketサーバーを立てるメソッド

}

function StartASR () { // 音声認識開始メソッド
    speechRecognition = webkitSpeechRecognition || SpeechRecognition;
    const recognition = new speechRecognition();
    recognition.continuous = true;

    var asrContent = document.getElementById("asrContentResult");

    while(true){ // 音声認識をループ

    }
}

function StopASR () {  // 音声認識終了メソッド

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