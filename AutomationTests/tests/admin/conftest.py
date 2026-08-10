from __future__ import annotations

import pytest
from playwright.sync_api import Page

from config.settings import TestSettings
from pages.admin import AdminLoginPage


@pytest.fixture
def admin_login_page(page: Page, settings: TestSettings) -> AdminLoginPage:
    return AdminLoginPage(
        page=page,
        admin_url=settings.admin_url,
        navigation_timeout_ms=settings.navigation_timeout_ms,
        element_timeout_ms=settings.element_timeout_ms,
        auth_wait_ms=settings.auth_wait_ms,
    )


@pytest.fixture
def authenticated_admin_page(admin_login_page: AdminLoginPage, settings: TestSettings):
    result = admin_login_page.login(settings.admin_email, settings.admin_password)
    assert result["success"], result["message"]
    return admin_login_page.page
