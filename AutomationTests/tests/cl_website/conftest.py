from __future__ import annotations

import pytest
from playwright.sync_api import Page

from config.settings import TestSettings
from pages.cl_website import ChristianListingsHomePage


@pytest.fixture
def cl_home_page(page: Page, settings: TestSettings) -> ChristianListingsHomePage:
    return ChristianListingsHomePage(
        page=page,
        base_url=settings.public_url,
        navigation_timeout_ms=settings.navigation_timeout_ms,
        element_timeout_ms=settings.element_timeout_ms,
    )
