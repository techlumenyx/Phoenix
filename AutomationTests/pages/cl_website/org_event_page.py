from __future__ import annotations

from datetime import datetime
from pathlib import Path

from playwright.sync_api import expect

from pages.base_page import BasePage


class OrganisationEventPage(BasePage):
    def create_complete_event(
        self, event_title: str, event_date: datetime, media_file: Path
    ) -> None:
        self.open(f"{self.base_url.rstrip('/')}/org/events")
        expect(self.page.get_by_role("heading", name="Events Manager")).to_be_visible(
            timeout=self.navigation_timeout_ms
        )
        form = self.page.locator("#create-event form")
        expect(form).to_be_visible(timeout=self.element_timeout_ms)

        form.get_by_placeholder("Give your event a clear, welcoming name...").fill(
            event_title
        )
        form.get_by_role("button", name="Community & Social", exact=True).click()
        form.get_by_placeholder(
            "Share the event description, for users to understand the vision and purpose behind the gathering..."
        ).fill(
            "A detailed community gathering with worship, teaching, refreshments, "
            "family activities, prayer, and practical outreach opportunities."
        )
        form.locator('input[type="date"]').first.fill(event_date.strftime("%Y-%m-%d"))
        form.locator('input[type="time"]').fill(event_date.strftime("%H:%M"))

        form.get_by_role("button", name="Hybrid", exact=True).click()
        form.get_by_placeholder("Street address or venue name").fill(
            "Christian Listings Community Hall, 25 Test Street, London"
        )
        form.get_by_placeholder("Online meeting link").fill(
            "https://meet.example.com/christian-listings-community-event"
        )

        form.get_by_text("Recurring event", exact=True).click()
        recurrence = form.locator("section").filter(has_text="Recurring event")
        recurrence.locator("select").select_option("WEEKLY")
        recurrence.locator('input[type="number"]').first.fill("1")
        recurrence.get_by_placeholder("Europe/London").fill("Europe/London")
        recurrence.get_by_role("button", name=event_date.strftime("%a"), exact=True).click()
        recurrence.locator('input[type="number"]').last.fill("3")

        form.get_by_placeholder("e.g. United Kingdom, Nigeria...").fill(
            "London, United Kingdom"
        )
        assert media_file.is_file(), f"Event media file does not exist: {media_file}"
        form.locator('input[type="file"]').set_input_files(str(media_file))
        expect(form.locator("img")).to_have_count(1, timeout=self.navigation_timeout_ms)

        form.get_by_placeholder("Leave blank for unlimited").fill("150")
        form.get_by_text("Enable automatic waitlist", exact=True).click()
        form.get_by_text("This is a Ticket Event", exact=True).click()
        form.get_by_placeholder("https://tickets.example.com/event").fill(
            "https://tickets.example.com/christian-listings-test-event"
        )
        form.get_by_text("Send Email Notifications to users", exact=False).click()

        form.get_by_role("button", name="Publish Event").click()
        expect(
            self.page.locator("#create-event").get_by_text(
                "Event published!", exact=True
            )
        ).to_be_visible(
            timeout=self.navigation_timeout_ms
        )
