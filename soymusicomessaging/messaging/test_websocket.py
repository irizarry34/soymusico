import asyncio
import websockets
import json

async def test_connection():
    user_uuid = "YOUR_USER_UUID"  # Reemplaza con el UUID del usuario
    token = "YOUR_TOKEN"  # Reemplaza con tu token real
    uri = f"ws://localhost:8000/ws/inbox/{user_uuid}/?token={token}"

    try:
        async with websockets.connect(uri) as websocket:
            print("Conexión WebSocket establecida")

            # Enviar un mensaje de prueba
            message = {
                "action": "send_message",
                "message": "Hola desde el cliente de prueba!"
            }
            await websocket.send(json.dumps(message))
            print("Mensaje enviado:", message)

            # Escuchar por mensajes de respuesta
            while True:
                response = await websocket.recv()
                print("Mensaje recibido:", response)

    except Exception as e:
        print(f"Error en la conexión WebSocket: {e}")

# Ejecutar el bucle de eventos
if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(test_connection())