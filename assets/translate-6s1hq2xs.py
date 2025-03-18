from micropython import const
from language import language_id
import aiohttp

SPARKAI_URL = "https://spark-api-open.xf-yun.com/v1/chat/completions"

# for test, free version
APIPASSWORD = "qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim"


LANGUAGES = {
    "en": "English",
    "zh": "中文",
    "jp": "日本語",
    "ko": "한국어",
}


async def sparkai(
    messages,
    authPass=APIPASSWORD,
    model="lite",
    user="default",
    temperature=0.4,
    top_k=3,
    max_tokens=100,
):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {authPass}",
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
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.post(SPARKAI_URL, json=data) as response:
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
            else:
                print(response.status)
            return content


async def translate(text, lang, apiPass=APIPASSWORD, model="lite"):
    if not text:
        return

    messages = [
        {
            "role": "system",
            "content": "You are an excellent translator.",
        },
        {
            "role": "user",
            "content": f"Translate the following text to {lang}:\n\n {text}",
        },
    ]

    result = await sparkai(
        messages,
        apiPass,
        model=model,
        user=id,
        temperature=0.4,
        top_k=3,
        max_tokens=70,
    )

    return result


def get_language():
    return LANGUAGES[language_id.split[0:2]]
