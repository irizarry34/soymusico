# messaging/urls.py
from django.urls import path
from .views import (
    MessageListCreateView, 
    MessageDetailView, 
    register_user, 
    get_user_uuid, 
    get_user_messages,
    send_message,
)

urlpatterns = [
    path('', MessageListCreateView.as_view(), name='message_list_create'),  # Ruta base para crear y listar mensajes
    path('<int:pk>/', MessageDetailView.as_view(), name='message_detail'),   # Ruta para los detalles de un mensaje específico
    path('register/', register_user, name='register_user'),
    path('get-user-uuid/', get_user_uuid, name='get_user_uuid'),
    path('user-messages/', get_user_messages, name='get_user_messages'),  # Ruta para obtener los mensajes del usuario
    path('send-message/', send_message, name='send_message'),
    
]