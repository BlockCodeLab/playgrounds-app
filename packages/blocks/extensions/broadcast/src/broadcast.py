import network
import aioespnow
import asyncio
import time

try:
    from scratch import runtime, when_start
except Exception:
    from blocks import runtime, when_start


PING = bytes("PING", "utf-8")
RECEIVE_MESSAGE = "RECEIVE_MESSAGE"

running = False
options = {
    "group": "1",
}
received = {}


async def heartbeat(e, peer, period=1):
    while True:
        await e.asend(peer, PING)
        await asyncio.sleep(period)


async def server(e):
    async for mac, msg in e:
        try:
            e.get_peer(mac)
        except OSError as err:
            if (
                msg == PING
                and len(err.args) > 1
                and err.args[1] == "ESP_ERR_ESPNOW_NOT_FOUND"
            ):
                e.add_peer(mac)
        if msg != PING:
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
        await runtime.next_tick()


@when_start
async def start():
    global running
    network.WLAN(network.STA_IF).active(True)

    e = aioespnow.AIOESPNow()
    e.active(True)
    peer = b"\xff" * 6
    e.add_peer(peer)

    running = e
    asyncio.create_task(heartbeat(e, peer))
    asyncio.create_task(server(e))


async def send_raw(msg):
    e = running
    peers = e.get_peers()
    for mac, lmk, channel, ifidx, encrypt in peers:
        try:
            await e.asend(mac, msg)
        except OSError as err:
            if len(err.args) > 1:
                if err.args[1] == "ESP_ERR_ESPNOW_NOT_INIT":
                    e.active(True)
                    await e.asend(mac, msg)
                elif err.args[1] == "ESP_ERR_ESPNOW_IF":
                    network.WLAN(network.STA_IF).active(True)
                    await e.asend(mac, msg)


def send(msg, name="default"):
    asyncio.create_task(send_raw(bytes(f"{options['group']}:{name}:{msg}", "utf-8")))


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
