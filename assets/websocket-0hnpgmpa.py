import aiohttp
import asyncio
import json

try:
    from scratch import runtime
except Exception:
    from blocks import runtime

WEBSOCKET_CONNECTED = "WEBSOCKET_CONNECTED"
WEBSOCKET_RECEIVED = "WEBSOCKET_RECEIVED"
WEBSOCKET_DISCONNECTED = "WEBSOCKET_DISCONNECTED"
WEBSOCKET_ERRORS = "WEBSOCKET_ERRORS"

ws_client = None

data = {
    "ERROR": False,
    "TEXT": None,
    "JSON": None,
}


def is_ssl(url):
    if url.startswith("wss:"):
        try:
            import ssl

            sslctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            sslctx.verify_mode = ssl.CERT_NONE
            return sslctx
        except Exception:
            return False


async def _disconnect():
    global ws_client
    if ws_client:
        await ws_client.close()
        runtime.fire(WEBSOCKET_DISCONNECTED)
        ws_client = None


async def _connect(url):
    global ws_client

    if not runtime.wifi_connected:
        return

    await _disconnect()

    async with aiohttp.ClientSession() as client:
        try:
            async with client.ws_connect(url, ssl=is_ssl(url)) as ws:
                ws_client = ws
                runtime.fire(WEBSOCKET_CONNECTED)
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        data["ERROR"] = False
                        if data["TEXT"] != msg.data:
                            data["JSON"] = None
                        data["TEXT"] = msg.data
                        runtime.fire(WEBSOCKET_RECEIVED)
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        data["ERROR"] = True
                        runtime.fire(WEBSOCKET_ERRORS)
            runtime.fire(WEBSOCKET_DISCONNECTED)
            ws_client = None
            data["ERROR"] = False
        except Exception:
            data["ERROR"] = True
            runtime.fire(WEBSOCKET_ERRORS)


async def connect(url):
    asyncio.create_task(_connect(url))
    while not ws_client:
        await asyncio.sleep_ms(100)


def disconnect():
    asyncio.create_task(_disconnect())


def is_connected():
    return ws_client is not None and not ws_client.ws.closed


def is_disconnected():
    return ws_client is None or ws_client.ws.closed


def is_errors():
    return data["ERROR"]


def send(message):
    if is_connected():
        data["ERROR"] = False
        try:
            if type(message) is dict:
                message = json.dumps(message)
            asyncio.create_task(ws_client.send_str(str(message)))
        except Exception:
            data["ERROR"] = True
            runtime.fire(WEBSOCKET_ERRORS)


def get_text():
    return data["TEXT"] if data["TEXT"] else ""


def get_data(index_path):
    if not data["TEXT"]:
        return ""
    if not data["JSON"]:
        try:
            data["JSON"] = json.loads(data["TEXT"])
        except Exception:
            data["JSON"] = {}

    result = data["JSON"]
    index_path = index_path.split(".")
    for index in index_path:
        if type(result) is list:
            result = result[int(index) - 1]
        elif type(result) is dict:
            result = result.get(index)
        else:
            break
    if result != 0 and not result:
        return ""
    return result
