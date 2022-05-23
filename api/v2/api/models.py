"""Define Guzek UK API models."""
from django.db import models


class Page(models.Model):
    """Define website page model."""

    title = models.CharField(max_length=100)
    url = models.CharField(max_length=100)
    hidden = models.BooleanField()

    class Meta:  # pylint: disable=too-few-public-methods
        """Metadata for the database model."""

        db_table = "pages"
