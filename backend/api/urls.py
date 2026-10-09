from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, BloodRequestViewSet, DonationViewSet, 
    DonorViewSet, AnalyticsViewSet, CampaignViewSet, 
    BloodInventoryViewSet, HospitalViewSet, BloodExchangeViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'donors', DonorViewSet, basename='donors')
router.register(r'hospitals', HospitalViewSet, basename='hospitals')
router.register(r'requests', BloodRequestViewSet, basename='requests')
router.register(r'donations', DonationViewSet)
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'campaigns', CampaignViewSet)
router.register(r'inventory', BloodInventoryViewSet, basename='inventory')
router.register(r'exchanges', BloodExchangeViewSet, basename='exchanges')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
