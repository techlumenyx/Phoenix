# Christian Listings end-to-end tests

Configurable Playwright/pytest automation for both Christian Listings surfaces:

- Public website: `https://christianlistings.com/`
- Administration website: `https://christian-listings-admin.firebaseapp.com/`

## Structure

```text
config/
  constants.py         Stable defaults, labels, and shared constants
  settings.py          Validated .env-backed runtime settings
pages/
  base_page.py         Shared navigation and readiness behavior
  admin/
    login_page.py      Admin authentication page object
    navigation.py      Admin sidebar component
  cl_website/
    home_page.py       Christian Listings public page object
tests/
  admin/               Admin tests, fixtures, and a test template
  cl_website/          Public tests, fixtures, and a test template
conftest.py            CLI options, fixtures, failure artifacts
```

## Installation

```powershell
python -m pip install -r requirements.txt
python -m playwright install chromium
```

Copy `.env.example` to `.env` and customize it. The framework loads `.env`
automatically; real shell or CI variables take precedence. `.env` is gitignored,
so credentials are not committed.

```powershell
$env:PUBLIC_URL = "https://christianlistings.com/"
$env:ADMIN_URL = "https://christian-listings-admin.firebaseapp.com/"
$env:ADMIN_EMAIL = "automation-account@example.com"
$env:ADMIN_PASSWORD = "secret-from-your-vault"
```

## Running tests

### Easy runner (recommended)

Use one command for any site and mode. Every run streams progress to the terminal
and writes a timestamped copy to `logs/`.

Console output is color-coded by log severity and test result. Saved log files
remain plain text without ANSI escape codes, making them suitable for searching,
CI artifacts, and log ingestion.

```powershell
# Both websites in CLI/headless mode
.\run-tests.ps1 -Site all -Mode cli

# Both websites in visible preview mode
.\run-tests.ps1 -Site all -Mode preview

# One website only
.\run-tests.ps1 -Site public -Mode cli
.\run-tests.ps1 -Site admin -Mode preview

# Customize the preview timing
.\run-tests.ps1 -Site admin -Mode preview -PreviewWait 5000 -SlowMo 750
```

Command Prompt shortcuts are also available. Pass `all`, `public`, or `admin`:

```bat
test-cli all
test-cli public
test-preview admin
test-preview all

# Create an organisation and verify it in admin in visible preview mode
test-account-preview

# Sign in with the latest organisation stored in logs/org-accounts.csv
test-org-login-preview

# Create a fully detailed recurring event and verify it in admin
test-event-preview
```

### Direct pytest commands

```powershell
# Both websites, headless (default for CI)
python -m pytest -v

# Public or admin only
python -m pytest --site public -v
python -m pytest --site admin -v

# Fast health checks
python -m pytest -m smoke -v

# Visible full admin sidebar preview; each page remains visible for 3 seconds
python -m pytest --site admin -m navigation --headed --slowmo 500 --preview-wait 3000 -v

# Failure tracing/video supported by pytest-playwright
python -m pytest --tracing retain-on-failure --video retain-on-failure -v
```

## Customization

All runtime configuration is environment-driven:

| Variable | Purpose | Default |
|---|---|---|
| `PUBLIC_URL` | Public-site base URL | Production public URL |
| `ADMIN_URL` | Admin-site base URL | Production admin URL |
| `ADMIN_EMAIL` | Admin automation account | Local compatibility value |
| `ADMIN_PASSWORD` | Admin automation password | Local compatibility value |
| `ORG_EMAIL_TEMPLATE` | Unique signup email; supports `{timestamp}` | `automation+{timestamp}@example.com` |
| `ORG_PASSWORD` | Password for the created organisation account | `Automation123!` |
| `ORG_PHONE` | Phone number entered during organisation signup | `+441234567890` |
| `ORG_NAME_PREFIX` | Prefix for the unique organisation name | `Automation Organisation` |
| `ADMIN_SECTIONS` | Comma-separated sidebar labels | Current 13 sections |
| `NAVIGATION_TIMEOUT_MS` | Page/network timeout | `30000` |
| `ELEMENT_TIMEOUT_MS` | Element visibility timeout | `10000` |
| `AUTH_WAIT_MS` | Admin authentication completion timeout | `30000` |
| `PREVIEW_WAIT_MS` | Pause after each sidebar page | `0` |

On failure, a full-page screenshot and browser-error log are written to
`test-results/`. Use a dedicated least-privilege account for authenticated tests.

The account-creation test writes real data to the configured environment. Run it
explicitly after setting dedicated organisation and admin credentials:

```powershell
python -m pytest -m account_creation -v
```

This test completes every onboarding and verification field, uploads the test
document in `test-data/`, and submits the registration. Successfully created
account credentials are appended to `logs/org-accounts.csv`. The `logs/`
directory is gitignored because this CSV contains passwords.

## Adding automation scripts

Keep selectors and reusable actions in page objects, and keep assertions in tests:

1. Add admin page objects under `pages/admin/`, or public page objects under
   `pages/cl_website/`.
2. Add the matching test under `tests/admin/` or `tests/cl_website/`.
3. Apply `pytest.mark.admin` or `pytest.mark.public` at module level so `--site`
   filtering works.
4. Reuse `authenticated_admin_page`, `admin_login_page`, or `cl_home_page` from
   each folder's `conftest.py`.
5. Copy the included `test_example_template.py.txt` file for a quick starting point.
