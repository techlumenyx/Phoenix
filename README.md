# Phoenix — Christian Listings Platform

<img width="260" height="280" alt="Phoenix mascot" src="https://github.com/user-attachments/assets/eb865ec9-c19a-4a73-a39d-b0e068ffab40" />

A faith-community platform for Events, Jobs, and Marketplace, built for diaspora audiences. Nx monorepo with GraphQL Federation v2.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Step 1 — Clone the Repository](#step-1--clone-the-repository)
- [Step 2 — Install Dependencies](#step-2--install-dependencies)
- [Step 3 — Set Up Environment Variables](#step-3--set-up-environment-variables)
- [Step 4 — Run the Full Stack (Docker)](#step-4--run-the-full-stack-docker)
- [Step 5 — Run a Single Service Locally (No Docker)](#step-5--run-a-single-service-locally-no-docker)
- [Useful Commands](#useful-commands)
- [Port Reference](#port-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have all of the following installed before you start.

| Tool | Minimum Version | How to Check |
|------|----------------|--------------|
| [Node.js](https://nodejs.org) | 20 LTS | `node -v` |
| [npm](https://www.npmjs.com) | 10+ | `npm -v` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | latest | `docker -v` |
| [Git](https://git-scm.com) | any | `git -v` |

You also need accounts and credentials for:

- **MongoDB Atlas** — free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
- **Firebase** — project at [console.firebase.google.com](https://console.firebase.google.com)
- **Cloudinary** — free account at [cloudinary.com](https://cloudinary.com) (only needed for Events and Classifieds features)

---

## Project Structure

```
Phoenix/
├── apps/
│   ├── web/                  # React 18 frontend (Vite, Tailwind, Apollo Client)
│   ├── gateway/              # Apollo Router — federates all subgraphs
│   ├── subgraph-identity/    # User accounts & auth (port 4001)
│   ├── subgraph-events/      # Events listings (port 4002)
│   ├── subgraph-classifieds/ # Jobs & Marketplace listings (port 4003)
│   └── subgraph-admin/       # Admin panel backend (port 4004)
├── libs/
│   ├── auth/                 # Firebase Admin token verification
│   ├── db/                   # MongoDB connection factory
│   ├── types/                # Shared TypeScript types & codegen output
│   └── utils/                # Cloudinary client, pagination, region helpers
├── docker/
│   ├── docker-compose.yml          # Production-like Docker setup
│   └── docker-compose.override.yml # Dev overrides (hot reload via volume mounts)
├── docs/                     # Architecture docs and ADRs
├── .env.example              # Template for environment variables
└── CLAUDE.md                 # AI agent instructions for this codebase
```

---

## Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd Phoenix
```

---

## Step 2 — Install Dependencies

Install all Node.js packages for the entire monorepo in one command:

```bash
npm install
```

This installs dependencies for all apps and libraries at once (managed by Nx).

---

## Step 3 — Set Up Environment Variables

The app will not start without a `.env` file. Follow these steps carefully.

### 3a. Copy the example file

```bash
# Mac / Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

### 3b. Fill in MongoDB URI

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and open your cluster.
2. Click **Connect** → **Connect your application**.
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://yourUser:yourPassword@cluster0.xxxxx.mongodb.net
   ```
4. Paste it into `.env`:
   ```
   MONGO_URI=mongodb+srv://yourUser:yourPassword@cluster0.xxxxx.mongodb.net
   ```

> The app will automatically create four databases inside this cluster:
> `cl_identity`, `cl_events`, `cl_classifieds`, `cl_admin`

### 3c. Fill in Firebase credentials

**For the backend (Admin SDK):**

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Service Accounts**.
2. Click **Generate new private key** — this downloads a `.json` file.
3. Encode the file to base64:
   ```bash
   # Mac / Linux
   base64 -i serviceAccount.json

   # Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccount.json"))
   ```
4. Copy the output and paste it into `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON=<paste the base64 string here>
   ```

**For the frontend (Client SDK):**

1. In Firebase Console → **Project Settings** → **Your apps** → click your Web app (or add one).
2. Copy the config values into `.env`:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### 3d. Fill in Cloudinary credentials (optional for MVP)

Only needed if you are working on Events or Classifieds media uploads.

1. Go to [cloudinary.com](https://cloudinary.com) → **Settings** → **Access Keys**.
2. Fill in `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## Step 4 — Run the Full Stack (Docker)

This is the recommended way to run the entire platform locally. Docker starts all services together with hot reload enabled.

### 4a. Make sure Docker Desktop is running

Open Docker Desktop and wait until the whale icon in the taskbar shows it is running.

### 4b. Start all services

```bash
npm run dev
```

This runs:
```
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up
```

Docker will build images the first time (takes a few minutes). On subsequent runs it reuses cached layers and starts much faster.

### 4c. Wait for all services to be healthy

Watch the terminal output. You will see each service start up:

```
identity   | Server ready at http://localhost:4001/graphql
events     | Server ready at http://localhost:4002/graphql
classifieds| Server ready at http://localhost:4003/graphql
admin      | Server ready at http://localhost:4004/graphql
gateway    | Apollo Router running at http://localhost:4000
web        | Local: http://localhost:5173
```

### 4d. Open the app

| Service | URL |
|---------|-----|
| **Web App** | http://localhost:5173 |
| **GraphQL Gateway** (Apollo Sandbox) | http://localhost:4000 |
| **Identity Subgraph** | http://localhost:4001/graphql |
| **Events Subgraph** | http://localhost:4002/graphql |
| **Classifieds Subgraph** | http://localhost:4003/graphql |
| **Admin Subgraph** | http://localhost:4004/graphql |

### 4e. Stop all services

Press `Ctrl + C` in the terminal, then run:

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml down
```

---

## Step 5 — Run a Single Service Locally (No Docker)

Use this when you want faster iteration on one specific service without starting everything.

### Run the Identity subgraph

```bash
npx nx serve subgraph-identity
```

### Run the Events subgraph

```bash
npx nx serve subgraph-events
```

### Run the Classifieds subgraph

```bash
npx nx serve subgraph-classifieds
```

### Run the Admin subgraph

```bash
npx nx serve subgraph-admin
```

### Run the Web frontend

```bash
npx nx serve web
```

> When running services individually, set the `SUBGRAPH_*_URL` variables in `.env` to point to the locally running services so the gateway can find them.

---

## Useful Commands

### Code Generation

Run this after changing any `.graphql` schema file:

```bash
# Step 1 — Regenerate TypeScript types
npm run codegen

# Step 2 — Recompose the supergraph schema
# Mac / Linux
tools/scripts/compose-supergraph.sh

# Windows
tools\scripts\compose-supergraph.bat
```

### Linting

```bash
npm run lint
```

### Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Build All Apps

```bash
npm run build
```

### Only process files affected by your changes

```bash
npx nx affected --target=build
npx nx affected --target=test
npx nx affected --target=lint
```

### Visualize the project dependency graph

```bash
npx nx graph
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Web App | 5173 | http://localhost:5173 |
| Gateway (Apollo Router) | 4000 | http://localhost:4000 |
| subgraph-identity | 4001 | http://localhost:4001/graphql |
| subgraph-events | 4002 | http://localhost:4002/graphql |
| subgraph-classifieds | 4003 | http://localhost:4003/graphql |
| subgraph-admin | 4004 | http://localhost:4004/graphql |

---

## Troubleshooting

### Docker build fails on first run

Make sure Docker Desktop is fully started (not just launching). Then retry:

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml build --no-cache
npm run dev
```

### `MONGO_URI` connection errors

- Check that your IP address is whitelisted in MongoDB Atlas: **Network Access** → **Add IP Address** → Add your current IP or `0.0.0.0/0` for development.
- Make sure the username and password in the connection string are URL-encoded (e.g., `@` in a password becomes `%40`).

### Firebase token verification fails

- Confirm `FIREBASE_SERVICE_ACCOUNT_JSON` is a valid base64 string with no newlines or spaces.
- Verify the service account belongs to the same Firebase project as the frontend config.

### Port already in use

If a port is taken by another process, find and stop it:

```bash
# Mac / Linux
lsof -i :4001

# Windows (PowerShell)
netstat -ano | findstr :4001
# Then: taskkill /PID <pid> /F
```

### Nx command not found

Install Nx globally or use `npx`:

```bash
npm install -g nx
# or
npx nx <command>
```

### Environment variables not loading in Docker

Docker Compose reads `.env` from the project root automatically. Make sure your `.env` file is at `Phoenix/.env` (same directory as `docker-compose.yml` is referenced from) and not inside any subfolder.
