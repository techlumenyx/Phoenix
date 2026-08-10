from __future__ import annotations

from pathlib import Path

from playwright.sync_api import expect

from pages.base_page import BasePage


class OrganisationAccountPage(BasePage):
    """Public organisation sign-up and initial organisation setup flow."""

    def create(
        self,
        email: str,
        password: str,
        phone: str,
        organisation_name: str,
        registration_number: str,
        contact_name: str,
        contact_title: str,
        verification_document: Path,
    ) -> None:
        self.open(f"{self.base_url.rstrip('/')}/org/signup")
        heading = self.page.get_by_role("heading", name="List your organization")
        expect(heading).to_be_visible(timeout=self.element_timeout_ms)

        self.page.get_by_placeholder("email@mail.com").fill(email)
        phone_field = self.page.get_by_placeholder("+44 12343355")
        if phone_field.count():
            phone_field.fill(phone)
        self.page.locator('input[type="password"]').fill(password)
        self.page.get_by_role("button", name="Create Account").click()

        name_field = self.page.get_by_placeholder(
            "eg. The Church of Yorkshire..."
        )
        expect(name_field).to_be_visible(timeout=self.navigation_timeout_ms)
        name_field.fill(organisation_name)
        self.page.locator("select").select_option(label="Church")
        self.page.get_by_placeholder(
            "Briefly describe your organization's purpose and the impact you seek to make..."
        ).fill(
            "Serving the local Christian community through worship, outreach, "
            "practical support, and community events."
        )
        self.page.get_by_role("button", name="Next Step", exact=False).click()

        registration_field = self.page.get_by_placeholder("eg. 12344ABC")
        expect(registration_field).to_be_visible(timeout=self.navigation_timeout_ms)
        registration_field.fill(registration_number)
        self.page.get_by_placeholder("Full Legal Name").nth(0).fill(organisation_name)
        self.page.get_by_placeholder("Full Legal Name").nth(1).fill(contact_name)
        self.page.get_by_placeholder("eg. Director").fill(contact_title)
        self.page.get_by_placeholder("name@organization.com").fill(email)

        assert verification_document.is_file(), (
            f"Verification document does not exist: {verification_document}"
        )
        self.page.locator('input[type="file"]').set_input_files(
            str(verification_document)
        )
        expect(self.page.get_by_text(verification_document.name, exact=False)).to_be_visible(
            timeout=self.element_timeout_ms
        )
        self.page.get_by_role(
            "button", name="Complete Registration", exact=False
        ).click()

        self.page.wait_for_url(
            lambda url: "/org/onboarding/verification" not in url,
            timeout=self.navigation_timeout_ms,
        )
