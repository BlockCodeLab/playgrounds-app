import aiohttp
import asyncio

try:
    from scratch import runtime
except Exception:
    from blocks import runtime

REQUEST_FAILS = "REQUEST_FAILS"
REQUEST_SUCCESS = "REQUEST_SUCCESS"

option = {}
status = 0
data = None


async def fetch_raw(method, url):
    global option, data, status
    async with aiohttp.ClientSession() as client:
        try:
            async with client.request(method, url, **option) as resp:
                status = resp.status
                if status == 200:
                    content_type = resp.headers.get("Content-Type", "text/plain")
                    if content_type.startswith("application/json"):
                        data = await resp.json()
                    else:
                        data = await resp.text()
                    runtime.fire(REQUEST_SUCCESS)
                    option = {}
                else:
                    runtime.fire(REQUEST_FAILS)
        except Exception:
            runtime.fire(REQUEST_FAILS)


def fetch(method, url):
    if runtime.wifi_connected:
        asyncio.create_task(fetch_raw(method, url))
    else:
        runtime.fire(REQUEST_FAILS)


async def afetch(method, url):
    if runtime.wifi_connected:
        await fetch_raw(method, url)
    else:
        runtime.fire(REQUEST_FAILS)


def get_content(index_path=None):
    if not index_path:
        return ""
    if not data:
        return ""

    result = data
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


def clear_cache():
    global option, data, status
    option = {}
    status = 0
    data = None


def set_header(header, value):
    global option
    option.setdefault("headers", {})
    option["headers"][header] = value


def set_body(key, value):
    global option
    option.setdefault("json", {})
    option["json"][key] = value


_CHARACTERS_EXCEPT = (
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()"
)


def encode_uri_component(value, encode="utf-8"):
    data = value.encode(encode)
    new_value = ""
    for i in data:
        if i in _CHARACTERS_EXCEPT:
            new_value += chr(int(i))
        else:
            new_value += f"%{int(i):x}"
    return new_value


def set_param(key, value):
    global option
    option.setdefault("params", {})
    option["params"][encode_uri_component(key)] = encode_uri_component(value)
