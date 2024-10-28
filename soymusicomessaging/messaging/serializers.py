from rest_framework import serializers
from .models import Message, CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)  
    recipient = UserSerializer(read_only=True)  # Mostrar detalles completos del destinatario para el inbox
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='recipient', write_only=True
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'recipient_id', 'body', 'timestamp', 'is_read']
        extra_kwargs = {
            'recipient': {'read_only': True},  
        }

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)