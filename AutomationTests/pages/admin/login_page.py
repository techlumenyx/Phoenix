from __future__ import annotations

import logging
from typing import Any

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError

from pages.base_page import BasePage


LOGGER = logging.getLogger("christian_listings.admin")


class AdminLoginPage(BasePage):
    EMAIL_SELECTOR = (
        'input[type="email"], input[name*="email" i], '
        'input[autocomplete="username"]'
    )
    PASSWORD_SELECTOR = 'input[type="password"]'
    SUBMIT_SELECTOR = (
        'button[type="submit"], input[type="submit"], '
        'button:has-text("Login"), button:has-text("Log in"), '
        'button:has-text("Sign in")'
    )

    def __init__(
        self,
        page: Page,
        admin_url: str,
        navigation_timeout_ms: int,
        element_timeout_ms: int,
        auth_wait_ms: int,
    ):
        super().__init__(page, admin_url, navigation_timeout_ms, element_timeout_ms)
        self.auth_wait_ms = auth_wait_ms

    @property
    def email_field(self):
        return self.page.locator(self.EMAIL_SELECTOR).first

    @property
    def password_field(self):
        return self.page.locator(self.PASSWORD_SELECTOR).first

    @property
    def submit_button(self):
        return self.page.locator(self.SUBMIT_SELECTOR).first

    def is_login_form_visible(self) -> bool:
        return (
            self.email_field.count() > 0
            and self.password_field.count() > 0
            and self.submit_button.count() > 0
        )

    def login(self, email: str, password: str) -> dict[str, Any]:
        if not email or not password:
            return {
                "success": False,
                "url": self.page.url,
                "message": "ADMIN_EMAIL and ADMIN_PASSWORD must be configured",
            }

        LOGGER.info("Signing in to the admin website as %s", email)
        super().open()
        if not self.is_login_form_visible():
            return {
                "success": False,
                "url": self.page.url,
                "message": "Admin login form is not visible",
            }

        self.email_field.fill(email)
        self.password_field.fill(password)
        self.submit_button.click()
        self.page.wait_for_timeout(500)
        try:
            self.page.wait_for_function(
                "() => !document.body.innerText.toLowerCase().includes('verifying access')",
                timeout=self.auth_wait_ms,
            )
        except PlaywrightTimeoutError:
            pass
        self.wait_until_ready()

        current_url = self.page.url
        body_text = self.page.locator("body").inner_text().lower()
        success = "/login" not in current_url and "sign in to administration" not in body_text
        message = "Login succeeded" if success else "Login did not advance past the sign-in page"
        (LOGGER.info if success else LOGGER.error)("%s: %s", message, current_url)
        return {"success": success, "url": current_url, "message": message}
