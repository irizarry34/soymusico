from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from messaging.models import CustomUser
from channels.middleware import BaseMiddleware
import logging
from django.middleware.security import SecurityMiddleware

class CustomCSPMiddleware(SecurityMiddleware):
    def process_response(self, request, response):
        response['Content-Security-Policy'] = "connect-src 'self' ws://localhost:8000"
        return response


# Configuración del logger para el middleware
logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_key):
    try:
        token = AccessToken(token_key)
        user = CustomUser.objects.get(id=token["user_id"])
        logger.info(f"Usuario autenticado: {user}")
        return user
    except Exception as e:
        logger.error(f"Error autenticando usuario con token: {e}")
        return AnonymousUser()

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        query_string = scope.get("query_string").decode()
        token_key = None

        # Extrae el token desde el encabezado de autorización si está presente
        if b"authorization" in headers:
            token_name, token_key = headers[b"authorization"].decode().split()
            if token_name != "Bearer":
                token_key = None  # Ignorar si el token no es tipo "Bearer"
        
        # Extrae el token desde la URL si no está en los encabezados
        if not token_key and "token=" in query_string:
            token_key = query_string.split("token=")[1]
        
        # Log para verificar el token extraído
        logger.info(f"Token extraído: {token_key}")

        # Valida el token y asigna el usuario en el scope
        if token_key:
            scope["user"] = await get_user_from_token(token_key)
            logger.info(f"Usuario autenticado en WebSocket scope: {scope['user']}")
        else:
            scope["user"] = AnonymousUser()
            logger.info("Usuario asignado como AnonymousUser debido a falta de token")

        return await super().__call__(scope, receive, send)