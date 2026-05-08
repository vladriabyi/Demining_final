import httpx
from app.core.config import settings


async def send_notification(message: str) -> None:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json={
                "chat_id": settings.TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML",
            })
    except Exception:
        pass


async def notify_request_updated(
    request_id: int,
    title: str,
    location_name: str,
    assignee_name: str | None,
    status: str,
) -> None:
    assignee_line = assignee_name or "не призначено"
    status_map = {
        "pending": "Очікує",
        "under_review": "На розгляді",
        "approved": "Затверджено",
        "in_progress": "Виконується",
        "completed": "Завершено",
        "rejected": "Відхилено",
    }
    status_label = status_map.get(status, status)
    text = (
        f"📋 Заявка #{request_id}: {title}\n"
        f"📍 {location_name}\n"
        f"👤 Призначено: {assignee_line}\n"
        f"🔄 Статус: {status_label}"
    )
    await send_notification(text)
