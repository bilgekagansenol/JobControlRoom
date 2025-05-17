from django.urls import path, include
from rest_framework.routers import DefaultRouter

from user_api import views

router = DefaultRouter()
router.register('profile', views.UserProfileViewSet, basename='userprofile')

urlpatterns = [
    # ViewSet için otomatik route'lar
    path('', include(router.urls)),

    # Login token alma
    path('login/', views.UserLoginApiView.as_view(), name='user-login'),

    # Şifre değiştirme
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # Şifre sıfırlama istek
    path('reset-password-request/', views.PasswordResetRequestView.as_view(), name='reset-password-request'),

    # Şifre sıfırlama onay
    path('reset-password-confirm/', views.PasswordResetConfirmView.as_view(), name='reset-password-confirm'),

    # Profil resmi güncelleme
    path('profile-image-update/', views.ProfileImageUpdateAPIView.as_view(), name='profile-image-update'),
]
