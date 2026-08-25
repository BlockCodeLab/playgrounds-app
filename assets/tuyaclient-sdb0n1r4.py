import asyncio
import hashlib
import hmac
import json
import ssl
import time

import ntptime
from umqtt.simple import MQTTClient

CA_CERT_DATA = b'0\x82\x03\xc50\x82\x02\xad\xa0\x03\x02\x01\x02\x02\x01\x000\r\x06\t*\x86H\x86\xf7\r\x01\x01\x0b\x05\x000\x81\x831\x0b0\t\x06\x03U\x04\x06\x13\x02US1\x100\x0e\x06\x03U\x04\x08\x13\x07Arizona1\x130\x11\x06\x03U\x04\x07\x13\nScottsdale1\x1a0\x18\x06\x03U\x04\n\x13\x11GoDaddy.com, Inc.110/\x06\x03U\x04\x03\x13(Go Daddy Root Certificate Authority - G20\x1e\x17\r090901000000Z\x17\r371231235959Z0\x81\x831\x0b0\t\x06\x03U\x04\x06\x13\x02US1\x100\x0e\x06\x03U\x04\x08\x13\x07Arizona1\x130\x11\x06\x03U\x04\x07\x13\nScottsdale1\x1a0\x18\x06\x03U\x04\n\x13\x11GoDaddy.com, Inc.110/\x06\x03U\x04\x03\x13(Go Daddy Root Certificate Authority - G20\x82\x01"0\r\x06\t*\x86H\x86\xf7\r\x01\x01\x01\x05\x00\x03\x82\x01\x0f\x000\x82\x01\n\x02\x82\x01\x01\x00\xbfqb\x08\xf1\xfaY4\xf7\x1b\xc9\x18\xa3\xf7\x80IX\xe9"\x83\x13\xa6\xc5 C\x01;\x84\xf1\xe6\x85I\x9f\'\xea\xf6\x84\x1bN\xa0\xb4\xdbp\x98\xc72\x01\xb1\x05>\x07N\xee\xf4\xfaO/Y0"\xe7\xab\x19Vk\xe2\x80\x07\xfc\xf3\x16u\x809Q{\xe5\xf95\xb6tN\xa9\x8d\x82\x13\xe4\xb6?\xa9\x03\x83\xfa\xa2\xbe\x8a\x15j\x7f\xde\x0b\xc3\xb6\x19\x14\x05\xca\xea\xc3\xa8\x04\x94;F|2\r\xf3\x00f"\xc8\x8dim6\x8c\x11\x18\xb7\xd3\xb2\x1c`\xb48\xfa\x02\x8c\xce\xd3\xddF\x07\xde\n>\xeb]|\xc8|\xfb\xb0+S\xa4\x92biQ%\x05a\x1aD\x81\x8c,\xa9C\x96#\xdf\xac:\x81\x9a\x0e)\xc5\x1c\xa9\xe9]\x1e\xb6\x9e\x9e0\n9\xce\xf1\x88\x80\xfbK]\xcc2\xec\x85bC%4\x02V\'\x01\x91\xb4;p*?n\xb1\xe8\x9c\x88\x01}\x9f\xd4\xf9\xdbSm`\x9d\xbf,\xe7X\xab\xb8_F\xfc\xce\xc4\x1b\x03<\t\xebI1\\iF\xb3\xe0G\x02\x03\x01\x00\x01\xa3B0@0\x0f\x06\x03U\x1d\x13\x01\x01\xff\x04\x050\x03\x01\x01\xff0\x0e\x06\x03U\x1d\x0f\x01\x01\xff\x04\x04\x03\x02\x01\x060\x1d\x06\x03U\x1d\x0e\x04\x16\x04\x14:\x9a\x85\x07\x10g(\xb6\xef\xf6\xbd\x05An \xc1\x94\xda\x0f\xde0\r\x06\t*\x86H\x86\xf7\r\x01\x01\x0b\x05\x00\x03\x82\x01\x01\x00\x99\xdb]y\xd5\xf9\x97Yg\x03a\xf1~;\x061u-\xa1 \x8eOe\x87\xb4\xf7\xa6\x9c\xbc\xd8\xe9/\xd0\xdbZ\xee\xcft\x8cs\xb48B\xda\x05{\xf8\x02u\xb8\xfd\xa5\xb1\xd7\xae\xf6\xd7\xde\x13\xcbS\x10~\x8aF\xd1\x97\xfa\xb7.+\x11\xab\x90\xb0\'\x80\xf9\xe8\x9fZ\xe97\x9f\xab\xe4\xdfl\xb3\x85\x17\x9d=\xd9$Oy\x915\xd6_\x04\xeb\x80\x83\xab\x9a\x02-\xb5\x10\xf4\xd8\x90\xc7\x04s@\xedr%\xa0\xa9\x9f\xec\x9e\xabh\x12\x99W\xc6\x8f\x12:\t\xa4\xbdD\xfd\x06\x157\xc1\x9b\xe42\xa3\xed8\xe8\xd8d\xf3,~\x14\xfc\x02\xea\x9f\xcd\xff\x07h\x17\xdb"\x908-z\x8d\xd1T\xf1i\xe3_3\xcaz={\n\xe3\xca\x7f_9\xe5\xe2u\xba\xc5v\x183\xce,\xf0/L\xad\xf7\xb1\xe7\xceO\xa8\xc4\x9bJT\x06\xc5\x7f}\xd5\x08\x0f\xe2\x1c\xfe~\x17\xb8\xac^\xf6\xd4\x16\xb2C\t\x0cM\xf6\xa7k\xb4\x99\x84e\xcaz\x88\xe2\xe2D\xbe\\\xf7\xea\x1c\xf5'

