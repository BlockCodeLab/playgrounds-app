from micropython import const
import aiohttp
import random


SPARKAI_URL = "https://spark-api-open.xf-yun.com/v1/chat/completions"

# for test, free version
APIPASSWORD = "qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim"

ALPHABET = "qwertyuiopasdfghjklzxcvbnm1234567890"
MAX_HISTORY = const(6)


async def sparkai(
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
            return content


class Brain:
    def __init__(self, auth_pass=APIPASSWORD, model="lite"):
        # 随机字符串作为用户ID
        self.user = "".join(random.choice(ALPHABET) for _ in range(16))
        self.auth_pass = auth_pass
        self.model = model
        self.prompts = []
        self.history = []
        self.result = ""

    def clear(self):
        self.prompts = []
        self.history = []
        self.result = ""

    def add_prompt(self, prompt):
        self.prompts.append(f"{prompt}")

    def add_history(self, role, content):
        self.history.append({"role": "user", "content": f"{content}"})
        if len(self.history) > MAX_HISTORY:
            self.history.pop(0)

    async def ask(self, message):
        if not message:
            return
        self.add_history("user", message)

        messages = [
            {
                "role": "system",
                "content": f"你的话不多，擅长总结归纳，回答总是简明扼要。{'；'.join(self.prompts)}。",
            }
        ]
        messages.extend(self.history)

        self.result = await sparkai(
            messages,
            auth_pass=self.auth_pass,
            model=self.model,
            user=self.user,
            temperature=0.4,
            top_k=3,
            max_tokens=70,
        )
        self.add_history("assistant", self.result)

        return self.result
