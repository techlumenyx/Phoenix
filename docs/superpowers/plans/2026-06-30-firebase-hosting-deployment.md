# Firebase Hosting Deployment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CI auto-deploy `christian-listing` and `cl-admin` to Firebase Hosting on every push to `main`.

**Architecture:** Two React SPA apps built by Nx/Webpack and deployed to separate Firebase Hosting sites (`christian-listing` and `cl-admin`) via a GitHub Actions workflow using `FIREBASE_TOKEN` CI auth. The `firebase.json` file describes each site's public directory and SPA rewrite rules; the deploy workflow reads built output from `dist/apps/<app>` and pushes it to Firebase.

**Tech Stack:** Firebase Hosting (firebase-tools CLI), GitHub Actions, Nx 23, Webpack 5, React 18

## Global Constraints

- Node 22 (matches CI)
- firebase-tools pinned to `^15.0.0` (matches CLI version used locally: 15.22.1 from `firebase-debug.log`)
- Both apps are SPAs — every unmatched URL must rewrite to `/index.html`
- Build outputs: `dist/apps/christian-listing` and `dist/apps/cl-admin`
- Auth method: `FIREBASE_TOKEN` (org policy blocks service account keys — see commit `6e8be2d`)
- `firebase-tools` goes in `devDependencies` (not `dependencies`) — it is never bundled

---

## Root Cause Summary (Investigation Complete)

These are the confirmed gaps preventing deployment from working:

| # | Gap | Symptom |
|---|-----|---------|
| 1 | `firebase.json` missing | `firebase deploy` exits immediately: "No Firebase project configured" |
| 2 | `.firebaserc` missing | No project alias for local `firebase` commands |
| 3 | `firebase-tools` not in `devDependencies` | CI runs slow uncached `npm install -g firebase-tools` on every job |
| 4 | `deploy.yml` runs global install without pinned version | Version drift risk |
| 5 | GitHub secrets/variables not set | Deployment will fail at env-inject or deploy step |
| 6 | Firebase Hosting sites may not exist in console | Firebase rejects deploys to non-existent sites |

Tasks 1–2 are code-only and fix gaps 1–4. Task 3 is the mandatory manual checklist for gaps 5–6.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| **Create** | `firebase.json` | Multi-site hosting config: public dirs, SPA rewrites, cache headers |
| **Create** | `.firebaserc` | Project alias — update with real project ID |
| **Modify** | `package.json` | Add `firebase-tools` to devDependencies |
| **Modify** | `.github/workflows/deploy.yml` | Remove global install step; use `npx firebase`; gate on CI job |

---

