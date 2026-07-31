from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path


AUTOMATION_ROOT = Path(__file__).resolve().parents[1]
ORG_CREDENTIAL_LOG = AUTOMATION_ROOT / "logs" / "org-accounts.csv"


@dataclass(frozen=True)
class OrganisationCredentials:
    organisation_name: str
    email: str
    password: str


def latest_organisation_credentials() -> OrganisationCredentials:
    if not ORG_CREDENTIAL_LOG.is_file():
        raise AssertionError(
            "No organisation credentials log was found. Run test-account-preview first."
        )
    with ORG_CREDENTIAL_LOG.open(newline="", encoding="utf-8") as log_file:
        rows = list(csv.DictReader(log_file))
    if not rows:
        raise AssertionError(
            "The organisation credentials log is empty. Run the account creation test first."
        )
    latest = rows[-1]
    return OrganisationCredentials(
        organisation_name=latest["organisation_name"],
        email=latest["email"],
        password=latest["password"],
    )
