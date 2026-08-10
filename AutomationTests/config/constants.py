"""Stable framework defaults. Override environment-specific values in .env."""

DEFAULT_PUBLIC_URL = "https://christian-listing.web.app/"
DEFAULT_ADMIN_URL = "https://christian-listings-admin.firebaseapp.com/"

DEFAULT_NAVIGATION_TIMEOUT_MS = 30_000
DEFAULT_ELEMENT_TIMEOUT_MS = 10_000
DEFAULT_AUTH_WAIT_MS = 30_000
DEFAULT_PREVIEW_WAIT_MS = 0
DEFAULT_SLOW_MO_MS = 500

ADMIN_SIDEBAR_SECTIONS = (
    "Overview",
    "Moderation",
    "AI risk signals",
    "Verifications",
    "Users",
    "Organisations",
    "Content",
    "Analytics",
    "Audit log",
    "Templates",
    "Email delivery",
    "Highlights",
    "System health",
)

IGNORED_LINK_PREFIXES = ("#", "mailto:", "tel:", "javascript:")
