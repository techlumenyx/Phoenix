from __future__ import annotations

import os
from dataclasses import dataclass, replace
from pathlib import Path

from dotenv import load_dotenv

from config.constants import (
    ADMIN_SIDEBAR_SECTIONS,
    DEFAULT_ADMIN_URL,
    DEFAULT_AUTH_WAIT_MS,
    DEFAULT_ELEMENT_TIMEOUT_MS,
    DEFAULT_NAVIGATION_TIMEOUT_MS,
    DEFAULT_PREVIEW_WAIT_MS,
    DEFAULT_PUBLIC_URL,
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env", override=False)


def _integer(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError as error:
        raise ValueError(f"{name} must be an integer, received {raw!r}") from error
    if value < 0:
        raise ValueError(f"{name} must be zero or greater")
    return value


def _csv(name: str, fallback: tuple[str, ...]) -> tuple[str, ...]:
    raw = os.getenv(name)
    return tuple(item.strip() for item in raw.split(",") if item.strip()) if raw else fallback


@dataclass(frozen=True)
class TestSettings:
    __test__ = False

    public_url: str
    admin_url: str
    admin_email: str
    admin_password: str
    org_email_template: str
    org_password: str
    org_phone: str
    org_name_prefix: str
    admin_sections: tuple[str, ...]
    navigation_timeout_ms: int
    element_timeout_ms: int
    auth_wait_ms: int
    preview_wait_ms: int

    @classmethod
    def from_environment(cls) -> "TestSettings":
        return cls(
            public_url=os.getenv("PUBLIC_URL", DEFAULT_PUBLIC_URL),
            admin_url=os.getenv("ADMIN_URL", DEFAULT_ADMIN_URL),
            admin_email=os.getenv("ADMIN_EMAIL", ""),
            admin_password=os.getenv("ADMIN_PASSWORD", ""),
            org_email_template=os.getenv(
                "ORG_EMAIL_TEMPLATE", "automation+{timestamp}@example.com"
            ),
            org_password=os.getenv("ORG_PASSWORD", "Automation123!"),
            org_phone=os.getenv("ORG_PHONE", "+441234567890"),
            org_name_prefix=os.getenv("ORG_NAME_PREFIX", "Automation Organisation"),
            admin_sections=_csv("ADMIN_SECTIONS", ADMIN_SIDEBAR_SECTIONS),
            navigation_timeout_ms=_integer(
                "NAVIGATION_TIMEOUT_MS", DEFAULT_NAVIGATION_TIMEOUT_MS
            ),
            element_timeout_ms=_integer(
                "ELEMENT_TIMEOUT_MS", DEFAULT_ELEMENT_TIMEOUT_MS
            ),
            auth_wait_ms=_integer("AUTH_WAIT_MS", DEFAULT_AUTH_WAIT_MS),
            preview_wait_ms=_integer("PREVIEW_WAIT_MS", DEFAULT_PREVIEW_WAIT_MS),
        )

    def with_preview_wait(self, milliseconds: int) -> "TestSettings":
        return replace(self, preview_wait_ms=milliseconds)
