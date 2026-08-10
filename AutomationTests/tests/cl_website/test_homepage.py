from __future__ import annotations

import pytest

from pages.cl_website import ChristianListingsHomePage


pytestmark = pytest.mark.public


@pytest.mark.smoke
def test_homepage_is_healthy(cl_home_page: ChristianListingsHomePage):
    response = cl_home_page.open()
    assert response.url.startswith("https://")
    cl_home_page.assert_rendered()


@pytest.mark.smoke
def test_homepage_has_navigation_or_action(cl_home_page: ChristianListingsHomePage):
    cl_home_page.open()
    interactive = cl_home_page.page.locator(
        "a[href], button, input:not([type=hidden]), select, textarea"
    )
    assert interactive.count() > 0, "No navigation or interactive action was found"


@pytest.mark.links
def test_visible_internal_links_are_healthy(cl_home_page: ChristianListingsHomePage):
    cl_home_page.open()
    broken = cl_home_page.broken_links()
    assert not broken, f"Broken public links: {broken}"
