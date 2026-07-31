from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path

import pytest

from config.settings import TestSettings
from pages.admin import AdminLoginPage, AdminOrganisationDirectoryPage
from pages.cl_website import OrganisationAccountPage


pytestmark = pytest.mark.account_creation

AUTOMATION_ROOT = Path(__file__).resolve().parents[1]
VERIFICATION_DOCUMENT = AUTOMATION_ROOT / "test-data" / "automation-verification.pdf"
CREDENTIAL_LOG = AUTOMATION_ROOT / "logs" / "org-accounts.csv"


def log_created_organisation(
    created_at: str, organisation_name: str, email: str, password: str
) -> None:
    """Append credentials only after organisation creation succeeds."""
    CREDENTIAL_LOG.parent.mkdir(parents=True, exist_ok=True)
    needs_header = not CREDENTIAL_LOG.exists() or CREDENTIAL_LOG.stat().st_size == 0
    with CREDENTIAL_LOG.open("a", newline="", encoding="utf-8") as log_file:
        writer = csv.writer(log_file)
        if needs_header:
            writer.writerow(["created_at_utc", "organisation_name", "email", "password"])
        writer.writerow([created_at, organisation_name, email, password])


def test_create_organisation_account_and_verify_it_in_admin(page, settings: TestSettings):
    """Create an organisation on the public site and find it in admin."""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    created_at = datetime.now(timezone.utc).isoformat()
    email = settings.org_email_template.format(timestamp=timestamp)
    organisation_name = f"{settings.org_name_prefix} {timestamp}"

    public = OrganisationAccountPage(
        page,
        settings.public_url,
        settings.navigation_timeout_ms,
        settings.element_timeout_ms,
    )
    public.create(
        email=email,
        password=settings.org_password,
        phone=settings.org_phone,
        organisation_name=organisation_name,
        registration_number=f"CL-AUTO-{timestamp}",
        contact_name="Jordan Test Administrator",
        contact_title="Community Director",
        verification_document=VERIFICATION_DOCUMENT,
    )
    log_created_organisation(
        created_at, organisation_name, email, settings.org_password
    )

    admin_login = AdminLoginPage(
        page,
        settings.admin_url,
        settings.navigation_timeout_ms,
        settings.element_timeout_ms,
        settings.auth_wait_ms,
    )
    login_result = admin_login.login(settings.admin_email, settings.admin_password)
    assert login_result["success"], login_result["message"]

    directory = AdminOrganisationDirectoryPage(
        page,
        settings.admin_url,
        settings.navigation_timeout_ms,
        settings.element_timeout_ms,
    )
    directory.open_and_find(organisation_name)
