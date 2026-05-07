from __future__ import annotations
from typing import Optional
from exponent_server_sdk import PushClient, PushMessage, PushServerError


def send_push_notification(expo_token: str, title: str, body: str, data: Optional[dict] = None) -> None:
    if not expo_token or not expo_token.startswith("ExponentPushToken"):
        return
    try:
        PushClient().publish(PushMessage(to=expo_token, title=title, body=body, data=data or {}))
    except PushServerError:
        pass


def notify_order_confirmed(expo_token: str, order_id: str) -> None:
    send_push_notification(expo_token, "Encomenda confirmada!", "A sua encomenda foi confirmada.", {"order_id": order_id})


def notify_order_out_for_delivery(expo_token: str, order_id: str) -> None:
    send_push_notification(expo_token, "Encomenda a caminho!", "A sua encomenda está em entrega.", {"order_id": order_id})


def notify_order_completed(expo_token: str, order_id: str) -> None:
    send_push_notification(expo_token, "Entrega concluída!", "A sua encomenda foi entregue. Obrigado!", {"order_id": order_id})
