"""Request handler for the Guzek UK API."""
from django.http import HttpRequest, HttpResponse
from django.core import serializers
from django.db.models import Model
from .models import Page


def serialise(obj: Model | list[Model]) -> str:
    """Serialises the model iterable as a JSON array string."""
    return serializers.serialize("json", obj)


def pages_handler(request: HttpRequest) -> HttpResponse:
    """Determines which handler to use for the request."""
    if request.method == "GET":
        return get_all_pages()


def get_all_pages() -> HttpResponse:
    """Reads all pages from the database."""
    response = serialise(Page.objects.all())
    return HttpResponse(response, content_type="application/json")
