# Environment Variables — Christian Listings

Copy `.env.example` to `.env` and fill in all values before running any service.

## All Backend Services

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | Full MongoDB Atlas connection string, including credentials. Format: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net` |
| `MONGO_DB_SUFFIX` | No | Appended to each subgraph's hardcoded db name (`cl_identity`, etc.) via `resolveDbName()` from `@christian-listings/db`. Lets multiple environments share one Atlas cluster without colliding — prod hardcodes `_prod` in `docker-compose.prod.yml`; staging and local dev leave it unset. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Firebase Admin SDK service account JSON, **base64-encoded**. Get from Firebase Console → Project Settings → Service Accounts → Generate new private key. Encode: `base64 -i serviceAccount.json` (Mac/Linux) |
| `PORT` | Yes | HTTP port the service listens on. Each service uses a different port (4001–4004). Set automatically by Docker Compose. |
| `NODE_ENV` | No | `development` or `production`. Defaults to `development`. |
| `INTERNAL_SERVICE_KEY` | Yes for admin workflows | Shared high-entropy backend-only secret used for authenticated subgraph-to-subgraph commands. It deliberately does not use the browser-injected `CL_` prefix. |
| `ADMIN_INTERNAL_URL` | Yes for identity and classifieds | Admin service HTTP base URL. Local default: `http://localhost:4004`; Docker: `http://admin:4004`. |
| `CLASSIFIEDS_INTERNAL_URL` | Yes for admin | Classifieds service HTTP base URL. Local default: `http://localhost:4003`; Docker: `http://classifieds:4003`. |
| `IDENTITY_INTERNAL_URL` | Yes for admin | Identity service HTTP base URL. Local default: `http://localhost:4001`; Docker: `http://identity:4001`. |
| `EVENTS_INTERNAL_URL` | Yes for admin | Events service HTTP base URL. Local default: `http://localhost:4002`; Docker: `http://events:4002`. |
| `ADMIN_ALLOWED_ORIGINS` | Yes in production | Comma-separated exact origins allowed to call the admin subgraph. Include both Firebase Hosting aliases (`*.web.app` and `*.firebaseapp.com`) and do not use wildcards. |
| `ADMIN_RATE_LIMIT_PER_MINUTE` | No | Per-admin GraphQL mutation limit. Defaults to 120 per minute and enforces a minimum of 10. |
| `APP_VERSION` / `GIT_SHA` | Recommended | Release identifiers displayed by the admin System Health page. |

## Transactional email (admin + worker)

