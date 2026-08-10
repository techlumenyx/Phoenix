from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from config.org_credentials import latest_organisation_credentials
from config.settings import TestSettings
from pages.admin import AdminEventDirectoryPage, AdminLoginPage
from pages.cl_website import OrganisationEventPage, OrganisationLoginPage


pytestmark = pytest.mark.event_creation
PROJECT_ROOT = Path(__file__).resolve().parents[2]
EVENT_MEDIA = PROJECT_ROOT / "apps" / "christian-listing" / "src" / "assets" / "event-theology.png"


def test_create_complete_event_and_verify_it_in_admin(page, settings: TestSettings):
    credentials = latest_organisation_credentials()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    event_title = f"Automation Community Event {timestamp}"
    event_date = datetime.now().replace(second=0, microsecond=0) + timedelta(days=7)

    login = OrganisationLoginPage(
        page, settings.public_url, settings.navigation_timeout_ms, settings.element_timeout_ms
    )
    login.login(credentials.email, credentials.password)

    event_page = OrganisationEventPage(
        page, settings.public_url, settings.navigation_timeout_ms, settings.element_timeout_ms
    )
    event_page.create_complete_event(event_title, event_date, EVENT_MEDIA)

    admin_login = AdminLoginPage(
        page,
        settings.admin_url,
        settings.navigation_timeout_ms,
        settings.element_timeout_ms,
        settings.auth_wait_ms,
    )
    result = admin_login.login(settings.admin_email, settings.admin_password)
    assert result["success"], result["message"]

    admin_events = AdminEventDirectoryPage(
        page, settings.admin_url, settings.navigation_timeout_ms, settings.element_timeout_ms
    )
    admin_events.open_and_find(event_title)
