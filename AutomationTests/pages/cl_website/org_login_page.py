from __future__ import annotations

from playwright.sync_api import expect

from pages.base_page import BasePage


class OrganisationLoginPage(BasePage):
    def login(self, email: str, password: str) -> None:
        self.open(f"{self.base_url.rstrip('/')}/org/signup")
        self.page.get_by_role("main").get_by_role(
            "button", name="Sign In", exact=True
        ).click()
        self.page.get_by_placeholder("email@mail.com").fill(email)
        self.page.locator('input[type="password"]').fill(password)
        self.page.get_by_role(
            "button", name="Sign In to your account", exact=False
        ).click()
        self.page.wait_for_url(
            lambda url: "/org/signup" not in url,
            timeout=self.navigation_timeout_ms,
        )
        expect(self.page.get_by_text("Admin Dashboard", exact=True)).to_be_visible(
            timeout=self.element_timeout_ms
        )
