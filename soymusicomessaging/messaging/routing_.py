# messaging/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/messages/(?P<user_id>[0-9a-f-]+)/$', consumers.MessageConsumer.as_asgi()),  # Ajusta según sea necesario
]