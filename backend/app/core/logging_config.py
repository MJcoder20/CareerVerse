import logging

from logging.config import dictConfig


def setup_logging(log_level: str = "INFO") -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "standard": {
                    "format": (
                        "%(asctime)s | %(levelname)s | "
                        "%(name)s | %(message)s"
                    ),
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "standard",
                    "level": log_level.upper(),
                },
            },
            "root": {
                "handlers": ["console"],
                "level": log_level.upper(),
            },
        }
    )