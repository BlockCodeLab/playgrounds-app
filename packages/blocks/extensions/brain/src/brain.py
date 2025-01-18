from micropython import const
from scratch import runtime
from aisdks import sparkai

# for test, free version
AUTH_PASS = "qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim"

MAX_HISTORY = const(4)

brains = {}


def set_default(id):
    brains.setdefault(id, {})
    brains[id].setdefault("prompts", [])
    brains[id].setdefault("history", [])
    brains[id].setdefault("result", '')


def set_prompt(target, prompt):
    id = target.id
    set_default(id)
    brains[id]["prompts"].append(f'{prompt}')


def clear(target):
    id = target.id
    set_default(id)
    brains[id]["prompts"] = []
    brains[id]["history"] = []
    brains[id]["result"] = ''


async def ask_spark(target, message, authPass=AUTH_PASS, model='lite'):
    if not runtime.wifi_connected or not message: return

    id = target.id

    set_default(id)
    prompts = brains[id].get("prompts", [])
    history = brains[id].get("history", [])

    history.append({"role": "user", "content": f'{message}'})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    messages = [{
        "role": "system",
        "content": f"{'；'.join(prompts)}，只用一句话完成对话。",
    }]
    messages.extend(history)

    message = await sparkai.ask(
        messages,
        authPass,
        model=model,
        user=id,
        temperature=0.4,
        top_k=3,
        max_tokens=30,
    )

    history.append({"role": "assistant", "content": message})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    brains[id]["history"] = history
    brains[id]["result"] = message


def get_answer(target):
    id = target.id
    set_default(id)
    return brains[id]["result"] or ""
