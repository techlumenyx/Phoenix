from __future__ import annotations

import logging
from urllib.parse import urljoin, urlparse

from playwright.sync_api import Page

from config.constants import IGNORED_LINK_PREFIXES
from pages.base_page import BasePage


LOGGER = logging.getLogger("christian_listings.public")


class ChristianListingsHomePage(BasePage):
    def __init__(
        self,
        page: Page,
        base_url: str,
        navigation_timeout_ms: int,
        element_timeout_ms: int,
    ):
        super().__init__(page, base_url, navigation_timeout_ms, element_timeout_ms)

    def visible_same_origin_links(self) -> list[str]:
        origin = urlparse(self.base_url).netloc
        hrefs = self.page.locator("a[href]").evaluate_all(
            "els => els.filter(e => e.offsetParent !== null).map(e => e.getAttribute('href'))"
        )
        links: list[str] = []
        for href in hrefs:
            if not href or href.startswith(IGNORED_LINK_PREFIXES):
                continue
            target = urljoin(self.base_url, href)
            if urlparse(target).netloc == origin and target not in links:
                links.append(target)
        return links

    def broken_links(self) -> list[tuple[str, int]]:
        links = self.visible_same_origin_links()
        LOGGER.info("Checking %s visible same-origin public links", len(links))
        broken: list[tuple[str, int]] = []
        for target in links:
            response = self.page.request.get(target, timeout=self.navigation_timeout_ms)
            LOGGER.info("Link HTTP %s: %s", response.status, target)
            if response.status >= 400:
                broken.append((target, response.status))
        return broken
