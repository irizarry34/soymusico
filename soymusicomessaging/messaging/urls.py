from django.urls import path
from .views import (
    MessageListCreateView, 
    MessageDetailView, 
    register_user, 
    get_user_uuid, 
    user_messages,  
    send_message,
    delete_message,
    check_new_messages,  # Importa la vista directamente
    mark_messages_as_read
)

urlpatterns = [
    path('', MessageListCreateView.as_view(), name='message_list_create'),
    path('<int:pk>/', MessageDetailView.as_view(), name='message_detail'),
    path('register/', register_user, name='register_user'),
    path('get-user-uuid/', get_user_uuid, name='get_user_uuid'),
    path('user-messages/', user_messages, name='user_messages'),
    path('send-message/', send_message, name='send_message'),
    path('delete-message/<int:message_id>/', delete_message, name='delete_message'),  # Llama delete_message directamente
    path('check-new-messages/', check_new_messages, name='check_new_messages'),  # Usa check_new_messages directamente
    path('mark-messages-as-read/', mark_messages_as_read, name='mark_messages_as_read'),
]