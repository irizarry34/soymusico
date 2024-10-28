import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from soymusicomessaging.messaging.routing_ import websocket_urlpatterns
from messaging.middleware import JwtAuthMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soymusicomessaging.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddleware(
        AuthMiddlewareStack(  # Encadena con AuthMiddlewareStack si es necesario
            URLRouter(websocket_urlpatterns)
        )
    ),
})