# Database Seeding

The seed script uses fixed document IDs and idempotent MongoDB upserts across `cl_identity`, `cl_events`, `cl_classifieds`, and `cl_admin`. It does not delete collections, but rerunning it updates the documents owned by those fixed IDs.

## Local MongoDB

```bash
npm run seed:local
```

Local mode accepts only a `MONGO_URI` pointing to `localhost` or `127.0.0.1`.

## Hetzner production database

Remote mode is deliberately guarded. From `/opt/christian-listings` on the server, run:

```bash
export SEED_ENVIRONMENT=production
export SEED_REMOTE_CONFIRM=SEED_CHRISTIAN_LISTINGS_PRODUCTION

docker compose \
  -f docker-compose.prod.yml \
  --env-file .env \
  --profile tools \
  run --rm seed

unset SEED_REMOTE_CONFIRM
unset SEED_ENVIRONMENT
```

The one-off `seed` service uses the existing identity image for Node.js and Mongoose, mounts only the seed script, reads `MONGO_URI` from the server `.env`, and exits after seeding. It does not start another application service.

Before running it, back up the four databases and confirm that `.env` contains the intended MongoDB Atlas cluster URI. The script prints only the MongoDB hostname, never the username or password.

For a staging cluster, use:

```bash
export SEED_ENVIRONMENT=staging
export SEED_REMOTE_CONFIRM=SEED_CHRISTIAN_LISTINGS_STAGING
docker compose -f docker-compose.prod.yml --env-file .env --profile tools run --rm seed
unset SEED_REMOTE_CONFIRM
unset SEED_ENVIRONMENT
```

The seed records contain example addresses and Firebase UIDs. Seed users cannot sign in until matching Firebase Auth users exist or the records are associated with real test accounts.

## Production client-demo dataset

Use the dedicated `seed-demo` runner for a recorded client demonstration. Unlike the general seed above, it creates or updates two real Firebase Auth accounts and links them to MongoDB correctly:

- an organisation owner for **Grace Community London**;
- an individual member/applicant named **Jordan Williams**.

The dataset contains 10 published events with images, 10 active jobs, 10 marketplace listings with images, three organisation team members, event RSVPs, job applications in multiple stages, saved jobs and listings, an organisation follow, buyer/seller conversations, and organisation notifications. Job cards use the organisation logo because jobs do not currently have their own image field.

The runner is idempotent and does not delete collections. It updates its deterministic demo records and resets the two configured Firebase passwords, so use dedicated demo email addresses rather than real customer accounts.

### Run on Hetzner

First take a MongoDB Atlas backup/snapshot and deploy the revision containing `seed-production-demo.js`. Then, from `/opt/christian-listings`:

```bash
read -rp "Organisation demo email: " DEMO_ORG_EMAIL
read -rsp "Organisation demo password (12+ characters): " DEMO_ORG_PASSWORD; echo
read -rp "Member demo email: " DEMO_MEMBER_EMAIL
read -rsp "Member demo password (12+ characters): " DEMO_MEMBER_PASSWORD; echo

export DEMO_ORG_EMAIL DEMO_ORG_PASSWORD DEMO_MEMBER_EMAIL DEMO_MEMBER_PASSWORD
export SEED_ENVIRONMENT=production
export SEED_REMOTE_CONFIRM=SEED_CHRISTIAN_LISTINGS_PRODUCTION_DEMO

docker compose \
  -f docker-compose.prod.yml \
  --env-file .env \
  --profile tools \
  run --rm seed-demo

unset DEMO_ORG_EMAIL DEMO_ORG_PASSWORD DEMO_MEMBER_EMAIL DEMO_MEMBER_PASSWORD
unset SEED_REMOTE_CONFIRM SEED_ENVIRONMENT
```

Do not add either demo password to `.env`, shell history, Git, screenshots, or the demo recording. The seed output prints emails and the organisation ID, but never prints passwords. After it reports `Production demo seed complete`, sign in once as each account so Firebase refreshes the newly written custom claims.

### Demo coverage

With the organisation login, demonstrate the populated events, listings, jobs, application pipeline, marketplace seller messages, followers, notifications, and team/roles pages. With the member login, demonstrate upcoming RSVP activity, saved items, submitted job applications, followed organisations, and buyer messages.
