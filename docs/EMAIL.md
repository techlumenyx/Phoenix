# Transactional Email

Christian Listings sends transactional email through a pluggable provider (SendGrid, Brevo, or AWS SES, selected by `EMAIL_PROVIDER`) with BullMQ on Redis for durable background processing. Business subgraphs submit email intents to authenticated admin HTTP endpoints; they never call the provider directly.

## Runtime flow

1. Identity, events, classifieds, or admin completes its primary database mutation.
2. The service submits a template key, recipient, variables, source metadata, and idempotency key to `POST /internal/emails`.
3. Admin renders the code-owned template and stores an `EmailDelivery` or `ScheduledEmail` record in `cl_admin`.
4. BullMQ places immediate messages on `email-delivery`. A BullMQ Job Scheduler scans due schedules every minute.
5. `apps/worker` calls the configured provider (`apps/worker/src/providers/`) and records `ACCEPTED`. Final `SENT`/`FAILED` outcomes are recorded later by the provider's own event pipeline: SendGrid's or Brevo's webhook (signed for SendGrid; Bearer-token authenticated for Brevo, since Brevo doesn't sign payloads), or — for SES — the SNS→SQS events `apps/worker`'s poller (`ses-event-poller.ts`) long-polls and forwards to admin's `/internal/emails/ses-events` route.
6. Support and audit administrators inspect history and retry failed deliveries at `/email-deliveries` in the admin application.

The primary user action is not rolled back when email orchestration is unavailable. Idempotency keys prevent duplicate intents, and an accepted message is not resent merely because its status callback temporarily fails.

Queue reconciliation runs at admin startup and once per minute. It restores stale scheduled claims and re-adds persisted `QUEUED` deliveries using stable BullMQ job IDs. Successfully recorded jobs are removed; jobs whose provider result could not be recorded are retained to prevent an unsafe duplicate send. Every outbound message carries the internal delivery ID as a provider tag/custom-arg (`cl_delivery_id`) so a delayed or replayed event can still complete delivery state after a callback outage.

## Initial triggers

- Organisation invitation and resend
- Job application receipt for the applicant
- New job application notice for the organisation contact
- Event RSVP confirmation, waitlist/status change, and cancellation
- 24-hour event reminder for confirmed RSVPs, cancelled when the RSVP changes
- Organisation verification submission and decision updates

## Local development

Keep `EMAIL_ENABLED=false`. Email intents are stored with `SUPPRESSED` status and no external email is sent. The worker stays idle without opening Redis or provider connections, so `npm run dev:all` does not require a local Redis installation in disabled mode. Redis and the active worker are included in the Docker Compose stack for real delivery.

To exercise real delivery locally, set `EMAIL_PROVIDER` to the provider you're testing, provide all of that provider's variables from `docs/ENVIRONMENT.md`, start Redis, and set `EMAIL_ENABLED=true`. Use only a dedicated development sender and recipient.

## Choosing a provider

`EMAIL_PROVIDER` selects which block of variables in `docs/ENVIRONMENT.md` `apps/worker`'s provider factory (`apps/worker/src/providers/index.ts`) actually reads — `sendgrid`, `brevo`, or `ses`. Only one provider is active per environment; the unused providers' variables are ignored. SendGrid remains the default; Brevo is the current target now that SendGrid's free tier is exhausted (no AWS-style infrastructure needed — API key + a webhook, same shape as SendGrid); SES's code is built and tested but sits dormant — pursue it later only if per-email cost at real scale outweighs the AWS setup overhead.

## Production activation — SendGrid

1. Authenticate the sending domain in SendGrid and create a restricted API key with Mail Send permission.
2. Configure the SendGrid environment variables documented in `docs/ENVIRONMENT.md` on the Hetzner server.
3. Add the dedicated Nginx route below, then configure the SendGrid Event Webhook URL as `https://christian-listings.duckdns.org/webhooks/sendgrid`, enable signature verification, and store its ECDSA public key as `SENDGRID_WEBHOOK_PUBLIC_KEY`.
4. Deploy with `EMAIL_ENABLED=false` and confirm that the worker, Redis, admin, and system-health checks are stable.
5. Set `EMAIL_ENABLED=true`, redeploy the admin and worker containers, and send one controlled organisation invitation.
6. Confirm the delivery moves through `QUEUED` → `ACCEPTED` → `SENT` in the admin Email delivery page.

The webhook must bypass the Apollo Router and reach the admin service directly:

