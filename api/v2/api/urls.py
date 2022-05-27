"""URLs for the Guzek UK API."""
from django.urls import path, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

from . import views
from .models import Page


class PageSerialiser(serializers.ModelSerializer):
    """API representation serialiser for the page model."""

    class Meta:
        model = Page
        fields = ["url", "id", "title", "url", "hidden"]


class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "is_staff"]


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerialiser


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerialiser


router = routers.DefaultRouter()
router.register("pages", PageViewSet)
router.register("users", UserViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path("foo", views.foo),
]
