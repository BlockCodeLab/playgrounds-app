import asyncio
import time

import aioespnow
import network

try:
    from scratch import runtime, when_start
except Exception:
    from blocks import runtime, when_start


PEER = b"\xff" * 6
RECEIVE_MESSAGE = "RECEIVE_MESSAGE"

running = False
options = {
    "group": "1",
}
received = {}


async def server(e):
    async for mac, msg in e:
        if type(msg) == bytearray:
            msg = msg.decode("utf-8")
        group = None
        name = "default"
        value = msg
        kv = msg.split(":")
        if len(kv) == 3:
            group, name, value = kv
        elif len(kv) == 2:
            group, value = kv
        if options["group"] == group:
            received.setdefault(name, {"serialnumber": 0})
            received[name]["mac"] = mac
            received[name]["value"] = value
            received[name]["timestamp"] = time.ticks_ms()
            received[name]["serialnumber"] += 1
            runtime.fire(f"{RECEIVE_MESSAGE}:{name}")


@when_start
async def start():
    global running
    network.WLAN(network.STA_IF).active(True)

    e = aioespnow.AIOESPNow()
    e.active(True)
    e.add_peer(PEER)

    running = e
    asyncio.create_task(server(e))


async def send_raw(msg):
    e = running
    try:
        await e.asend(PEER, msg)
    except OSError as err:
        if len(err.args) > 1:
            if err.args[1] == "ESP_ERR_ESPNOW_NOT_INIT":
                e.active(True)
                await e.asend(PEER, msg)
            elif err.args[1] == "ESP_ERR_ESPNOW_IF":
                network.WLAN(network.STA_IF).active(True)
                await e.asend(PEER, msg)


def send(msg, name=None):
    msg = (options["group"], name, msg) if name else (options["group"], msg)
    asyncio.create_task(send_raw(bytes(":".join(msg), "utf-8")))


def set_group(value):
    options["group"] = str(value)


def when_received(name, target):
    def wrapper(handle):
        runtime.when(f"{RECEIVE_MESSAGE}:{name}", handle, target)

    return wrapper


def get_message(name="default"):
    data = received.get(name, {})
    return data.get("value", "")


def get_message_info(key="serialnumber", name="default"):
    data = received.get(name, {})
    return data.get(key, "")
