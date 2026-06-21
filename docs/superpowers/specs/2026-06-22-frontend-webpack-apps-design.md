# Design: Frontend Webpack Apps — `christian-listing` & `cl-admin`

**Date:** 2026-06-22
**Status:** Approved
**Replaces:** `apps/web` (Vite scaffold)

---

## 1. Overview

Two new React 18 SPAs are added to the monorepo, replacing the existing `apps/web` Vite scaffold.

| App | Path | Port | Audience |
|-----|------|------|----------|
| `christian-listing` | `apps/christian-listing` | 3000 | Public users & organisations |
| `cl-admin` | `apps/cl-admin` | 3001 | Admin accounts only |

Both apps:
- Use **Webpack 5** via `composePlugins` + `withNx` + `withReact` from `@nx/webpack`
- Communicate exclusively with **Apollo Router gateway at `:4000`** — never directly with subgraphs
- Use the **Firebase Auth client SDK** (same Firebase project; account type enforced by backend claims)
- Never call Cloudinary directly

`apps/web` and `apps/web-e2e` are deleted.

---

## 2. Approach

**Chosen:** `composePlugins` + `withNx` + `withReact` (Approach 2)

Each app owns a fully independent `webpack.config.js`. No shared base config. Each config builds as a pipeline:

1. `withNx()` — Nx base: TypeScript paths, HtmlWebpackPlugin, output dir
2. `withReact({ svgr: true })` — JSX transform, React Refresh HMR, SVGR loader
3. Custom stage — env injection, bundle analyzer, manual chunk splitting

---

## 3. File Layout

```
apps/
├── christian-listing/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.tsx
│   │   │   └── app.spec.tsx
│   │   ├── assets/
│   │   │   └── .gitkeep
│   │   └── main.tsx
│   ├── index.html
│   ├── webpack.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── project.json
│   ├── jest.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.spec.json
│
└── cl-admin/
    ├── src/
    │   ├── app/
    │   │   ├── app.tsx
    │   │   └── app.spec.tsx
    │   ├── assets/
    │   │   └── .gitkeep
    │   └── main.tsx
    ├── index.html
    ├── webpack.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── project.json
    ├── jest.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    └── tsconfig.spec.json
```

---

## 4. Nx Tags & Module Boundaries

| App | Tags |
|-----|------|
| `christian-listing` | `scope:web`, `type:app` |
| `cl-admin` | `scope:admin-ui`, `type:app` |

`scope:admin-ui` is intentionally distinct from `scope:admin` (owned by `subgraph-admin` backend). The ESLint `@nx/enforce-module-boundaries` rule is updated so `scope:admin-ui` can only depend on `type:lib`.

---

## 5. Nx `project.json` Targets

Both apps share the same target shape. Example for `christian-listing` (`cl-admin` is identical with `port: 3001`):

```jsonc
{
  "name": "christian-listing",
  "sourceRoot": "apps/christian-listing/src",
  "projectType": "application",
  "tags": ["scope:web", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/christian-listing",
        "webpackConfig": "apps/christian-listing/webpack.config.js"
      },
      "configurations": {
        "development": {
          "mode": "development",
          "sourceMap": true,
          "extractLicenses": false,
          "optimization": false
        },
        "production": {
          "mode": "production",
          "sourceMap": false,
          "extractLicenses": true,
          "optimization": true
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "christian-listing:build",
        "port": 3000
      },
      "configurations": {
        "development": {
          "buildTarget": "christian-listing:build:development"
        },
        "production": {
          "buildTarget": "christian-listing:build:production"
        }
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/christian-listing/jest.config.ts",
        "passWithNoTests": true
      }
    }
  }
}
```

`defaultConfiguration: "production"` on build ensures `nx build christian-listing` always produces an optimised bundle unless `--configuration=development` is passed explicitly.

---

## 6. `webpack.config.js`

Both apps use the same structure. Only the app name and output path differ.

