from __future__ import annotations

from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class AdminOrganisationDirectoryPage(BasePage):
    """Admin organisation directory search."""

    def open_and_find(self, organisation_name: str) -> None:
        self.open(f"{self.base_url.rstrip('/')}/organisations")
        expect(self.page.get_by_role("heading", name="Organisation accounts")).to_be_visible(
            timeout=self.element_timeout_ms
        )
        self.page.get_by_placeholder("Search organisation records").fill(
            organisation_name
        )
        self.page.get_by_role("button", name="Search", exact=True).click()

        result = self.page.locator("tbody tr").filter(has_text=organisation_name)
        expect(result).to_have_count(1, timeout=self.navigation_timeout_ms)
        expect(result.first).to_contain_text(organisation_name)
