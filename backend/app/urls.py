from django.urls import path
from .views import MyTokenObtainPairView, createUser, usersList, userChat ,get_username

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='login'),  # Login (JWT token generation)
    path('user/create/', createUser, name='create_user'),           # Create User
    path('userslist/', usersList, name='users_list'),               # List all users
    path('chat/<str:username>/', userChat, name='user_chat'), 
    path('get-username/<int:user_id>/', get_username, name='get-username'),   # Chat with specific user
]
