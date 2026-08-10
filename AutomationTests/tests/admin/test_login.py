from __future__ import annotations

import re

import pytest
from playwright.sync_api import expect

from config.settings import TestSettings
from pages.admin import AdminLoginPage


pytestmark = pytest.mark.admin


@pytest.mark.smoke
def test_admin_site_is_healthy(admin_login_page: AdminLoginPage):
    response = admin_login_page.open()
    assert response.url.startswith("https://")
    admin_login_page.assert_rendered()


@pytest.mark.smoke
def test_admin_shows_login_or_authenticated_application(admin_login_page: AdminLoginPage):
    admin_login_page.open()
    page = admin_login_page.page
    auth = page.get_by_text(re.compile(r"sign[ -]?in|log[ -]?in", re.I))
    application = page.get_by_text(re.compile(r"administration|overview|users", re.I))
    assert page.locator('input[type="password"]').count() or auth.count() or application.count()


@pytest.mark.auth
def test_admin_login(admin_login_page: AdminLoginPage, settings: TestSettings):
    result = admin_login_page.login(settings.admin_email, settings.admin_password)
    assert result["success"], result["message"]


@pytest.mark.smoke
def test_login_form_accepts_input_without_submitting(admin_login_page: AdminLoginPage):
    admin_login_page.open()
    if not admin_login_page.is_login_form_visible():
        pytest.skip("No login form is visible; browser may already be authenticated")
    admin_login_page.email_field.fill("automation@example.invalid")
    admin_login_page.password_field.fill("not-a-real-password")
    expect(admin_login_page.email_field).to_have_value("automation@example.invalid")
    expect(admin_login_page.password_field).to_have_value("not-a-real-password")
