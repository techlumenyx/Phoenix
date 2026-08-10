from __future__ import annotations

from playwright.sync_api import expect

from pages.base_page import BasePage


class AdminEventDirectoryPage(BasePage):
    def open_and_find(self, event_title: str) -> None:
        self.open(f"{self.base_url.rstrip('/')}/content/events")
        expect(self.page.get_by_role("heading", name="Content directory")).to_be_visible(
            timeout=self.element_timeout_ms
        )
        self.page.get_by_placeholder("Search event records").fill(event_title)
        self.page.get_by_role("button", name="Search", exact=True).click()
        result = self.page.locator("tbody tr").filter(has_text=event_title)
        expect(result.first).to_be_visible(timeout=self.navigation_timeout_ms)
        assert result.count() >= 1, f"No admin event record found for {event_title}"
        expect(result.first).to_contain_text(event_title)
