import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            # Utilizar UUID en lugar de ID
            self.room_name = f"user_{self.scope['user'].uuid}"  # Cambiado a UUID
            self.room_group_name = f"messages_{self.room_name}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            # Confirmar conexión
            await self.send(text_data=json.dumps({"status": "connected"}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action", "")
            
            if action == "send_message":
                message = data.get("message", "")
                sender_uuid = str(self.scope["user"].uuid)  # Usar UUID

                # Enviar el mensaje al grupo del usuario
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "new_message",
                        "message": message,
                        "sender_uuid": sender_uuid  # Cambiado a UUID
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def new_message(self, event):
        message = event["message"]
        sender_uuid = event["sender_uuid"]  # Cambiado a UUID
        await self.send(text_data=json.dumps({"message": message, "sender_uuid": sender_uuid}))