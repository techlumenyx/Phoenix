from __future__ import annotations

import pytest

from config.org_credentials import latest_organisation_credentials
from config.settings import TestSettings
from pages.cl_website import OrganisationLoginPage


pytestmark = [pytest.mark.public, pytest.mark.org_login]


def test_login_with_existing_organisation_user(page, settings: TestSettings):
    credentials = latest_organisation_credentials()
    login = OrganisationLoginPage(
        page,
        settings.public_url,
        settings.navigation_timeout_ms,
        settings.element_timeout_ms,
    )
    login.login(credentials.email, credentials.password)
    assert credentials.email in page.locator("body").inner_text()
