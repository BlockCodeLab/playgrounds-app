from micropython import const
import _sparkai as sparkai
import random

ALPHABET = "qwertyuiopasdfghjklzxcvbnm1234567890"
MAX_HISTORY = const(6)


class Brain:
    def __init__(self, auth_pass=sparkai.APIPASSWORD, model="lite"):
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

        self.result = await sparkai.request(
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
