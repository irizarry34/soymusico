import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            self.room_name = f"user_{self.scope['user'].id}"
            self.room_group_name = f"messages_{self.room_name}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            # Confirm connection
            await self.send(text_data=json.dumps({"status": "connected"}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action", "")
            
            if action == "send_message":
                message = data.get("message", "")
                sender_id = self.scope["user"].id

                # Enviar el mensaje al grupo del usuario
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "new_message",
                        "message": message,
                        "sender_id": sender_id
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def new_message(self, event):
        message = event["message"]
        sender_id = event["sender_id"]
        await self.send(text_data=json.dumps({"message": message, "sender_id": sender_id}))
