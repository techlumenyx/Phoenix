from __future__ import annotations

import logging

from playwright.sync_api import Page, Response, TimeoutError as PlaywrightTimeoutError, expect


LOGGER = logging.getLogger("christian_listings.browser")


class BasePage:
    """Shared, resilient browser behavior for both websites."""

    def __init__(
        self,
        page: Page,
        base_url: str,
        navigation_timeout_ms: int,
        element_timeout_ms: int,
    ):
        self.page = page
        self.base_url = base_url
        self.navigation_timeout_ms = navigation_timeout_ms
        self.element_timeout_ms = element_timeout_ms

    def open(self, url: str | None = None) -> Response:
        target = url or self.base_url
        LOGGER.info("Opening %s", target)
        response = self.page.goto(
            target,
            wait_until="domcontentloaded",
            timeout=self.navigation_timeout_ms,
        )
        assert response is not None, f"No HTTP response received from {target}"
        assert response.ok, f"{target} returned HTTP {response.status}"
        expect(self.page.locator("body")).to_be_visible(timeout=self.element_timeout_ms)
        self.wait_until_ready()
        LOGGER.info("Loaded %s (HTTP %s)", self.page.url, response.status)
        return response

    def wait_until_ready(self) -> None:
        try:
            self.page.wait_for_load_state(
                "networkidle", timeout=self.navigation_timeout_ms
            )
        except PlaywrightTimeoutError:
            expect(self.page.locator("body")).to_be_visible(
                timeout=self.element_timeout_ms
            )

    def assert_rendered(self) -> None:
        assert self.page.title().strip(), "Page title must not be empty"
        assert self.page.locator("body").inner_text().strip(), "Page rendered no text"
