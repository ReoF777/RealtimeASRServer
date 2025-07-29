# websocket_server.py
import asyncio
import websockets

async def handler(websocket):  # ← path を削除
    print("クライアントが接続しました")
    try:
        async for message in websocket:
            print(f"受信: {message}")
            await websocket.send(f"受信した: {message}")
    except websockets.exceptions.ConnectionClosed as e:
        print("クライアントが切断されました", e)

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        print("WebSocket サーバーが起動しました ws://localhost:8000")
        await asyncio.Future()  # 永続待機

if __name__ == "__main__":
    asyncio.run(main())
