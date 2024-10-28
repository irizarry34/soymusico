# messaging/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/messages/(?P<user_id>\w+)/$', consumers.MessageConsumer.as_asgi()),
]