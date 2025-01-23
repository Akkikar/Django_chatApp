import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Message  # Ensure proper import at the top

# Set up logging
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get username from the URL
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_name = f"chat_{self.username}"  # Sender's WebSocket room
        self.room_group_name = f"chat_{self.username}"

        # Log the connection attempt
        logger.debug(f"User {self.username} is connecting to room: {self.room_group_name}")

        # Add the user to the WebSocket group (sender)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Optionally, handle receiver's WebSocket group logic
        self.receiver = None  # This should be passed dynamically (for example, via URL params or message payload)
        if self.receiver:
            recipient_room = f"chat_{self.receiver}"  # Receiver's WebSocket group
            logger.debug(f"User {self.username} is added to {recipient_room}")
            await self.channel_layer.group_add(
                recipient_room,
                self.channel_name
            )

    async def disconnect(self, close_code):
        # Remove the user from their WebSocket group on disconnect
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Optionally remove the receiver from their WebSocket group
        if self.receiver:
            recipient_room = f"chat_{self.receiver}"
            logger.debug(f"User {self.username} is removed from {recipient_room}")
            await self.channel_layer.group_discard(
                recipient_room,
                self.channel_name
            )

    async def receive(self, text_data):
        """
        Handle receiving a message from the WebSocket client.
        """
        data = json.loads(text_data)
        content = data.get('content')  # Message content
        sender = data.get('sender')  # Sender's username
        receiver = data.get('receiver')  # Receiver's username

        # Log incoming message data
        logger.debug(f"Received message from {sender} to {receiver}: {content}")

        if sender and receiver and content:
            # Save the message to the database asynchronously
            await self.save_message(sender, receiver, content)

            # Broadcast the message to the receiver's WebSocket group
            recipient_room = f"chat_{receiver}"  # Receiver's room name
            logger.debug(f"Sending message to {recipient_room} with content: {content}")
            await self.channel_layer.group_send(
                recipient_room,
                {
                    'type': 'chat_message',
                    'content': content,
                    'sender': sender,
                }
            )

    async def chat_message(self, event):
        """
        Handle sending a message to the WebSocket client.
        """
        content = event['content']
        sender = event['sender']
        logger.debug(f"Sending message to WebSocket: {sender}: {content}")
        await self.send(text_data=json.dumps({
            'content': content,
            'sender': sender,
        }))

    @staticmethod
    async def save_message(sender, receiver, content):
        """
        Save the message to the database.
        """
        try:
            # Ensure async database operation using sync_to_async
            await sync_to_async(Message.objects.create)(sender=sender, receiver=receiver, content=content)
            logger.debug(f"Message from {sender} to {receiver} saved successfully")
        except Exception as e:
            # Log the error if saving fails
            logger.error(f"Error saving message: {e}")
