from micropython import const
import aiohttp


SPARKAI_URL = "https://spark-api-open.xf-yun.com/v1/chat/completions"

# for test, free version
APIPASSWORD = "qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim"

async def sparkai(
    messages,
    authPass=APIPASSWORD,
    model='lite',
    user='default',
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
                result = json_data.get('choices')
                if result and result[0]:
                    result = result[0].get('message')
                    if result:
                        result = result.get("content")
                        if result:
                            content = result
            else:
                print(response.status)
            return content


MAX_HISTORY = const(4)
brains = {}


def set_default(id):
    brains.setdefault(id, {})
    brains[id].setdefault("prompts", [])
    brains[id].setdefault("history", [])
    brains[id].setdefault("result", "")


def set_prompt(id, prompt):
    set_default(id)
    brains[id]["prompts"].append(f"{prompt}")


def clear(id):
    set_default(id)
    brains[id]["prompts"] = []
    brains[id]["history"] = []
    brains[id]["result"] = ""


async def ask_spark(id, message, apiPass=APIPASSWORD, model="lite"):
    if not message:
        return

    set_default(id)
    prompts = brains[id].get("prompts", [])
    history = brains[id].get("history", [])

    history.append({"role": "user", "content": f"{message}"})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    messages = [{
        "role": "system",
        "content": f"现在开始你的回答不能超过100字。{'；'.join(prompts)}。",
    }]
    messages.extend(history)

    result = await sparkai(
        messages,
        apiPass,
        model=model,
        user=id,
        temperature=0.4,
        top_k=3,
        max_tokens=70,
    )

    history.append({"role": "assistant", "content": result})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    brains[id]["history"] = history
    brains[id]["result"] = result


def get_answer(id):
    set_default(id)
    return brains[id]["result"] or ""