```nginx
location = /webhooks/sendgrid {
    proxy_pass http://localhost:4004/webhooks/sendgrid;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Run `sudo nginx -t` before reloading Nginx.

## Production activation — Brevo

Brevo needs no AWS-style infrastructure — just an API key and a webhook, the same shape as SendGrid's setup. Brevo does not sign its webhook payloads (no HMAC, no signature header); instead the webhook is created with Bearer-token auth, and Brevo sends that exact token back on every call, which is what `verifyBrevoWebhook` checks.

1. Verify a sending domain (or single sender address) in Brevo and add its SPF/DKIM DNS records. `BREVO_FROM_EMAIL` must be on this verified identity.
2. Generate an API key (**SMTP & API → API Keys**) for `BREVO_API_KEY`.
3. Pick a random high-entropy string for `BREVO_WEBHOOK_TOKEN` (e.g. `openssl rand -hex 32`) — this is your own secret, not something Brevo gives you.
4. Create the webhook (**Transactional → Settings → Webhooks**, or via the [Create a webhook](https://developers.brevo.com/reference/create-webhook) API): URL `https://christian-listings.duckdns.org/webhooks/brevo`, type `transactional`, events `delivered`, `hard_bounce`, `soft_bounce`, `blocked`, `spam`, `invalid_email`, and set `auth: { type: "bearer", token: "<BREVO_WEBHOOK_TOKEN>" }` so it authenticates with the same token.
5. Add the dedicated Nginx route below so the webhook reaches the admin service directly, bypassing the Apollo Router.
6. Configure the Brevo environment variables documented in `docs/ENVIRONMENT.md` on the Hetzner server, with `EMAIL_PROVIDER=brevo` and `EMAIL_ENABLED=false` initially.
7. Deploy and confirm the worker, Redis, admin, and system-health checks are stable, and that worker logs show `email queues ready; provider=brevo`.
8. Set `EMAIL_ENABLED=true`, redeploy the admin and worker containers, and send one controlled organisation invitation to an address you control.
9. Confirm the delivery moves through `QUEUED` → `ACCEPTED` → `SENT` in the admin Email delivery page.

```nginx
location = /webhooks/brevo {
    proxy_pass http://localhost:4004/webhooks/brevo;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Run `sudo nginx -t` before reloading Nginx.

## Production activation — AWS SES

Unlike SendGrid's webhook, SES event delivery does not need a public route: `apps/worker` polls SQS directly, so nothing in Nginx or the Apollo Router needs to change to add SES.

1. **Verify the sending identity.** In SES, verify the sending domain (preferred) or a single sender address, and complete its DKIM setup. `SES_FROM_EMAIL` must be on this verified identity or sends are rejected.
2. **Move the account out of the SES sandbox** (production access request in the SES console) — sandboxed accounts can only send to verified recipient addresses, which is fine for the initial send test but not for real traffic.
3. **Create an SNS topic** (e.g. `cl-ses-events`) and an **SES configuration set** with an event destination that publishes `Send`, `Delivery`, `Bounce`, `Complaint`, and `Reject` events to that topic. Note the configuration set name as `SES_CONFIGURATION_SET`.
4. **Create an SQS queue** (e.g. `cl-ses-events-queue`) and subscribe it to the SNS topic (raw message delivery can stay off — the poller unwraps the SNS envelope itself). Use the queue's URL as `SQS_EVENT_QUEUE_URL`.
5. **Create a dedicated IAM user** for the worker with only the permissions below — never the account root or an existing admin user. Generate an access key pair for `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "SendFromVerifiedIdentity",
         "Effect": "Allow",
         "Action": "ses:SendEmail",
         "Resource": "arn:aws:ses:<region>:<account-id>:identity/<verified-domain-or-email>"
       },
       {
         "Sid": "ConsumeSesEventQueue",
         "Effect": "Allow",
         "Action": ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
         "Resource": "arn:aws:sqs:<region>:<account-id>:<queue-name>"
       }
     ]
   }
   ```

6. Configure the SES environment variables documented in `docs/ENVIRONMENT.md` on the Hetzner server (or in `docker-compose.staging.yml`'s env file for staging), with `EMAIL_PROVIDER=ses` and `EMAIL_ENABLED=false` initially.
7. Deploy and confirm the worker, Redis, admin, and system-health checks are stable, and that worker logs show `email queues ready; provider=ses` with no SES poller errors.
8. Set `EMAIL_ENABLED=true`, redeploy the admin and worker containers, and send one controlled organisation invitation to an address you control.
9. Confirm the delivery moves through `QUEUED` → `ACCEPTED` → `SENT` in the admin Email delivery page — `SENT` only appears once the SNS→SQS `Delivery` event round-trips through the poller, so allow a few seconds after the send.

After enabling delivery (any provider), administrators with support access can use **Send test email** on the Email delivery page. Send only to an inbox you control, then verify the delivery reaches `SENT` and contains a signed/authenticated provider event. Every controlled test is recorded in the audit log as `EMAIL_TEST`.

Redis Compose configuration enables AOF persistence and uses `noeviction`. Preserve the `redis_data` volume during deployments.
