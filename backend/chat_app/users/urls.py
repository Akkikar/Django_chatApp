# backend/users/urls.py
from django.urls import path
from .views import UserCreateView, CustomAuthToken, UserListView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
]