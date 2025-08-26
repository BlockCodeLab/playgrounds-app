import _aiohttp as aiohttp

SPARKAI_URL = "https://spark-api-open.xf-yun.com/v1/chat/completions"
# for test, free version
APIPASSWORD = "qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim"


async def request(
    messages,
    auth_pass=APIPASSWORD,
    model="lite",
    user="default",
    temperature=0.4,
    top_k=3,
    max_tokens=100,
):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_pass}",
    }
    data = {
        "model": model,
        "user": user,
        "temperature": temperature,
        "top_k": top_k,
        "max_tokens": max_tokens,
        "stream": False,
        "messages": messages,
    }
    async with aiohttp.ClientSession(headers=headers) as client:
        async with client.post(SPARKAI_URL, json=data) as response:
            content = ""
            if response.status == 200:
                json_data = await response.json()
                result = json_data.get("choices")
                if result and result[0]:
                    result = result[0].get("message")
                    if result:
                        result = result.get("content")
                        if result:
                            content = result
            return content
