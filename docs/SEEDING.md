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
