"""URLs for the Guzek UK API."""
from django.urls import path
from . import views

urlpatterns = [path("", views.pages_handler)]
