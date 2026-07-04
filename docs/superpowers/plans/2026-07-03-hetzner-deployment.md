# Hetzner Deployment Plan — Christian Listings Backend

**Goal:** Deploy the gateway + 4 subgraphs + Redis + worker to a single Hetzner VPS. The frontend (christian-listing, cl-admin) stays on Firebase Hosting. MongoDB stays on Atlas. This plan only moves the Node.js/Router layer.

---

## Concepts (read this first if you are new to deployment)

**VPS (Virtual Private Server)** — A Linux computer running 24/7 in a data center. You rent it by the month. You connect to it over the internet and run commands on it exactly like your local terminal, but it never turns off.

**SSH** — The protocol you use to connect to the VPS from your laptop. Instead of a password, you use a key pair: a private key (stays on your laptop, never shared) and a public key (you give to Hetzner so they install it on the server). When you run `ssh user@your-server-ip`, your laptop proves it has the private key and you're in.

**Docker & Docker Compose** — You already have these. On the server, Docker Compose reads your compose file and starts all your services as containers. Each container is an isolated process — the gateway, each subgraph, Redis, and Nginx all run in their own container on the same machine, connected via a private Docker network.

**Docker image** — A packaged, runnable snapshot of your app. Think of it like a zip file that contains your compiled code + Node.js + everything needed to run it. You build the image once in CI, store it in a registry, and the server just downloads and runs it.

**GHCR (GitHub Container Registry)** — Free image storage built into GitHub. After CI builds your Docker images it pushes them here (e.g. `ghcr.io/your-org/your-repo/gateway:latest`). Your server pulls images from here instead of building them itself. This means your server never compiles TypeScript — it only runs pre-built images.

**Nginx** — A web server that sits at the front door of your VPS. It listens on port 443 (HTTPS) and forwards requests to your gateway container on port 4000. The outside world only talks to Nginx; your subgraphs are never directly exposed to the internet.

**Let's Encrypt / Certbot** — A free certificate authority. Certbot is a tool that automatically gets an SSL certificate for your domain (so your API is `https://` not `http://`) and renews it every 90 days.

---

## How the full flow works

```
You push to main
        │
        ▼
GitHub Actions
  ├── 1. CI gate (lint, typecheck, test)
  ├── 2. Build Docker images for all 5 services  ← uses GitHub's machines, not your server
  │       push to GHCR:
  │         ghcr.io/your-org/your-repo/gateway:latest
  │         ghcr.io/your-org/your-repo/subgraph-identity:latest
  │         ghcr.io/your-org/your-repo/subgraph-events:latest
  │         ghcr.io/your-org/your-repo/subgraph-classifieds:latest
  │         ghcr.io/your-org/your-repo/subgraph-admin:latest
  └── 3. SSH into Hetzner server:
            docker compose pull   ← downloads new images from GHCR
            docker compose up -d  ← restarts containers with new images
                                    (takes ~10 seconds, no downtime for unchanged services)

Your server never builds anything. It only pulls and runs.
```

## Architecture on the server

```
Internet
    │
    ▼
Nginx (ports 80, 443)          ← only thing exposed to internet
    │  cl-api.duckdns.org/
    ▼
gateway:4000  (Apollo Router)  ─── internal Docker network ───►  identity:4001
                                                                  events:4002
                                                                  classifieds:4003
                                                                  admin:4004
                                                                  worker (no port)
                                                                  redis:6379
```

Subgraphs, Redis, and the worker are never reachable from outside. Only Nginx port 80/443 is open.

---

## What you need before starting

- [ ] A **Hetzner account** — sign up at hetzner.com
- [ ] A **domain name** you control (e.g. `christianlistings.com`) — you need to set DNS records on it
- [ ] Your **GitHub repo** with this codebase
- [ ] All **secrets** from your `.env` file (MONGO_URI, FIREBASE_SERVICE_ACCOUNT_JSON, Cloudinary keys)

---