## Task 1: Create Firebase Hosting Config Files

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc`

**Interfaces:**
- Produces: `hosting[].site` values (`christian-listing`, `cl-admin`) referenced by `deploy.yml`'s `--only hosting:<name>` flags
- Produces: `hosting[].public` paths (`dist/apps/christian-listing`, `dist/apps/cl-admin`) that must match Nx build `outputPath`

- [ ] **Step 1: Create `firebase.json`**

Create at repo root. The `site` values must match the Firebase Hosting site names you create in the Firebase Console (Task 3). The `public` paths match `outputPath` from each app's `project.json`.

```json
{
  "hosting": [
    {
      "site": "christian-listing",
      "public": "dist/apps/christian-listing",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ],
      "headers": [
        {
          "source": "**/*.@(js|css|woff2)",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
          ]
        },
        {
          "source": "**",
          "headers": [
            { "key": "X-Frame-Options", "value": "DENY" },
            { "key": "X-Content-Type-Options", "value": "nosniff" }
          ]
        }
      ]
    },
    {
      "site": "cl-admin",
      "public": "dist/apps/cl-admin",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ],
      "headers": [
        {
          "source": "**/*.@(js|css|woff2)",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
          ]
        },
        {
          "source": "**",
          "headers": [
            { "key": "X-Frame-Options", "value": "DENY" },
            { "key": "X-Content-Type-Options", "value": "nosniff" }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Validate `firebase.json` is valid JSON**

```bash
node -e "require('./firebase.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Create `.firebaserc`**

Replace `<your-firebase-project-id>` with the actual Firebase project ID (found in Firebase Console → Project Settings → General → Project ID).

```json
{
  "projects": {
    "default": "<your-firebase-project-id>"
  }
}
```

- [ ] **Step 4: Validate `.firebaserc` is valid JSON**

```bash
node -e "require('./.firebaserc'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 5: Add `firebase.json` to `.gitignore` exclusion check**

Verify `firebase.json` is NOT in `.gitignore` (it must be committed). Check:

```bash
git check-ignore -v firebase.json
```

Expected: no output (not ignored). If it shows as ignored, remove or adjust the ignore rule.

- [ ] **Step 6: Commit**

```bash
git add firebase.json .firebaserc
git commit -m "chore(deploy): add firebase.json hosting config and .firebaserc"
```

---

## Task 2: Add `firebase-tools` to devDependencies + Fix `deploy.yml`

**Files:**
- Modify: `package.json` — add `"firebase-tools": "^15.0.0"` to `devDependencies`
- Modify: `.github/workflows/deploy.yml` — remove global install step; use `npx firebase`; gate deploy on CI passing

**Interfaces:**
- Consumes: `firebase.json` from Task 1 (Firebase CLI reads it automatically)
- Produces: Working GitHub Actions deploy pipeline

- [ ] **Step 1: Add `firebase-tools` to devDependencies**

```bash
npm install --save-dev firebase-tools
```

Verify it appears in `package.json` under `devDependencies`:

```bash
node -e "const p = require('./package.json'); console.log(p.devDependencies['firebase-tools'])"
```

Expected: `^15.x.x`

- [ ] **Step 2: Replace `.github/workflows/deploy.yml`**

Replace the entire file with the improved version below. Key changes:
- Gate both deploy jobs on the `ci` job passing (no deploy if tests fail)
- Remove `npm install -g firebase-tools` step (now installed via `npm ci`)
- Use `npx firebase` instead of global `firebase`
- Add `FIREBASE_TOKEN` to env at job level (DRY)
- Separate the two jobs remain (parallel deployment)

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

env:
  NODE_VERSION: '22'

jobs:
  ci:
    name: CI Gate
    uses: ./.github/workflows/ci.yml

  deploy-christian-listing:
    name: Build & Deploy christian-listing
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build christian-listing (production)
        run: npx nx build christian-listing --configuration=production
        env:
          CL_GRAPHQL_URL: ${{ secrets.CL_GRAPHQL_URL }}
          CL_FIREBASE_API_KEY: ${{ secrets.CL_FIREBASE_API_KEY }}
          CL_FIREBASE_AUTH_DOMAIN: ${{ secrets.CL_FIREBASE_AUTH_DOMAIN }}
          CL_FIREBASE_PROJECT_ID: ${{ secrets.CL_FIREBASE_PROJECT_ID }}
          CL_FIREBASE_STORAGE_BUCKET: ${{ secrets.CL_FIREBASE_STORAGE_BUCKET }}
          CL_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.CL_FIREBASE_MESSAGING_SENDER_ID }}
          CL_FIREBASE_APP_ID: ${{ secrets.CL_FIREBASE_APP_ID_CL }}

      - name: Deploy to Firebase Hosting (christian-listing)
        run: npx firebase deploy --only hosting:christian-listing --project ${{ vars.FIREBASE_PROJECT_ID }}

  deploy-cl-admin:
    name: Build & Deploy cl-admin
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build cl-admin (production)
        run: npx nx build cl-admin --configuration=production
        env:
          CL_GRAPHQL_URL: ${{ secrets.CL_GRAPHQL_URL }}
          CL_FIREBASE_API_KEY: ${{ secrets.CL_FIREBASE_API_KEY }}
          CL_FIREBASE_AUTH_DOMAIN: ${{ secrets.CL_FIREBASE_AUTH_DOMAIN }}
          CL_FIREBASE_PROJECT_ID: ${{ secrets.CL_FIREBASE_PROJECT_ID }}
          CL_FIREBASE_STORAGE_BUCKET: ${{ secrets.CL_FIREBASE_STORAGE_BUCKET }}
          CL_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.CL_FIREBASE_MESSAGING_SENDER_ID }}
          CL_FIREBASE_APP_ID: ${{ secrets.CL_FIREBASE_APP_ID_ADMIN }}

      - name: Deploy to Firebase Hosting (cl-admin)
        run: npx firebase deploy --only hosting:cl-admin --project ${{ vars.FIREBASE_PROJECT_ID }}
