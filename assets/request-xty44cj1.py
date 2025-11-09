import aiohttp

option = {}
status = 0
data = None


async def fetch(method, url, on_success=None, on_fails=None):
    global option, data, status
    data = None
    async with aiohttp.ClientSession() as client:
        async with client.request(method, url, **option) as response:
            status = response.status
            if status == 200:
                content_type = response.headers.get("Content-Type", "text/plain")
                if content_type.startswith("application/json"):
                    data = await response.json()
                else:
                    data = await response.text()
                if on_success:
                    on_success()
                option = {}
            elif on_fails:
                on_fails()


def get_text():
    return data if str(data) else ""


def get_content(index_path):
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


CHARACTERS_EXCEPT = (
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()"
)


def encode_uri_component(value, encode="utf-8"):
    data = value.encode(encode)
    new_value = ""
    for i in data:
        if i in CHARACTERS_EXCEPT:
            new_value += chr(int(i))
        else:
            new_value += f"%{int(i):x}"
    return new_value


def set_param(key, value):
    global option
    option.setdefault("params", {})
    option["params"][encode_uri_component(key)] = encode_uri_component(value)
