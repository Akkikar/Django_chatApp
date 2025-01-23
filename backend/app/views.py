from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, MessageSerializer
from .models import Message
from django.db.models import Q
from django.http import JsonResponse
from django.db import IntegrityError
from rest_framework.pagination import PageNumberPagination


# TokenObtainPairView (No need to extend unless you want custom behavior)
class MyTokenObtainPairView(TokenObtainPairView):
    """Handle JWT token generation."""
    pass


# Create a new user
@api_view(['POST'])
def createUser(request):
    """Create a new user."""
    data = request.data
    try:
        user = User.objects.create_user(username=data['username'], password=data['password'])
        serializer = UserSerializer(user)
        return Response(serializer.data, status=201)
    except IntegrityError:
        return Response({"error": "Username already exists."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# Pagination for the users list
class UserListPagination(PageNumberPagination):
    page_size = 10  # Adjust the number of users per page


# Fetch all users except the authenticated user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usersList(request):
    """Fetch all users except the authenticated user."""
    users = User.objects.exclude(id=request.user.id)
    paginator = UserListPagination()
    paginated_users = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(paginated_users, many=True)
    return paginator.get_paginated_response(serializer.data)


# Retrieve or send messages between the authenticated user and the selected user
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def userChat(request, username):
    """Retrieve or send messages between the authenticated user and the selected user."""
    sender = request.user
    try:
        receiver = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Receiver user not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Fetch messages between the two users
        messages = Message.objects.filter(
            (Q(sender=sender) & Q(receiver=receiver)) |
            (Q(sender=receiver) & Q(receiver=sender))
        ).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        # Send a new message to the selected user
        data = request.data
        if 'content' not in data:
            return Response({"error": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            content=data['content']
        )
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Get the username by user ID
def get_username(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({'username': user.username})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
