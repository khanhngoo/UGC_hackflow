from typing import Any

import httpx


class TelegramBot:
    def __init__(self, token: str | None) -> None:
        self.token = token

    async def send_message(self, chat_id: int, text: str) -> dict[str, Any]:
        if not self.token:
            return {"ok": True, "chat_id": chat_id, "text": text, "local": True}

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{self.token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
            )
            response.raise_for_status()
            return response.json()

