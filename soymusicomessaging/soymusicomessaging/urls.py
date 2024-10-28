from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from messaging import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/register/', views.register_user, name='register_user'),
    path('api/user-pk/<uuid:uuid>/', views.user_pk_view, name='user_pk_view'),
    path('api/get-user-uuid/', views.get_user_uuid, name='get_user_uuid'),
    path('api/user-messages/', views.get_user_messages, name='get_user_messages'),
    path('api/', include('messaging.urls')),  # Mantén solo esta línea para incluir las rutas de `messaging`
]