## Phase 1 — Provision the server on Hetzner

### 1A — Generate an SSH key on your laptop (Windows)

Open PowerShell and run:

```powershell
ssh-keygen -t ed25519 -C "hetzner-christian-listings"
```

- Press Enter to accept the default path (`C:\Users\<you>\.ssh\id_ed25519`)
- Set a passphrase (optional but recommended)

This creates two files:
- `~/.ssh/id_ed25519` — your **private key** (never share this)
- `~/.ssh/id_ed25519.pub` — your **public key** (you will give this to Hetzner)

Print your public key so you can copy it:
```powershell
cat ~/.ssh/id_ed25519.pub
```

### 1B — Create the server in Hetzner Cloud Console

1. Go to [console.hetzner.cloud](https://console.hetzner.cloud) → New Project → "Christian Listings"
2. Click **Add Server**
3. Settings:
   - **Location:** pick the region closest to your users (EU → Nuremberg; US → Ashburn)
   - **Image:** Ubuntu 24.04
   - **Type:** `CX23` (2 vCPU, 4 GB RAM, ~€5.5/mo, 20 TB traffic) — `CX22` has been phased out for new orders; `CX23` is its direct replacement with the same specs. Fine for MVP since the server never builds images. (If you want noticeably better single-core performance for a couple euros more, `CPX22` — 2 AMD vCPU, 4 GB RAM, ~€8/mo — is the "Regular Performance" alternative and is available in more locations.)
   - **SSH keys:** paste your public key from step 1A
   - **Name:** `cl-prod`
4. Click **Create & Buy**

After ~30 seconds, you'll see the server's **public IP address** (e.g. `65.21.10.44`). Copy it.

### 1C — SSH into the server for the first time

```powershell
ssh root@<your-server-ip>
```

Type `yes` when asked to confirm the fingerprint. You're now on the server.

---

## Phase 2 — Secure & configure the server

Run all of these commands while SSH'd in as root.

### 2A — Create a non-root user

Running everything as root is dangerous. Create a deploy user instead:

```bash
adduser deploy
# enter a password when prompted
usermod -aG sudo deploy
# copy your SSH key to the new user so you can log in as them
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

From now on, SSH in as `deploy`:
```powershell
ssh deploy@<your-server-ip>
```

### 2B — Configure the firewall

The firewall controls which ports the outside world can reach. We only want 22 (SSH), 80 (HTTP), and 443 (HTTPS):

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
# confirm it's active
ufw status
```

> **Why not open port 4000?** Your gateway runs on 4000 inside Docker, but Nginx sits in front of it on 443. Nginx talks to the gateway via Docker's private network (never through the firewall). Keeping 4000 closed means the gateway is only reachable via Nginx.

### 2C — Install Docker

```bash
# Add Docker's official GPG key and repo
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow the deploy user to run Docker without sudo
sudo usermod -aG docker deploy

# Verify
docker --version
docker compose version
```

Log out and back in for the group change to take effect:
```bash
exit
ssh deploy@<your-server-ip>
```

---

## Phase 3 — Domain DNS (DuckDNS)

You need a hostname pointing to your server so Nginx can get a real SSL certificate. This plan uses [DuckDNS](https://www.duckdns.org) — a free service that gives you a `<name>.duckdns.org` hostname instead of a purchased domain. Functionally it's the same as an A record at a registrar: a hostname that resolves to your server's IP, which is all Certbot needs.

Throughout the rest of this plan, wherever you see `api.yourdomain.com`, substitute your DuckDNS hostname instead (e.g. `cl-api.duckdns.org`).

### 3A — Register a DuckDNS subdomain

1. Go to [duckdns.org](https://www.duckdns.org) and sign in (GitHub, Google, Reddit, or Twitter login — no separate account/password to create)
2. Under "add domain", type a subdomain name, e.g. `cl-api` → this reserves `cl-api.duckdns.org` (free accounts get up to 5 subdomains)
3. In the row that appears for `cl-api`, paste your Hetzner server's IP into the IP box and click **update ip**

That's it — no dynamic-update script needed. Your Hetzner IP is static for the life of the server, so you set it once here and never touch it again (DuckDNS is normally used for *changing* home IPs; you're just using it as a free hostname).

### 3B — Verify it resolves

Wait a minute or two for propagation, then:
```powershell
nslookup cl-api.duckdns.org
```

Expected: shows your server IP.

> **Why this still works with Certbot:** Certbot's Nginx plugin (used in Phase 5C) validates domain ownership over plain HTTP (port 80) — it doesn't care who your DNS provider is, only that the hostname resolves to the server it's running the challenge from. DuckDNS domains work with Let's Encrypt exactly like a registrar-bought domain would.

---

## Phase 4 — Get the compose file and secrets onto the server

The server doesn't need the full source code — images come from GHCR. It only needs two things:
1. `docker-compose.prod.yml` — tells Docker which images to run and with what config
2. `.env` — your secrets (Mongo URI, Firebase key, etc.)

### 4A — Clone the repo (for the compose file only)

```bash
mkdir -p /opt/christian-listings
cd /opt/christian-listings
git clone https://github.com/<your-org>/<your-repo>.git .
```

If the repo is private, create a GitHub **Personal Access Token** (PAT) with `repo` scope and use it as the password when prompted.

> The server will `git pull` on each deploy to pick up any changes to `docker-compose.prod.yml` or `router.yaml`. It never uses the source code to build.

### 4B — Create the production .env file

This file holds all your secrets. It never gets committed to git.

```bash
nano /opt/christian-listings/.env
```

Paste and fill in your values:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/

# Firebase Admin SDK (base64-encoded service account JSON)
FIREBASE_SERVICE_ACCOUNT_JSON=<your-base64-value>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Redis (used by worker — internal Docker hostname)
REDIS_URL=redis://redis:6379
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

### 4C — Update router.yaml CORS for production

The gateway's `router.yaml` currently only allows `localhost` origins. Add your Firebase Hosting URLs.

On your **local machine** (not the server), edit `apps/gateway/router.yaml`:

```yaml
cors:
  policies:
    - origins:
        - http://localhost:5173
        - http://localhost:3000
        - https://christian-listing.web.app        # ← add
        - https://christian-listings-admin.web.app # ← add
        - https://yourdomain.com                   # ← add if using custom domain
      allow_credentials: true
      methods:
        - GET
        - POST
        - OPTIONS
      allow_headers:
        - content-type
        - authorization
        - x-cl-region
        - x-request-id
        - apollo-require-preflight
```

Commit and push this change — the router.yaml is baked into the gateway Docker image, so the next CI build will pick it up.

---

## Phase 5 — Nginx + SSL

### 5A — Install Nginx and Certbot

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 5B — Create the Nginx config for your API

```bash
sudo nano /etc/nginx/sites-available/cl-api.duckdns.org
```

Paste this (replace `cl-api.duckdns.org` with your actual subdomain):

```nginx
server {
    listen 80;
    server_name christian-listings.duckdns.org;

    location / {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/christian-listings.duckdns.org /etc/nginx/sites-enabled/
sudo nginx -t          # should print "syntax is ok"
sudo systemctl reload nginx
```

### 5C — Get the SSL certificate

```bash
sudo certbot --nginx -d christian-listings.duckdns.org
```

Certbot will:
1. Ask for your email (for renewal reminders)
2. Ask you to agree to terms
3. Automatically edit your Nginx config to add HTTPS
4. Set up auto-renewal (runs twice daily via a systemd timer)

---

## Phase 6 — Production Docker Compose

This file lives in the repo and gets committed. It uses `image:` instead of `build:` — the server pulls pre-built images from GHCR and never compiles anything.

### 6-pre — Add a Dockerfile for the gateway

`docker/Dockerfile.node` (used for the 4 subgraphs) assumes a Node app built via `nx build`. The gateway is the Apollo Router — a Rust binary with no `build` target and nothing for `nx build` to do — so it needs its own Dockerfile: `docker/Dockerfile.router`. It starts from the official `ghcr.io/apollographql/router` image and bakes in this repo's `router.yaml` and composed `supergraph.graphql`. This is already created in this repo; if you're following this plan elsewhere, base it on the [official router Dockerfile](https://github.com/apollographql/router/blob/dev/dockerfiles/Dockerfile.router).

Also make sure `apps/gateway/router.yaml` has `supergraph.listen: 0.0.0.0:4000` set explicitly — the router defaults to binding `127.0.0.1:4000`, which is unreachable from outside its container even with a port mapping. Locally this doesn't matter because `nx serve gateway` passes `--listen 0.0.0.0:4000` on the command line, but the Docker image only gets `--supergraph`, so the config file needs it too.

Create `docker-compose.prod.yml` in the repo root on your **local machine**:

```yaml
version: "3.9"

# Replace YOUR_ORG/YOUR_REPO with your actual GitHub org and repo name
# e.g. if your repo is github.com/prnavvv/phoenix, use ghcr.io/prnavvv/phoenix

services:
  gateway:
    image: ghcr.io/YOUR_ORG/YOUR_REPO/gateway:latest
    ports:
      - "4000:4000"      # Nginx proxies to this
    environment:
      - NODE_ENV=production
      - PORT=4000
      - SUBGRAPH_IDENTITY_URL=http://identity:4001/graphql
      - SUBGRAPH_EVENTS_URL=http://events:4002/graphql
      - SUBGRAPH_CLASSIFIEDS_URL=http://classifieds:4003/graphql
      - SUBGRAPH_ADMIN_URL=http://admin:4004/graphql
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8088/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    depends_on:
      identity:
        condition: service_healthy
      events:
        condition: service_healthy
      classifieds:
        condition: service_healthy
      admin:
        condition: service_healthy
    restart: unless-stopped

  identity:
    image: ghcr.io/YOUR_ORG/YOUR_REPO/subgraph-identity:latest
    environment:
      - NODE_ENV=production
      - PORT=4001
      - MONGO_URI=${MONGO_URI}
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4001/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  events:
    image: ghcr.io/YOUR_ORG/YOUR_REPO/subgraph-events:latest
    environment:
      - NODE_ENV=production
      - PORT=4002
      - MONGO_URI=${MONGO_URI}
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4002/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  classifieds:
    image: ghcr.io/YOUR_ORG/YOUR_REPO/subgraph-classifieds:latest
    environment:
      - NODE_ENV=production
      - PORT=4003
      - MONGO_URI=${MONGO_URI}
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4003/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  admin:
    image: ghcr.io/YOUR_ORG/YOUR_REPO/subgraph-admin:latest
    environment:
      - NODE_ENV=production
      - PORT=4004
      - MONGO_URI=${MONGO_URI}
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4004/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    # No ports exposed — only reachable internally as redis:6379

  # worker:
  #   image: ghcr.io/YOUR_ORG/YOUR_REPO/worker:latest
  #   environment:
  #     - NODE_ENV=production
  #     - REDIS_URL=redis://redis:6379
  #     - MONGO_URI=${MONGO_URI}
  #     - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
  #   depends_on:
  #     - redis
  #   restart: unless-stopped
  # ↑ Uncomment when apps/worker is scaffolded (Phase 8)

volumes:
  redis_data:
```

Commit this file:
```bash
git add docker-compose.prod.yml
git commit -m "chore(deploy): add production docker-compose using GHCR images"
git push
```

### 6A — Authenticate the server to GHCR (one-time)

Your GHCR images are private (tied to your private repo). The server needs permission to pull them.

**Create a GitHub PAT with `read:packages` scope:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. New token → name it `hetzner-ghcr-pull`
3. Tick only `read:packages`
4. Copy the token (shown once)

**Log Docker into GHCR on the server:**
```bash
# SSH into the server, then:
echo "<your-pat-token>" | docker login ghcr.io -u <your-github-username> --password-stdin
```

Docker saves these credentials permanently in `~/.docker/config.json`. You only do this once. Now the server can always pull your private images.

### 6B — First manual deploy

```bash
# On the server:
cd /opt/christian-listings
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

`docker compose pull` downloads all images from GHCR (~200 MB per image, one-time download). After that, `docker ps` should show all containers as `Up`.

> **Note:** Images won't exist in GHCR until the CI build-and-push job runs for the first time (Phase 7). Do the first manual deploy after Phase 7 is set up and a push to `main` has triggered a successful CI run.

Test it. The router's `/health` endpoint listens on port 8088 *inside* the container (used for Docker's own healthcheck) — Nginx only proxies port 4000, so hit the GraphQL endpoint instead:
```bash
curl -X POST https://cl-api.duckdns.org/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# expected: {"data":{"__typename":"Query"}}
```
To check container health directly from the server: `docker exec <gateway-container> wget -qO- http://localhost:8088/health`.

---

## Phase 7 — GitHub Actions: Build images in CI, 

deploy to server

This replaces the old single deploy job with two jobs:
1. **build-and-push** — builds all 5 Docker images in parallel on GitHub's machines, pushes to GHCR
2. **deploy-backend** — SSHs into the server and pulls the new images

### 7A — Create a deploy SSH key

On your **local machine**, generate a key specifically for GitHub Actions:

```powershell
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/cl_deploy_key
```

This creates:
- `~/.ssh/cl_deploy_key` — private key (goes into GitHub Secrets)
- `~/.ssh/cl_deploy_key.pub` — public key (goes onto the server)

### 7B — Install the deploy key on the server

```bash
# SSH into the server, then:
echo "<paste contents of cl_deploy_key.pub here>" >> ~/.ssh/authorized_keys
```

### 7C — Add secrets to GitHub

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Value |
|-------------|-------|
| `HETZNER_HOST` | Your server IP (e.g. `65.21.10.44`) |
| `HETZNER_USER` | `deploy` |
| `HETZNER_SSH_KEY` | Full contents of `~/.ssh/cl_deploy_key` (the private key) |

### 7D — Add the build-and-push + deploy jobs to deploy.yml

Open `.github/workflows/deploy.yml` on your **local machine** and add these two jobs after the existing Firebase Hosting jobs:

```yaml
  build-and-push:
    name: Build & Push Docker Images
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write    # allows pushing to GHCR

    strategy:
      matrix:
        # Each service becomes a parallel build job.
        # gateway is the Apollo Router (a Rust binary, not a Node app) so it
        # gets its own Dockerfile — see docker/Dockerfile.router.
        include:
          - app: gateway
            dockerfile: docker/Dockerfile.router
          - app: subgraph-identity
            dockerfile: docker/Dockerfile.node
          - app: subgraph-events
            dockerfile: docker/Dockerfile.node
          - app: subgraph-classifieds
            dockerfile: docker/Dockerfile.node
          - app: subgraph-admin
            dockerfile: docker/Dockerfile.node

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # apps/gateway/supergraph.graphql is gitignored (composed locally, never
      # committed), so it has to be regenerated here before Dockerfile.router
      # can COPY it into the gateway image.
      - name: Compose supergraph
        if: matrix.app == 'gateway'
        env:
          APOLLO_ELV2_LICENSE: accept
        run: |
          npm install -g @apollo/rover
          rover supergraph compose --config rover.yaml --output apps/gateway/supergraph.graphql

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}    # built-in — no extra secret needed

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push ${{ matrix.app }}
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ${{ matrix.dockerfile }}
          build-args: APP_NAME=${{ matrix.app }}
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/${{ matrix.app }}:latest
            ghcr.io/${{ github.repository }}/${{ matrix.app }}:${{ github.sha }}
          cache-from: type=gha,scope=${{ matrix.app }}
          cache-to: type=gha,mode=max,scope=${{ matrix.app }}

  deploy-backend:
    name: Deploy Backend to Hetzner
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: ${{ secrets.HETZNER_USER }}
          key: ${{ secrets.HETZNER_SSH_KEY }}
          script: |
            cd /opt/christian-listings
            git pull origin main
            docker compose -f docker-compose.prod.yml --env-file .env pull
            docker compose -f docker-compose.prod.yml --env-file .env up -d
            docker image prune -f
```

**What each part does:**

- `strategy.matrix` — builds all 5 services **in parallel** on separate GitHub runners. A build that would take 15 min sequentially takes ~3–4 min.
- `cache-from/cache-to: type=gha` — GitHub caches each build's Docker layers. The second push (if only one service changed) only rebuilds the changed service; the rest restore from cache in seconds.
- `tags: ...:${{ github.sha }}` — every image is also tagged with the exact git commit. If something breaks, you can roll back by setting the image tag to a previous SHA and re-running `docker compose up -d`.
- `needs: build-and-push` — the deploy job only runs after **all** images are successfully pushed. If one build fails, nothing deploys.

Commit and push:
```bash
git add .github/workflows/deploy.yml docker-compose.prod.yml
git commit -m "chore(deploy): build images in CI, push to GHCR, deploy to Hetzner"
git push
```

This push triggers the full pipeline for the first time. Watch it under the GitHub Actions tab.

---

## Phase 8 — Worker scaffold (do this when you need background jobs)

When you're ready to add email notifications, scheduled tasks, etc.:

### 8A — Create the worker app

```bash
nx generate @nx/node:app worker --framework=none --directory=apps/worker
```

### 8B — Install BullMQ

```bash
npm install bullmq ioredis
```

### 8C — Basic worker structure

```
apps/worker/
├── src/
│   ├── main.ts              ← connects to Redis, starts workers
│   ├── queues/
│   │   └── email.queue.ts   ← exports a Queue instance (for subgraphs to enqueue)
│   └── workers/
│       └── email.worker.ts  ← processes jobs from the queue
```

`main.ts` pattern:
```typescript
import { Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

new Worker('email', async (job) => {
  // send email using job.data
}, { connection });

console.log('Worker running');
```

Any subgraph that needs to enqueue a job:
```typescript
import { Queue } from 'bullmq';
const emailQueue = new Queue('email', { connection });
await emailQueue.add('welcome-email', { to: user.email, name: user.name });
```

Once scaffolded, add it to the matrix in `deploy.yml` and uncomment the `worker` service in `docker-compose.prod.yml`.

---

## How to roll back a bad deploy

If a deploy breaks something, roll back to the previous commit's
 images:

```bash
# On the server — replace <previous-sha> with the git SHA before the bad commit
docker compose -f docker-compose.prod.yml \
  --env-file .env \
  up -d \
  --no-recreate \
  -e IMAGE_TAG=<previous-sha>
```

Or simpler: revert the bad commit in git and push — CI will build and deploy the reverted code automatically.

---

## Ongoing operations

### Check what's running
```bash
ssh deploy@<your-server-ip>
docker ps
```

### View logs for a service
```bash
docker compose -f docker-compose.prod.yml logs -f gateway
docker compose -f docker-compose.prod.yml logs -f identity
```

### Restart a single service
```bash
docker compose -f docker-compose.prod.yml restart events
```

### Manual deploy (pull latest images without pushing to main)
```bash
ssh deploy@<your-server-ip>
cd /opt/christian-listings
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker image prune -f
```

### Renew SSL certificate (automatic, but test it)
```bash
sudo certbot renew --dry-run
```

---

## Cost summary

| Item | Cost |
|------|------|
| Hetzner CX23 VPS | ~€5.50/month |
| MongoDB Atlas (free tier M0) | $0 |
| Firebase Hosting | $0 (Spark plan) |
| Firebase Auth | $0 (up to 10k MAU) |
| Cloudinary (free tier) | $0 |
| GHCR (image storage) | $0 (included with GitHub) |
| Domain name | ~$10–15/year |
| **Total** | **~€5/month** |

> Upgrade to `CX33` (4 vCPU, 8 GB RAM, ~€11/mo) if you need more RAM headroom later. Takes 30 seconds in the Hetzner console.

---

## Task checklist

### One-time setup (do in order)
- [ ] Phase 1: Provision Hetzner CX23, get server IP
- [ ] Phase 2: Secure server, install Docker
- [ ] Phase 3: Add DNS A record for `cl-api.duckdns.org`
- [x] Phase 4A: Clone repo on server
- [x] Phase 4B: Create `.env` on server with all secrets
- [x] Phase 4C: Add Firebase Hosting domains to `router.yaml` CORS, commit & push
- [x] Phase 5: Install Nginx + Certbot, get SSL cert — confirmed live at `https://christian-listings.duckdns.org/` 2026-07-04
- [x] Phase 6-pre: Create `docker/Dockerfile.router`, set `supergraph.listen: 0.0.0.0:4000` in `router.yaml`
- [x] Phase 6: Create and commit `docker-compose.prod.yml` (image-based, no build)
- [x] Phase 6A: Create GHCR PAT, `docker login ghcr.io` on server
- [x] Phase 7A–C: Deploy SSH key created, installed on server, `HETZNER_HOST`/`HETZNER_USER`/`HETZNER_SSH_KEY` added to GitHub repo secrets — full pipeline (build → SSH deploy → smoke test) confirmed green 2026-07-04
- [x] Phase 7D: Add build-and-push + deploy jobs to `deploy.yml`, push to main — improved with `set -euo pipefail`, `git fetch/reset --hard`, post-deploy smoke test (2026-07-04)
- [x] Watch GitHub Actions — all jobs green
- [x] Phase 6B: First manual deploy on server (`docker compose pull && up -d`) — all 6 containers `Up (healthy)` as of 2026-07-04
- [x] Backend live: `https://christian-listings.duckdns.org/` returns `{"data":{"__typename":"Query"}}` (verified independently twice, 2026-07-04)
- [ ] Add GitHub secret `CL_GRAPHQL_URL=https://christian-listings.duckdns.org/` so frontend builds point at production backend
- [ ] Add `APP_URL=https://christian-listing.web.app`, `APP_SECRET`, and `SMTP_*` vars to server `.env` (identity service needs them for email verification links)

### When building background jobs
- [ ] Phase 8: Scaffold worker app, add BullMQ, add to matrix + docker-compose.prod.yml

---

## Troubleshooting log — issues hit getting the backend healthy (2026-07-03/04)

Six unrelated bugs, all pre-existing in the codebase and never previously exercised, had to be fixed in sequence before `docker compose up` produced a fully healthy stack. Fixes are already committed to `main` — this log is so a future redeploy (new server, disaster recovery, second environment) doesn't have to re-discover them from scratch.

1. **Gateway had no Docker packaging.** It's the Apollo Router (a Rust binary), but was being built with the Node.js `Dockerfile.node`, which has no build target for it and wouldn't run the binary anyway. → `docker/Dockerfile.router` (based on `ghcr.io/apollographql/router`).

2. **`router.yaml` bound `127.0.0.1:4000` by default** — unreachable from outside its own container. → added `supergraph.listen: 0.0.0.0:4000`.

3. **`npm ci --omit=dev=false`** in `Dockerfile.node` is invalid npm syntax, failed every subgraph build. → plain `npm ci`.

4. **`npm ci` EUSAGE: "Missing gcp-metadata/gaxios/https-proxy-agent/agent-base from lock file"** on every subgraph build, even though the lock file was genuinely in sync (`npm install` locally produced a byte-identical lock file). Root cause: `mongodb` (via `mongoose`) declares these as *optional peer dependencies* (for GCP KMS/auth features this project doesn't use), and npm's resolution of optional peer deps during `npm ci`'s strict validation differs across npm patch versions/platforms (reproduced: passes on Windows npm 10.9.3, fails on Linux/Alpine npm 10.9.8). Node-version bumps didn't fix it. → `npm ci --legacy-peer-deps`.

5. **`MongooseServerSelectionError: Could not connect to any servers`** on `docker compose up -d`, for all 4 subgraphs. Extensive isolated testing (IP whitelist active & correct, SRV/TXT DNS resolution fine from host and container, raw TCP connect fine, TLS handshake fine and authorized, direct `mongoose.connect()` test with the real `.env` succeeding both on the default Docker network and the Compose-created network) ruled out every plausible cause **except** the one thing never tested in isolation: all 4 subgraphs opening TLS connections to Atlas's 3 shard hosts at the same instant on cold start. Atlas's free M0 tier is more sensitive to connection bursts than paid tiers. → no code fix needed; `restart: unless-stopped` in `docker-compose.prod.yml` lets it self-resolve within a few restart cycles. If this recurs and is intolerable, consider staggering subgraph startup (e.g. `depends_on` chains with delays) rather than treating it as broken.

6. **All 4 subgraph containers reported `(unhealthy)`** despite being confirmed up and logging "Server listening" — `docker exec ... wget http://localhost:$PORT/health` got instant `Connection refused`, but the identical request against `127.0.0.1` succeeded. Alpine/musl resolves `localhost` to the IPv6 loopback (`::1`) first; Fastify only binds the IPv4 wildcard (`0.0.0.0`), so nothing is listening on `::1`. → every healthcheck in both compose files now hits `127.0.0.1` explicitly, never `localhost`.

7. **`subgraph-admin` specifically stayed `(unhealthy)`** after fix #6 — its `/health` endpoint itself returned `401 Unauthorized`. Unlike the other three subgraphs, `subgraph-admin` registers `buildAuthPlugin({ optional: false })` (mandatory auth, intentional for an admin-only service), and the plugin's `onRequest` hook is wrapped in `fastify-plugin` (`fp()`), which breaks Fastify's encapsulation and applies the hook globally regardless of route registration order — so `/health` inherited the mandatory-auth requirement. → `fastify-auth.plugin.ts` now exempts `/health` from the auth check unconditionally, for every subgraph, regardless of `optional`.

8. **`deploy-backend` job: `ssh: unable to authenticate, attempted methods [none publickey]`.** The GitHub Actions deploy public key was generated (Phase 7A) but the `echo "<pub>" >> ~/.ssh/authorized_keys` step (Phase 7B) was never actually run against the right file — `authorized_keys` only had the operator's personal key from Phase 1A. → appended the `github-actions-deploy` public key to `deploy`'s `~/.ssh/authorized_keys`.

9. **`deploy-backend` job, after fixing #8: `fatal: detected dubious ownership in repository at '/opt/christian-listings'`.** Phase 4A's `git clone` was originally run as `root`, but the deploy job SSHs in as `deploy` — Git (CVE-2022-24765 mitigation) refuses to operate on a repo owned by a different user by default. → `git config --global --add safe.directory /opt/christian-listings` as the `deploy` user silences the check, but didn't fully fix it — see #10.

10. **`deploy-backend` job, after fixing #9: `error: cannot open '.git/FETCH_HEAD': Permission denied`.** The `safe.directory` exception only tells Git to trust the repo despite the ownership mismatch — it doesn't grant filesystem write access. `/opt/christian-listings` (including `.git`) was still actually owned by `root`, so `deploy` had no write permission at all. → `sudo chown -R deploy:deploy /opt/christian-listings` once, on the server. **Takeaway for a future redeploy:** do Phase 4A (`git clone`) as the `deploy` user from the start, not `root`, to avoid this entirely.
