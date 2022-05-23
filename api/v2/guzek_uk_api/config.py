"""Loads the user configuration from the .env file and returns it in a dictionary."""
import os
from dotenv import load_dotenv

load_dotenv()

CONNECTION_LIMIT = os.getenv("MY_SQL_DB_CONNECTION_LIMIT", default="4")

data_sources = {
    "DB_HOST": os.getenv("MY_SQL_DB_HOST", default="127.0.0.1"),
    "DB_PORT": os.getenv("MY_SQL_DB_PORT", default="3306"),
    "DB_USER": os.getenv("MY_SQL_DB_USER", default="root"),
    "DB_PASSWORD": os.getenv("MY_SQL_DB_PASSWORD", default=""),
    "DB_NAME": os.getenv("MY_SQL_DB_NAME", default="database"),
    "DB_CONNECTION_LIMIT": int(CONNECTION_LIMIT),
}

DJANGO_KEY = os.getenv("DJANGO_KEY", default="")
