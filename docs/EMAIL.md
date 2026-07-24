# Transactional Email

Christian Listings uses SendGrid for delivery and BullMQ on Redis for durable background processing. Business subgraphs submit email intents to authenticated admin HTTP endpoints; they never call SendGrid directly.

## Runtime flow

1. Identity, events, classifieds, or admin completes its primary database mutation.
2. The service submits a template key, recipient, variables, source metadata, and idempotency key to `POST /internal/emails`.
3. Admin renders the code-owned template and stores an `EmailDelivery` or `ScheduledEmail` record in `cl_admin`.
4. BullMQ places immediate messages on `email-delivery`. A BullMQ Job Scheduler scans due schedules every minute.
5. `apps/worker` calls SendGrid and records `ACCEPTED`. The signed SendGrid event webhook later records final `SENT` or `FAILED` outcomes.
6. Support and audit administrators inspect history and retry failed deliveries at `/email-deliveries` in the admin application.

The primary user action is not rolled back when email orchestration is unavailable. Idempotency keys prevent duplicate intents, and an accepted SendGrid message is not resent merely because its status callback temporarily fails.

Queue reconciliation runs at admin startup and once per minute. It restores stale scheduled claims and re-adds persisted `QUEUED` deliveries using stable BullMQ job IDs. Successfully recorded jobs are removed; jobs whose provider result could not be recorded are retained to prevent an unsafe duplicate send. SendGrid custom arguments carry the internal delivery ID so a signed webhook can still complete delivery state after a callback outage.

## Initial triggers

- Organisation invitation and resend
- Job application receipt for the applicant
- New job application notice for the organisation contact
- Event RSVP confirmation, waitlist/status change, and cancellation
- 24-hour event reminder for confirmed RSVPs, cancelled when the RSVP changes
- Organisation verification submission and decision updates

## Local development

Keep `EMAIL_ENABLED=false`. Email intents are stored with `SUPPRESSED` status and no external email is sent. The worker stays idle without opening Redis or SendGrid connections, so `npm run dev:all` does not require a local Redis installation in disabled mode. Redis and the active worker are included in the Docker Compose stack for real delivery.

To exercise real delivery locally, provide all SendGrid variables from `docs/ENVIRONMENT.md`, start Redis, and set `EMAIL_ENABLED=true`. Use only a dedicated development sender and recipient.

## Production activation

1. Authenticate the sending domain in SendGrid and create a restricted API key with Mail Send permission.
2. Configure the environment variables documented in `docs/ENVIRONMENT.md` on the Hetzner server.
3. Add the dedicated Nginx route below, then configure the SendGrid Event Webhook URL as `https://christian-listings.duckdns.org/webhooks/sendgrid`, enable signature verification, and store its ECDSA public key as `SENDGRID_WEBHOOK_PUBLIC_KEY`.
4. Deploy with `EMAIL_ENABLED=false` and confirm that the worker, Redis, admin, and system-health checks are stable.
5. Set `EMAIL_ENABLED=true`, redeploy the admin and worker containers, and send one controlled organisation invitation.
6. Confirm the delivery moves through `QUEUED` → `ACCEPTED` → `SENT` in the admin Email delivery page.

Redis Compose configuration enables AOF persistence and uses `noeviction`. Preserve the `redis_data` volume during deployments.

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
