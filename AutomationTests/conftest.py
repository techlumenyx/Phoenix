from __future__ import annotations

from pathlib import Path

import pytest
from playwright.sync_api import Page

from config.settings import TestSettings


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--site",
        action="store",
        choices=("all", "public", "admin"),
        default="all",
        help="Run tests for both sites or only one site.",
    )
    parser.addoption(
        "--preview-wait",
        action="store",
        type=int,
        default=None,
        metavar="MILLISECONDS",
        help="Keep each navigation destination visible for this duration.",
    )


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    selected = config.getoption("--site")
    if selected == "all":
        return
    other = "admin" if selected == "public" else "public"
    skip = pytest.mark.skip(reason=f"Excluded by --site={selected}")
    for item in items:
        if other in item.keywords:
            item.add_marker(skip)


@pytest.fixture(scope="session")
def settings(pytestconfig: pytest.Config) -> TestSettings:
    configured = TestSettings.from_environment()
    cli_wait = pytestconfig.getoption("--preview-wait")
    if cli_wait is None:
        return configured
    return configured.with_preview_wait(cli_wait)


@pytest.fixture(scope="session")
def public_url(settings: TestSettings) -> str:
    return settings.public_url


@pytest.fixture(scope="session")
def admin_url(settings: TestSettings) -> str:
    return settings.admin_url


@pytest.fixture(autouse=True)
def production_safe_page(page: Page, request: pytest.FixtureRequest):
    console_errors: list[str] = []
    page_errors: list[str] = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    yield

    report = getattr(request.node, "rep_call", None)
    if report and report.failed:
        artifact_dir = Path("test-results")
        artifact_dir.mkdir(exist_ok=True)
        safe_name = request.node.nodeid.replace("/", "_").replace("::", "__")
        page.screenshot(path=artifact_dir / f"{safe_name}.png", full_page=True)
        (artifact_dir / f"{safe_name}.log").write_text(
            "Console errors:\n" + "\n".join(console_errors)
            + "\n\nPage errors:\n" + "\n".join(page_errors),
            encoding="utf-8",
        )


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    outcome = yield
    setattr(item, f"rep_{outcome.get_result().when}", outcome.get_result())