Email intents are stored in `cl_admin`, queued with BullMQ, and delivered by `apps/worker` through whichever provider `EMAIL_PROVIDER` selects. The public web apps never receive provider credentials.

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_ENABLED` | No | Set to `true` only after the selected provider's sender/domain authentication is complete. Defaults to `false`; intents are recorded as suppressed and no message is sent. |
| `EMAIL_PROVIDER` | No | Delivery provider: `sendgrid`, `brevo`, or `ses`. Selects which block below `apps/worker`'s provider factory actually reads. |
| `REDIS_URL` | Yes for admin/worker when enabled | BullMQ Redis connection. Docker value: `redis://redis:6379`. |
| `SENDGRID_API_KEY` | Yes for worker when `EMAIL_PROVIDER=sendgrid` | Restricted SendGrid API key with Mail Send permission. Never expose this as a `CL_*` variable. |
| `SENDGRID_FROM_EMAIL` | Yes for worker when `EMAIL_PROVIDER=sendgrid` | Address under the authenticated sending domain. |
| `SENDGRID_FROM_NAME` | No | Display name; defaults to `Christian Listings`. |
| `SENDGRID_REPLY_TO` | No | Reply-to mailbox for transactional mail. |
| `SENDGRID_WEBHOOK_PUBLIC_KEY` | Yes in production when `EMAIL_PROVIDER=sendgrid` | ECDSA public key from SendGrid Event Webhook settings. The admin service rejects unsigned or invalid webhook requests. |
| `BREVO_API_KEY` | Yes for worker when `EMAIL_PROVIDER=brevo` | Brevo API key (**SMTP & API → API Keys**). Never expose this as a `CL_*` variable. |
| `BREVO_FROM_EMAIL` | Yes for worker when `EMAIL_PROVIDER=brevo` | Address on the Brevo-verified sending domain/identity. |
| `BREVO_FROM_NAME` | No | Display name; defaults to `Christian Listings`. |
| `BREVO_REPLY_TO` | No | Reply-to mailbox for transactional mail. |
| `BREVO_WEBHOOK_TOKEN` | Yes in production when `EMAIL_PROVIDER=brevo` | High-entropy secret you generate yourself (Brevo doesn't sign webhook payloads). Configured as the webhook's Bearer-token auth when creating it in Brevo; the admin service rejects any `/webhooks/brevo` call whose `Authorization` header doesn't match. |
| `AWS_REGION` | Yes for worker when `EMAIL_PROVIDER=ses` | Region the SES identity, SNS topic, and SQS queue live in. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Yes for worker when `EMAIL_PROVIDER=ses` | Dedicated least-privilege IAM user — `ses:SendEmail` on the verified identity, `sqs:ReceiveMessage`/`sqs:DeleteMessage`/`sqs:GetQueueAttributes` on the event queue. Never the account root or an admin user. |
| `SES_FROM_EMAIL` | Yes for worker when `EMAIL_PROVIDER=ses` | Must be on the SES-verified (DKIM'd) sending domain. |
| `SES_FROM_NAME` | No | Display name; defaults to `Christian Listings`. |
| `SES_REPLY_TO` | No | Reply-to mailbox for transactional mail. |
| `SES_CONFIGURATION_SET` | Yes for worker when `EMAIL_PROVIDER=ses` | SES configuration set with an event destination publishing Send/Delivery/Bounce/Complaint/Reject to the SNS topic — without this, sends succeed but delivery status never updates. |
| `SQS_EVENT_QUEUE_URL` | Yes for worker and admin when `EMAIL_PROVIDER=ses` | Full queue URL for the SQS subscription on that SNS topic. `apps/worker` long-polls this queue and forwards events to the admin service's `/internal/emails/ses-events` route; `apps/subgraph-admin` only checks that this is set to report `webhookConfigured` in `emailDeliveryConfiguration`. |
| `PUBLIC_APP_URL` | Yes | Public Christian Listings URL used in email links. Local value: `http://localhost:3000`. |
| `EMAIL_WORKER_CONCURRENCY` | No | Concurrent delivery jobs; defaults to 5. |
| `EMAIL_MAX_ATTEMPTS` | No | Exponential retry attempts; defaults to 5. |
| `EMAIL_RETRY_DELAY_MS` | No | Initial exponential retry delay; defaults to 5000 ms. |
| `EMAIL_SCHEDULE_SCAN_MS` | No | Due-schedule scan interval; defaults to 60000 ms. |

Redis runs with AOF persistence and `noeviction` in the supplied Compose files, as required for queue reliability.

## AI content risk analysis (classifieds + admin + worker)

Marketplace listing text is submitted asynchronously to a provider-neutral risk workflow. Gemini runs only in the worker. Results are advisory, are visible to trust-and-safety administrators, and never change listing visibility in shadow mode.

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_RISK_ENABLED` | No | Enables marketplace text analysis when `true`. Defaults to `false`. Must be set consistently for classifieds, admin and worker. |
| `AI_RISK_PROVIDER` | No | Provider identifier. Currently `gemini`. |
| `GEMINI_API_KEY` | Yes for worker when enabled | Server-only Gemini API key. Never expose it as a `CL_*` browser variable. |
| `GEMINI_MODEL` | No | Stable model identifier; defaults to `gemini-2.5-flash`. |
| `GEMINI_TIMEOUT_MS` | No | Per-request provider timeout; defaults to 30000 ms. |
| `AI_RISK_WORKER_CONCURRENCY` | No | Concurrent analysis jobs; defaults to 2. |
| `AI_RISK_MAX_ATTEMPTS` | No | Exponential retry attempts; defaults to 3. |
| `AI_RISK_RETRY_DELAY_MS` | No | Initial retry delay; defaults to 10000 ms. |

See `docs/AI-RISK-ANALYSIS.md` for activation and safety constraints.

## Remote database seeding

`SEED_ENVIRONMENT` and `SEED_REMOTE_CONFIRM` are temporary command-scoped safeguards for the one-off production Compose seed service. Do not store the confirmation permanently in `.env`. See `docs/SEEDING.md` for the exact commands.

**Note on `FIREBASE_SERVICE_ACCOUNT_JSON`:** The raw service account JSON contains newlines which break environment variable handling in many shells. Always base64-encode the entire file before setting this variable.

```bash
# Encoding (Mac/Linux):
base64 -i path/to/serviceAccount.json | tr -d '\n'

# Decoding (verification):
echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | base64 -d | head -5
```

## Media uploads (identity, events, classifieds and admin)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name. Found in Cloudinary Console → Settings |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CL_MEDIA_ALLOWED_ORIGINS` | No | Comma-separated browser origins allowed to call service media endpoints. |

The browser builds accept `CL_IDENTITY_MEDIA_URL`, `CL_EVENTS_MEDIA_URL`, `CL_CLASSIFIEDS_MEDIA_URL`, and `CL_ADMIN_MEDIA_URL`. Public media endpoints derive from the non-local `CL_GRAPHQL_URL` origin when not explicitly configured; local development defaults to the corresponding service ports.

## apps/gateway (Apollo Router)

These are hardcoded in `docker-compose.yml` using Docker's internal DNS. Only needed when running the gateway **outside Docker**.

| Variable | Default (Docker) | Description |
|----------|-----------------|-------------|
| `SUBGRAPH_IDENTITY_URL` | `http://identity:4001/graphql` | Internal URL of identity subgraph |
| `SUBGRAPH_EVENTS_URL` | `http://events:4002/graphql` | Internal URL of events subgraph |
| `SUBGRAPH_CLASSIFIEDS_URL` | `http://classifieds:4003/graphql` | Internal URL of classifieds subgraph |
| `SUBGRAPH_ADMIN_URL` | `http://admin:4004/graphql` | Internal URL of admin subgraph |

## apps/christian-listing and apps/cl-admin (Browser — Webpack)

**Must be prefixed `CL_`** to be included in the browser bundle via webpack `DefinePlugin`. Do not put secrets here.

| Variable | Required | Description |
|----------|----------|-------------|
| `CL_GRAPHQL_URL` | Yes | Gateway URL the browser sends GraphQL requests to. `http://localhost:4000/graphql` for local dev. |
| `CL_FIREBASE_API_KEY` | Yes | Firebase client API key. Found in Firebase Console → Project Settings → Your apps → Web app |
| `CL_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain. Format: `<project-id>.firebaseapp.com` |
| `CL_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `CL_FIREBASE_STORAGE_BUCKET` | No | Firebase Storage bucket. Format: `<project-id>.appspot.com` |
| `CL_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `CL_FIREBASE_APP_ID` | Yes | Firebase web app ID. Format: `1:<project-number>:web:<hash>` |

**Note:** Unlike Vite (which auto-includes `VITE_*` vars), webpack requires explicit injection. The `webpack.config.js` in each app reads all `CL_*` keys from `process.env` at build time and injects them via `DefinePlugin`. No other env vars are exposed to the browser.

## How Docker Compose Handles Secrets

Docker Compose reads from the root `.env` file automatically and injects variables into each container's `environment:` block. The `.env` file must be in the workspace root (same directory as `docker-compose.yml` is run from, i.e., `C:\Code\Phoenix`).

```bash
# From the workspace root:
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

# Docker Compose reads .env from the current working directory
```
