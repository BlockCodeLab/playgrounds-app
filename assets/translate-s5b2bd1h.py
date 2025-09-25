import _sparkai as sparkai

LANGUAGES = {
    "en": "English",
    "zh": "中文",
    "jp": "日本語",
    "ko": "한국어",
}


async def translate(text, lang, auth_pass=sparkai.APIPASSWORD, model="lite"):
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

    result = await sparkai.request(
        messages,
        auth_pass=auth_pass,
        model=model,
        temperature=0.4,
        top_k=3,
        max_tokens=70,
    )

    return result
