from __future__ import annotations

import pytest

from config.settings import TestSettings
from pages.admin import AdminNavigation


pytestmark = [pytest.mark.admin, pytest.mark.navigation]


def test_all_configured_sidebar_sections(authenticated_admin_page, settings: TestSettings):
    navigation = AdminNavigation(
        authenticated_admin_page, settings.navigation_timeout_ms
    )
    results = navigation.visit_sections(
        settings.admin_sections, preview_wait_ms=settings.preview_wait_ms
    )
    assert len(results) == len(settings.admin_sections)
    assert all(result["success"] for result in results), results
