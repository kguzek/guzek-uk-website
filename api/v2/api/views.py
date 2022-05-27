"""Request handler for the Guzek UK API."""
from django.http import HttpRequest, HttpResponse
from django.core import serializers
from django.db.models import Model
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


def serialise(obj: Model | list[Model]) -> str:
    """Serialises the model iterable as a JSON array string."""

    # Can only serialise iterables containing models
    try:
        iter(obj)
    except TypeError:
        obj = [obj]

    return serializers.serialize("json", obj)


def foo(request: HttpRequest) -> HttpResponse:
    """Temporary debug function."""
    username = request.GET.get("username")
    return HttpResponse(username)
    # user = User.objects.get(username=username)
    # token = Token.objects.create(user=user)
    # return HttpResponse(token.key)


# def pages_handler(request: HttpRequest) -> HttpResponse:
#     """Determines which handler to use for the request."""
#     match request.method:
#         case "GET":
#             return get_all_pages()
#         case "POST":
#             return create_new_page(request)
#         case "PUT":
#             return edit_existing_page(request)
#         case "DELETE":
#             return delete_page(request)


# def get_all_pages() -> HttpResponse:
#     """Reads all pages from the database."""
#     response = serialise(Page.objects.all())
#     return HttpResponse(response, content_type="application/json")


# def create_new_page(request: HttpRequest) -> HttpResponse:
#     """Creates a new page in the database."""
#     print(request.body)
#     return HttpResponse("501")


# def edit_existing_page(request: HttpRequest) -> HttpResponse:
#     """Modifies an existing page in the database."""
#     return HttpResponse("501")


# def delete_page(request: HttpRequest) -> HttpResponse:
#     """Deletes an existing page from the database."""
#     return HttpResponse("501")