```js
// apps/christian-listing/webpack.config.js
const { composePlugins, withNx, withReact } = require('@nx/webpack');
const { DefinePlugin } = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact({ svgr: true }),
  (config) => {
    // 1. Inject all CL_* env vars at build time
    const clEnvVars = Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('CL_'))
        .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
    );
    config.plugins.push(new DefinePlugin(clEnvVars));

    // 2. Bundle analyzer — opt-in only, never in CI
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    // 3. Manual chunk splitting by vendor group
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react:    { test: /node_modules\/(react|react-dom|react-router-dom)/, name: 'vendor-react',    chunks: 'all' },
          apollo:   { test: /node_modules\/(@apollo|graphql)/,                  name: 'vendor-apollo',   chunks: 'all' },
          firebase: { test: /node_modules\/(firebase|@firebase)/,               name: 'vendor-firebase', chunks: 'all' },
        },
      },
    };

    return config;
  }
);
```

---

## 7. PostCSS & Tailwind

Each app gets its own `postcss.config.js` and `tailwind.config.js`. `withNx`/`withReact` pick up `postcss.config.js` automatically via `postcss-loader`.

```js
// apps/christian-listing/postcss.config.js  (identical for cl-admin)
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

```js
// apps/christian-listing/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{tsx,ts,html}'],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 8. SVG Usage

With `withReact({ svgr: true })`, SVGs are imported as React components:

```tsx
import Logo from './logo.svg?react';
```

---

## 9. Environment Variables

`VITE_FIREBASE_*` is replaced by `CL_FIREBASE_*`. Variables are injected at build time via `DefinePlugin` (see Section 6). All `CL_*` vars in `.env` are automatically included — no per-variable allow-list needed.

**In code:**
```ts
const apiKey = process.env.CL_FIREBASE_API_KEY;
```

**`.env.example` keys to rename:**

| Old key | New key |
|---------|---------|
| `VITE_FIREBASE_API_KEY` | `CL_FIREBASE_API_KEY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `CL_FIREBASE_AUTH_DOMAIN` |
| `VITE_FIREBASE_PROJECT_ID` | `CL_FIREBASE_PROJECT_ID` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `CL_FIREBASE_STORAGE_BUCKET` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `CL_FIREBASE_MESSAGING_SENDER_ID` |
| `VITE_FIREBASE_APP_ID` | `CL_FIREBASE_APP_ID` |

---

## 10. New Dev Dependency

`webpack-bundle-analyzer` must be added to `devDependencies`:

```bash
npm install --save-dev webpack-bundle-analyzer
```

---

## 11. Migration: What Gets Removed

| Item | Action |
|------|--------|
| `apps/web/` | Deleted |
| `apps/web-e2e/` | Deleted (empty Playwright scaffold) |

---

## 12. Migration: What Gets Updated

| File | Change |
|------|--------|
| `package.json` | Add `webpack-bundle-analyzer` to devDeps; add `cl`, `cl-admin`, `frontend` scripts |
| `docs/ARCHITECTURE.md` | Replace `web (Vite dev) 5173` with `christian-listing 3000` and `cl-admin 3001` in port map |
| `docs/ENVIRONMENT.md` | Rename `VITE_FIREBASE_*` → `CL_FIREBASE_*`; note DefinePlugin injection |
| `.env.example` | Rename `VITE_` keys to `CL_` |
| `CLAUDE.md` | Update Tech Stack: `Vite + React 18` → `Webpack 5 + React 18`; update port in service map |
| ESLint boundary config | Add `scope:admin-ui` → `type:lib` rule |

**`package.json` script additions:**
```json
"cl":       "nx serve christian-listing",
"cl-admin": "nx serve cl-admin",
"frontend": "concurrently -n cl,cl-admin -c blue,red \"npm run cl\" \"npm run cl-admin\""
```

---

## 13. Docker

No changes. Both dev servers run locally via `nx serve`. Docker Compose only orchestrates the backend services and gateway. This remains unchanged for Phase 1.

---

## 14. Out of Scope

- Module Federation between the two apps
- E2E test setup for either app (separate spec when needed)
- Authentication UI implementation (covered by separate feature specs)
- Apollo Client setup and GraphQL query wiring (separate spec)