```

> **Note on `ci` job reuse:** The `uses: ./.github/workflows/ci.yml` reuses the existing CI workflow as a callable workflow. If the CI workflow doesn't have a `workflow_call` trigger, replace the `ci` job with an inline run of the checks, or add `workflow_call:` to `ci.yml`'s `on:` block. See Step 2b below.

- [ ] **Step 2b: Add `workflow_call` trigger to `ci.yml` (if not already present)**

Open `.github/workflows/ci.yml` and add `workflow_call:` to the `on:` block:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_call:   # ← add this line
```

- [ ] **Step 3: Verify `package-lock.json` was updated**

```bash
git diff package-lock.json | head -20
```

Expected: shows `firebase-tools` added to the lock file.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .github/workflows/deploy.yml .github/workflows/ci.yml
git commit -m "chore(deploy): add firebase-tools to deps, gate deploy on CI, use npx firebase"
```

---

## Task 3: Manual Setup Checklist (Firebase Console + GitHub)

> These steps cannot be automated — they require browser access to Firebase Console and GitHub repo settings. Complete them before pushing to `main`.

### 3A — Firebase Console: Create Hosting Sites

Firebase Hosting requires each site to be pre-created before a deploy can succeed.

- [ ] Open [Firebase Console](https://console.firebase.google.com) → Your project → Build → Hosting
- [ ] Click **Add another site** and create a site named **`christian-listing`** (or confirm it already exists)
- [ ] Click **Add another site** and create a site named **`cl-admin`** (or confirm it already exists)
- [ ] Copy the **Project ID** from Project Settings → General → Project ID (you'll need it for `.firebaserc` and GitHub variable)
- [ ] Update `.firebaserc` with the real project ID:
  ```bash
  # Replace <your-firebase-project-id> with the actual project ID
  # Then commit:
  git add .firebaserc
  git commit -m "chore(deploy): set Firebase project ID in .firebaserc"
  ```

> **Site name vs Project ID:** The site names (`christian-listing`, `cl-admin`) must match the `site` values in `firebase.json` exactly. They are separate from the Firebase project ID.

### 3B — Generate `FIREBASE_TOKEN`

The CI uses `FIREBASE_TOKEN` (a CI token) instead of a service account key (blocked by org policy).

- [ ] On your local machine (while authenticated with the correct Google account):
  ```bash
  firebase login:ci
  ```
  This opens a browser. Log in and grant permissions.
- [ ] Copy the printed token — it looks like: `1//0gAB...`
- [ ] Keep this token safe — it grants full Firebase access

### 3C — Set GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → **New repository secret**

Set each of the following:

| Secret name | Value |
|-------------|-------|
| `FIREBASE_TOKEN` | Token from Step 3B |
| `CL_GRAPHQL_URL` | Production gateway URL (e.g. `https://api.yourdomain.com/graphql`) |
| `CL_FIREBASE_API_KEY` | Firebase web API key (Project Settings → Your apps → Web app) |
| `CL_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `CL_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `CL_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` |
| `CL_FIREBASE_MESSAGING_SENDER_ID` | Numeric sender ID |
| `CL_FIREBASE_APP_ID_CL` | App ID for `christian-listing` web app |
| `CL_FIREBASE_APP_ID_ADMIN` | App ID for `cl-admin` web app |

### 3D — Set GitHub Variable

Go to: GitHub repo → Settings → Secrets and variables → Actions → **Variables** tab → **New repository variable**

| Variable name | Value |
|---------------|-------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (same as `CL_FIREBASE_PROJECT_ID` secret) |

### 3E — Verify Deployment

- [ ] Push a commit to `main` (or trigger the workflow manually via Actions tab)
- [ ] Watch the **Deploy to Firebase Hosting** workflow — both jobs should show green
- [ ] Visit `https://christian-listing.web.app` — should load the app
- [ ] Visit `https://cl-admin.web.app` — should load the admin app

---

## Troubleshooting Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `Error: No Firebase project configured` | `.firebaserc` missing or has wrong project ID | Check `.firebaserc` and `--project` flag |
| `Error: Site "christian-listing" does not exist` | Site not created in Firebase Console | Complete Task 3A |
| `Error: Authentication Error` | `FIREBASE_TOKEN` secret missing or expired | Re-run `firebase login:ci`, update secret |
| Build fails with `CL_GRAPHQL_URL is undefined` | GitHub secret not set | Complete Task 3C |
| `workflow_call not found` | `ci.yml` missing `workflow_call` trigger | Complete Task 2, Step 2b |
| Deploy succeeds but app is blank | `public` dir path wrong in `firebase.json` | Verify `dist/apps/<app>` exists after build |
