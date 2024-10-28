# messaging/views.py

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import CustomUser, Message
from .serializers import MessageSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

# Vista para enviar un mensaje y notificar mediante WebSocket
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    sender = request.user
    recipient_id = request.data.get('recipient_id')
    body = request.data.get('body')

    if not recipient_id or not body:
        return Response({"error": "El destinatario y el cuerpo del mensaje son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

    recipient = get_object_or_404(CustomUser, id=recipient_id)
    message = Message.objects.create(sender=sender, recipient=recipient, body=body)

    # Notificar al grupo de WebSocket del destinatario
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"messages_user_{recipient_id}",
            {
                'type': 'new_message',
                'message': f"Nuevo mensaje de {sender.first_name} {sender.last_name}"
            }
        )
    except Exception as e:
        print(f"Error al enviar notificación de WebSocket: {e}")

    return Response({"message": "Mensaje enviado exitosamente"}, status=status.HTTP_201_CREATED)

# Vista para obtener el UUID del usuario basado en su correo electrónico (GET)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_uuid_by_email(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({"error": "Correo electrónico no proporcionado"}, status=400)

    user = User.objects.filter(email=email).first()
    if user:
        return JsonResponse({"uuid": str(user.uuid)}, status=200)
    else:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

# Vista para obtener el UUID del usuario basado en su correo electrónico mediante POST
@api_view(['POST'])
@permission_classes([AllowAny])
def get_user_uuid(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Correo electrónico no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email=email).first()
    if user:
        return Response({"uuid": str(user.id)}, status=status.HTTP_200_OK)  # `id` debe ser UUID
    else:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

# Vista para registrar un nuevo usuario
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')

    if not email or not password:
        return Response({'error': 'Correo electrónico y contraseña son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'El correo electrónico ya está en uso'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.create_user(
            email=email.lower(),
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return Response({'message': 'Usuario registrado exitosamente'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': 'Error del servidor al crear el usuario'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista API para listar y crear mensajes
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(recipient=user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

# Vista API para ver detalles de un mensaje específico
class MessageDetailView(generics.RetrieveAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))

# Vista API para obtener todos los mensajes del usuario autenticado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_messages(request):
    recipient_id = request.user.id
    messages = Message.objects.filter(recipient_id=recipient_id)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


# Añade esta vista en messaging/views.py si aún la necesitas

@api_view(['GET'])
@permission_classes([AllowAny])
def user_pk_view(request, uuid):
    try:
        user = CustomUser.objects.get(id=uuid)  # o `uuid=uuid` si `uuid` es un campo UUID distinto de `id`
        return JsonResponse({"pk": user.pk})
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)
