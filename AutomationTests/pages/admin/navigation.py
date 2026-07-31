from __future__ import annotations

import logging
from typing import Any, Iterable

from playwright.sync_api import Locator, Page, TimeoutError as PlaywrightTimeoutError


LOGGER = logging.getLogger("christian_listings.admin")


class AdminNavigation:
    def __init__(self, page: Page, navigation_timeout_ms: int):
        self.page = page
        self.navigation_timeout_ms = navigation_timeout_ms

    def _sidebar_item(self, label: str) -> Locator:
        sidebar = self.page.locator("aside, nav, [role='navigation']").first
        root = sidebar if sidebar.count() else self.page.locator("body")
        return root.get_by_text(label, exact=True).first

    def open_section(self, label: str, preview_wait_ms: int = 0) -> dict[str, Any]:
        LOGGER.info("Opening admin sidebar section: %s", label)
        locator = self._sidebar_item(label)
        if locator.count() == 0:
            LOGGER.error("Admin sidebar section was not found: %s", label)
            return {"success": False, "label": label, "url": self.page.url}

        locator.scroll_into_view_if_needed()
        locator.click()
        self.page.wait_for_load_state(
            "domcontentloaded", timeout=self.navigation_timeout_ms
        )
        try:
            self.page.wait_for_load_state(
                "networkidle", timeout=self.navigation_timeout_ms
            )
        except PlaywrightTimeoutError:
            self.page.locator("body").wait_for(
                state="visible", timeout=self.navigation_timeout_ms
            )
        self.page.wait_for_timeout(preview_wait_ms)
        LOGGER.info("Loaded admin section %s: %s", label, self.page.url)
        return {"success": True, "label": label, "url": self.page.url}

    def visit_sections(
        self, labels: Iterable[str], preview_wait_ms: int = 0
    ) -> list[dict[str, Any]]:
        return [self.open_section(label, preview_wait_ms) for label in labels]