TIMESTAMP_FIX = 946684800

client = None
topic_prefix = None
message_cache = None
received_cbs = None
received_cache = None

ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_ctx.verify_mode = ssl.CERT_REQUIRED
ssl_ctx.load_verify_locations(cadata=CA_CERT_DATA)


def sync_time():
    year = time.localtime()[0]
    if year < 2001:
        ntptime.settime()


def on_message(topic, payload):
    if received_cbs is None:
        return

    global received_cache
    received_cache = json.loads(payload)

    for type, cbs in received_cbs.items():
        if topic.decode() == f"{topic_prefix}/{type}":
            for cb in cbs:
                cb()


def get_property(prop):
    if (
        received_cache is None
        or "data" not in received_cache
        or prop not in received_cache["data"]
    ):
        return False
    value = received_cache["data"][prop]
    return value


async def check_msg():
    while True:
        if client is None:
            return
        client.check_msg()
        await asyncio.sleep(0.1)


async def connect(server, device_id, device_secret):
    global client, topic_prefix

    if client is not None:
        return

    sync_time()
    timestamp = time.time() + TIMESTAMP_FIX

    client_id = f"tuyalink_{device_id}"
    key_str = f"timestamp={timestamp},secureMode=1,accessType=1"
    username = f"{device_id}|signMethod=hmacSha256,{key_str}"
    password = hmac.new(
        device_secret.encode(),
        f"deviceId={device_id},{key_str}".encode(),
        hashlib.sha256,
    ).hexdigest()

    try:
        client = MQTTClient(
            client_id=client_id,
            user=username,
            password=password,
            server=server,
            ssl=ssl_ctx,
            port=8883,
        )
        client.connect()
    except Exception as e:
        print(f"Failed to connect: {e}")
        client = None
        topic_prefix = None
        return

    client.set_callback(on_message)
    asyncio.create_task(check_msg())

    topic_prefix = f"tylink/{device_id}/thing"
    client.subscribe(f"{topic_prefix}/property/set")
    client.subscribe(f"{topic_prefix}/action/execute")


def is_connected():
    return client is not None


def close():
    global client, topic_prefix, message_cache, received_cbs
    if client is not None:
        client.disconnect()
        client = None
        topic_prefix = None
        message_cache = None
        received_cbs = None


def report(key, value, cache=False):
    if not is_connected():
        return

    global message_cache
    if message_cache is None:
        message_cache = {}
    key = str(key)
    message_cache[key] = value

    if cache:
        return

    timestamp = time.time() + TIMESTAMP_FIX
    topic = f"{topic_prefix}/property/report"
    msg = {
        "time": timestamp,
        "data": {},
    }
    for key, value in message_cache.items():
        msg["data"][key] = {}
        msg["data"][key]["value"] = value
        msg["data"][key]["time"] = timestamp

    payload = json.dumps(msg)
    client.publish(topic, payload, qos=1)
    message_cache = None


def received(callback, type="property/set"):
    if type not in ["property/set", "action/execute"]:
        return

    global received_cbs
    if received_cbs is None:
        received_cbs = {}
    if type not in received_cbs:
        received_cbs[type] = []
    received_cbs[type].append(callback)
