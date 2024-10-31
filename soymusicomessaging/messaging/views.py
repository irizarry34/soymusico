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

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_new_messages(request):
    recipient_id = request.query_params.get('recipient_id')

    # Verificar si hay algún mensaje no leído sin cambiar el estado
    last_unread_message = (
        Message.objects.filter(recipient_id=recipient_id, is_read=False)
        .select_related('sender')
        .order_by('-timestamp')
        .first()
    )

    if last_unread_message:
        response_data = {
            "has_new_messages": True,
            "sender": {
                "first_name": last_unread_message.sender.first_name,
                "last_name": last_unread_message.sender.last_name,
                "email": last_unread_message.sender.email,
                "id": str(last_unread_message.sender.id)  # UUID del remitente
            }
        }
    else:
        response_data = {"has_new_messages": False}
    
    return JsonResponse(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_as_read(request):
    recipient_id = request.query_params.get('recipient_id')
    sender_id = request.query_params.get('sender_id')

    # Confirma que el usuario actual es el destinatario antes de marcar como leído
    if str(request.user.id) != recipient_id:
        return Response({"error": "No autorizado para marcar estos mensajes como leídos"}, status=status.HTTP_403_FORBIDDEN)
    
    # Actualiza solo los mensajes no leídos del remitente especificado
    Message.objects.filter(
        sender_id=sender_id,
        recipient_id=recipient_id,
        is_read=False
    ).update(is_read=True)
    
    return Response({"message": "Mensajes marcados como leídos"}, status=status.HTTP_200_OK)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    try:
        message = Message.objects.get(id=message_id, sender=request.user)
        message.delete()
        return JsonResponse({'message': 'Mensaje eliminado con éxito'}, status=200)
    except Message.DoesNotExist:
        return JsonResponse({'error': 'Mensaje no encontrado o permiso denegado'}, status=404)

# Vista para enviar un mensaje
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    sender = request.user
    recipient_id = request.data.get('recipient_id')
    body = request.data.get('body')

    if not recipient_id or not body:
        return Response({"error": "El destinatario y el cuerpo del mensaje son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

    recipient = get_object_or_404(CustomUser, id=recipient_id)
    
    try:
        message = Message.objects.create(sender=sender, recipient=recipient, body=body)
        return Response({"message": "Mensaje enviado exitosamente"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": f"Error al guardar el mensaje: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista para obtener el UUID del usuario basado en su correo electrónico mediante POST
@api_view(['POST'])
@permission_classes([AllowAny])
def get_user_uuid(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Correo electrónico no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email=email).first()
    if user:
        return Response({"uuid": str(user.id)}, status=status.HTTP_200_OK)
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

# Vista API para obtener todos los mensajes del usuario autenticado (como remitente o destinatario)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_messages(request):
    sender = request.user  # Usuario autenticado como remitente
    recipient_id = request.query_params.get('recipient_id')
    recipient = get_object_or_404(CustomUser, id=recipient_id)  # UUID de Django como destinatario

    # Filtra mensajes donde el sender y recipient son el currentUser y el recipient
    messages = Message.objects.filter(
        (Q(sender=sender) & Q(recipient=recipient)) |
        (Q(sender=recipient) & Q(recipient=sender))
    ).order_by('timestamp')

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

# Vista para obtener el primary key del usuario basado en UUID si es necesario
@api_view(['GET'])
@permission_classes([AllowAny])
def user_pk_view(request, uuid):
    try:
        user = CustomUser.objects.get(id=uuid)
        return JsonResponse({"pk": user.pk})
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)