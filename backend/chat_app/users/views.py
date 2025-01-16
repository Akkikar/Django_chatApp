# backend/users/views.py
from rest_framework import generics
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from rest_framework.views import APIView

class UserCreateView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        Token.objects.create(user=user)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        return Response({'token': token.key, 'user_id': token.user_id, 'username': token.user.username})

# backend/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

class UserListView(APIView):
    def get(self, request):
        try:
            User = get_user_model()
            users = User.objects.all()
            current_user = request.user  # Get the logged-in user
            users = users.exclude(id=current_user.id)  # Exclude the logged-in user
            user_data = [{"id": user.id, "username": user.username} for user in users]
            return Response(user_data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
