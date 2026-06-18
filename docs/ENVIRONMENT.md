# Environment Variables — Christian Listings

Copy `.env.example` to `.env` and fill in all values before running any service.

## All Backend Services

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | Full MongoDB Atlas connection string, including credentials. Format: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Firebase Admin SDK service account JSON, **base64-encoded**. Get from Firebase Console → Project Settings → Service Accounts → Generate new private key. Encode: `base64 -i serviceAccount.json` (Mac/Linux) |
| `PORT` | Yes | HTTP port the service listens on. Each service uses a different port (4001–4004). Set automatically by Docker Compose. |
| `NODE_ENV` | No | `development` or `production`. Defaults to `development`. |

**Note on `FIREBASE_SERVICE_ACCOUNT_JSON`:** The raw service account JSON contains newlines which break environment variable handling in many shells. Always base64-encode the entire file before setting this variable.

```bash
# Encoding (Mac/Linux):
base64 -i path/to/serviceAccount.json | tr -d '\n'

# Decoding (verification):
echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | base64 -d | head -5
```

## subgraph-classifieds and subgraph-events (Media Uploads)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name. Found in Cloudinary Console → Settings |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

## apps/gateway (Apollo Router)

These are hardcoded in `docker-compose.yml` using Docker's internal DNS. Only needed when running the gateway **outside Docker**.

| Variable | Default (Docker) | Description |
|----------|-----------------|-------------|
| `SUBGRAPH_IDENTITY_URL` | `http://identity:4001/graphql` | Internal URL of identity subgraph |
| `SUBGRAPH_EVENTS_URL` | `http://events:4002/graphql` | Internal URL of events subgraph |
| `SUBGRAPH_CLASSIFIEDS_URL` | `http://classifieds:4003/graphql` | Internal URL of classifieds subgraph |
| `SUBGRAPH_ADMIN_URL` | `http://admin:4004/graphql` | Internal URL of admin subgraph |

## apps/web (Browser — Vite)

**Must be prefixed `VITE_`** to be included in the browser bundle. Do not put secrets here.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GRAPHQL_URL` | Yes | Gateway URL the browser sends GraphQL requests to. `http://localhost:4000/graphql` for local dev. |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase client API key. Found in Firebase Console → Project Settings → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain. Format: `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web app ID. Format: `1:<project-number>:web:<hash>` |

## How Docker Compose Handles Secrets

Docker Compose reads from the root `.env` file automatically and injects variables into each container's `environment:` block. The `.env` file must be in the workspace root (same directory as `docker-compose.yml` is run from, i.e., `C:\Code\Phoenix`).

```bash
# From the workspace root:
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

# Docker Compose reads .env from the current working directory
```
