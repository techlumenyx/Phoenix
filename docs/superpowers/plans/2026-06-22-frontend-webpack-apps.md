# Frontend Webpack Apps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `apps/web` (Vite) with two independent React 18 + Webpack 5 SPAs — `apps/christian-listing` (public, port 3000) and `apps/cl-admin` (admin dashboard, port 3001).

**Architecture:** Each app uses `composePlugins` + `withNx` + `withReact` from `@nx/webpack` with a custom stage for env injection, bundle analysis, and manual chunk splitting. Both are fully independent — no shared webpack base config. Firebase and Apollo Client are bootstrapped in each app's `main.tsx`. All GraphQL traffic goes to the Apollo Router gateway at `:4000`.

**Tech Stack:** React 18, TypeScript 5, Webpack 5, `@nx/webpack` (executor + `composePlugins`), Tailwind CSS 3 + PostCSS, Jest + `@testing-library/react`, Firebase Auth client SDK, Apollo Client 3.

## Global Constraints

- `@nx/webpack` version: `23.0.0` (matches workspace `nx` version — do not upgrade independently)
- `composePlugins` + `withNx` + `withReact` pattern only — no `NxAppWebpackPlugin` for these apps
- Env vars for browser: `CL_*` prefix only — injected by webpack `DefinePlugin`, never `VITE_*`
- `scope:admin-ui` tag on `cl-admin` — distinct from `scope:admin` (owned by `subgraph-admin` backend)
- Both apps depend only on `type:lib` packages (enforced by `@nx/enforce-module-boundaries`)
- No direct Cloudinary calls from either app
- `defaultConfiguration: "production"` on every `build` target

---

## File Map

**Created:**
- `apps/christian-listing/project.json`
- `apps/christian-listing/webpack.config.js`
- `apps/christian-listing/postcss.config.js`
- `apps/christian-listing/tailwind.config.js`
- `apps/christian-listing/jest.config.ts`
- `apps/christian-listing/tsconfig.json`
- `apps/christian-listing/tsconfig.app.json`
- `apps/christian-listing/tsconfig.spec.json`
- `apps/christian-listing/index.html`
- `apps/christian-listing/src/main.tsx`
- `apps/christian-listing/src/app/app.tsx`
- `apps/christian-listing/src/app/app.spec.tsx`
- `apps/christian-listing/src/assets/.gitkeep`
- `apps/cl-admin/project.json`
- `apps/cl-admin/webpack.config.js`
- `apps/cl-admin/postcss.config.js`
- `apps/cl-admin/tailwind.config.js`
- `apps/cl-admin/jest.config.ts`
- `apps/cl-admin/tsconfig.json`
- `apps/cl-admin/tsconfig.app.json`
- `apps/cl-admin/tsconfig.spec.json`
- `apps/cl-admin/index.html`
- `apps/cl-admin/src/main.tsx`
- `apps/cl-admin/src/app/app.tsx`
- `apps/cl-admin/src/app/app.spec.tsx`
- `apps/cl-admin/src/assets/.gitkeep`

**Modified:**
- `package.json` — add `webpack-bundle-analyzer` devDep; add `cl`, `cl-admin`, `frontend` scripts
- `.eslintrc.json` — add `scope:admin-ui` module boundary rule
- `docs/ARCHITECTURE.md` — update port map
- `docs/ENVIRONMENT.md` — replace `apps/web (Vite)` section with `apps/christian-listing` and `apps/cl-admin` webpack section
- `.env.example` — rename `VITE_*` keys to `CL_*`
- `CLAUDE.md` — update Tech Stack line and Service Map table

**Deleted:**
- `apps/web/` (entire directory)
- `apps/web-e2e/` (entire directory)

---

## Task 1: Add `webpack-bundle-analyzer` and npm convenience scripts

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `webpack-bundle-analyzer` available at `require('webpack-bundle-analyzer')` in webpack configs (Tasks 3 & 4)
- Produces: `npm run cl`, `npm run cl-admin`, `npm run frontend` scripts

- [ ] **Step 1: Add the dev dependency and scripts to `package.json`**

Open `package.json`. In `devDependencies`, add after the `webpack-dev-server` line:

```json
"webpack-bundle-analyzer": "^4.10.2",
```

In `scripts`, add after the `"backend"` entry:

```json
"cl":       "nx serve christian-listing",
"cl-admin": "nx serve cl-admin",
"frontend": "concurrently -n cl,cl-admin -c blue,red \"npm run cl\" \"npm run cl-admin\""
```

- [ ] **Step 2: Install the new dependency**

```bash
npm install
```

Expected: lock file updates, no errors.

- [ ] **Step 3: Verify the package is installed**

```bash
npm ls webpack-bundle-analyzer
```

Expected output includes: `webpack-bundle-analyzer@4.x.x`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add webpack-bundle-analyzer and frontend convenience scripts"
```

---

## Task 2: Remove `apps/web` and `apps/web-e2e`

**Files:**
- Delete: `apps/web/`
- Delete: `apps/web-e2e/`

**Interfaces:**
- Consumes: nothing
- Produces: clean workspace without Vite app references

- [ ] **Step 1: Delete `apps/web`**

```bash
rm -rf apps/web
```

- [ ] **Step 2: Delete `apps/web-e2e`**

```bash
rm -rf apps/web-e2e
```

- [ ] **Step 3: Verify Nx no longer sees these apps**

```bash
npx nx show projects
```

Expected: `web` and `web-e2e` are NOT listed.

- [ ] **Step 4: Verify remaining targets still lint cleanly**

```bash
npx nx run-many --target=lint --all
```

Expected: all remaining projects pass. If `web` or `web-e2e` appear as errors, confirm the directories are truly gone.

- [ ] **Step 5: Commit**

```bash
git add -A apps/web apps/web-e2e
git commit -m "chore: remove apps/web and apps/web-e2e (replaced by christian-listing and cl-admin)"
```

---

## Task 3: Scaffold and implement `apps/christian-listing`

**Files:**
- Create: `apps/christian-listing/project.json`
- Create: `apps/christian-listing/webpack.config.js`
- Create: `apps/christian-listing/postcss.config.js`
- Create: `apps/christian-listing/tailwind.config.js`
- Create: `apps/christian-listing/jest.config.ts`
- Create: `apps/christian-listing/tsconfig.json`
- Create: `apps/christian-listing/tsconfig.app.json`
- Create: `apps/christian-listing/tsconfig.spec.json`
- Create: `apps/christian-listing/index.html`
- Create: `apps/christian-listing/src/main.tsx`
- Create: `apps/christian-listing/src/app/app.tsx`
- Test: `apps/christian-listing/src/app/app.spec.tsx`
- Create: `apps/christian-listing/src/assets/.gitkeep`

**Interfaces:**
- Consumes: `webpack-bundle-analyzer` installed in Task 1
- Produces: `nx serve christian-listing` at `http://localhost:3000`; `nx test christian-listing` passing; `nx build christian-listing` producing `dist/apps/christian-listing/`

- [ ] **Step 1: Create all config and scaffold files**

Create `apps/christian-listing/project.json`:

```json
{
  "name": "christian-listing",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
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
        "index": "apps/christian-listing/index.html",
        "main": "apps/christian-listing/src/main.tsx",
        "tsConfig": "apps/christian-listing/tsconfig.app.json",
        "assets": ["apps/christian-listing/src/assets"],
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

Create `apps/christian-listing/webpack.config.js`:

```js
const { composePlugins, withNx, withReact } = require('@nx/webpack');
const { DefinePlugin } = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact({ svgr: true }),
  (config) => {
    // Inject all CL_* env vars at build time
    const clEnvVars = Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('CL_'))
        .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
    );
    config.plugins.push(new DefinePlugin(clEnvVars));

    // Bundle analyzer — opt-in only via ANALYZE=true, never runs in CI
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    // Manual vendor chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'vendor-react',
            chunks: 'all',
          },
          apollo: {
            test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
            name: 'vendor-apollo',
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'vendor-firebase',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  }
);
```

Create `apps/christian-listing/postcss.config.js`:

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

Create `apps/christian-listing/tailwind.config.js`:

```js
module.exports = {
  content: ['./src/**/*.{tsx,ts,html}'],
  theme: { extend: {} },
  plugins: [],
};
```

Create `apps/christian-listing/jest.config.ts`:

```ts
export default {
  displayName: 'christian-listing',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/christian-listing',
};
```

Create `apps/christian-listing/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowJs": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

Create `apps/christian-listing/tsconfig.app.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [
      "node",
      "@nx/react/typings/cssmodule.d.ts",
      "@nx/react/typings/image.d.ts"
    ]
  },
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.tsx",
    "jest.config.ts",
    "jest.config.cts"
  ],
  "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"]
}
```

Create `apps/christian-listing/tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "moduleResolution": "node10",
    "jsx": "react-jsx",
    "types": ["jest", "node", "@nx/react/typings/cssmodule.d.ts", "@nx/react/typings/image.d.ts"]
  },
  "include": [
    "jest.config.ts",
    "jest.config.cts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ]
}
```

Create `apps/christian-listing/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Christian Listings</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Create `apps/christian-listing/src/assets/.gitkeep` (empty file).

- [ ] **Step 2: Write the failing test first**

Create `apps/christian-listing/src/app/app.spec.tsx`:

```tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('displays the app heading', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByRole('heading', { name: /christian listings/i })).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the test — confirm it fails**

```bash
npx nx test christian-listing
```

Expected: FAIL — `Cannot find module './app'`

- [ ] **Step 4: Create `app.tsx` to make the tests pass**

Create `apps/christian-listing/src/app/app.tsx`:

```tsx
import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div>
      <h1>Christian Listings</h1>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: Run the test — confirm it passes**

```bash
npx nx test christian-listing
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Create `main.tsx` entry point**

Create `apps/christian-listing/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import App from './app/app';

const firebaseApp = initializeApp({
  apiKey: process.env['CL_FIREBASE_API_KEY'],
  authDomain: process.env['CL_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['CL_FIREBASE_PROJECT_ID'],
  appId: process.env['CL_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const user = firebaseAuth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
```

- [ ] **Step 7: Verify the development build succeeds**

```bash
npx nx build christian-listing --configuration=development
```

Expected: `dist/apps/christian-listing/` is created containing `index.html` and JS chunks including `vendor-react`, `vendor-apollo`, `vendor-firebase`.

- [ ] **Step 8: Commit**

```bash
git add apps/christian-listing
git commit -m "feat(christian-listing): scaffold React webpack app with composePlugins, Tailwind, and Apollo"
```

---

## Task 4: Scaffold and implement `apps/cl-admin`

**Files:**
- Create: `apps/cl-admin/project.json`
- Create: `apps/cl-admin/webpack.config.js`
- Create: `apps/cl-admin/postcss.config.js`
- Create: `apps/cl-admin/tailwind.config.js`
- Create: `apps/cl-admin/jest.config.ts`
- Create: `apps/cl-admin/tsconfig.json`
- Create: `apps/cl-admin/tsconfig.app.json`
- Create: `apps/cl-admin/tsconfig.spec.json`
- Create: `apps/cl-admin/index.html`
- Create: `apps/cl-admin/src/main.tsx`
- Create: `apps/cl-admin/src/app/app.tsx`
- Test: `apps/cl-admin/src/app/app.spec.tsx`
- Create: `apps/cl-admin/src/assets/.gitkeep`

**Interfaces:**
- Consumes: `webpack-bundle-analyzer` installed in Task 1
- Produces: `nx serve cl-admin` at `http://localhost:3001`; `nx test cl-admin` passing; `nx build cl-admin` producing `dist/apps/cl-admin/`

- [ ] **Step 1: Create all config and scaffold files**

Create `apps/cl-admin/project.json`:

```json
{
  "name": "cl-admin",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/cl-admin/src",
  "projectType": "application",
  "tags": ["scope:admin-ui", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/cl-admin",
        "index": "apps/cl-admin/index.html",
        "main": "apps/cl-admin/src/main.tsx",
        "tsConfig": "apps/cl-admin/tsconfig.app.json",
        "assets": ["apps/cl-admin/src/assets"],
        "webpackConfig": "apps/cl-admin/webpack.config.js"
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
        "buildTarget": "cl-admin:build",
        "port": 3001
      },
      "configurations": {
        "development": {
          "buildTarget": "cl-admin:build:development"
        },
        "production": {
          "buildTarget": "cl-admin:build:production"
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
        "jestConfig": "apps/cl-admin/jest.config.ts",
        "passWithNoTests": true
      }
    }
  }
}
```

Create `apps/cl-admin/webpack.config.js`:

```js
const { composePlugins, withNx, withReact } = require('@nx/webpack');
const { DefinePlugin } = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact({ svgr: true }),
  (config) => {
    // Inject all CL_* env vars at build time
    const clEnvVars = Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('CL_'))
        .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
    );
    config.plugins.push(new DefinePlugin(clEnvVars));

    // Bundle analyzer — opt-in only via ANALYZE=true, never runs in CI
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    // Manual vendor chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'vendor-react',
            chunks: 'all',
          },
          apollo: {
            test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
            name: 'vendor-apollo',
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'vendor-firebase',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  }
);
```

Create `apps/cl-admin/postcss.config.js`:

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

Create `apps/cl-admin/tailwind.config.js`:

```js
module.exports = {
  content: ['./src/**/*.{tsx,ts,html}'],
  theme: { extend: {} },
  plugins: [],
};
```

Create `apps/cl-admin/jest.config.ts`:

```ts
export default {
  displayName: 'cl-admin',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/cl-admin',
};
```

Create `apps/cl-admin/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowJs": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

Create `apps/cl-admin/tsconfig.app.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [
      "node",
      "@nx/react/typings/cssmodule.d.ts",
      "@nx/react/typings/image.d.ts"
    ]
  },
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.tsx",
    "jest.config.ts",
    "jest.config.cts"
  ],
  "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"]
}
```

Create `apps/cl-admin/tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "moduleResolution": "node10",
    "jsx": "react-jsx",
    "types": ["jest", "node", "@nx/react/typings/cssmodule.d.ts", "@nx/react/typings/image.d.ts"]
  },
  "include": [
    "jest.config.ts",
    "jest.config.cts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ]
}
```

Create `apps/cl-admin/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CL Admin</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Create `apps/cl-admin/src/assets/.gitkeep` (empty file).

- [ ] **Step 2: Write the failing test first**

Create `apps/cl-admin/src/app/app.spec.tsx`:

```tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('displays the admin heading', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByRole('heading', { name: /cl admin/i })).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the test — confirm it fails**

```bash
npx nx test cl-admin
```

Expected: FAIL — `Cannot find module './app'`

- [ ] **Step 4: Create `app.tsx` to make the tests pass**

Create `apps/cl-admin/src/app/app.tsx`:

```tsx
import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div>
      <h1>CL Admin</h1>
      <Routes>
        <Route path="/" element={<div>Admin Dashboard</div>} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: Run the test — confirm it passes**

```bash
npx nx test cl-admin
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Create `main.tsx` entry point**

Create `apps/cl-admin/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import App from './app/app';

const firebaseApp = initializeApp({
  apiKey: process.env['CL_FIREBASE_API_KEY'],
  authDomain: process.env['CL_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['CL_FIREBASE_PROJECT_ID'],
  appId: process.env['CL_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const user = firebaseAuth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
```

- [ ] **Step 7: Verify the development build succeeds**

```bash
npx nx build cl-admin --configuration=development
```

Expected: `dist/apps/cl-admin/` created containing `index.html` and JS chunks.

- [ ] **Step 8: Commit**

```bash
git add apps/cl-admin
git commit -m "feat(cl-admin): scaffold React webpack admin dashboard with composePlugins and Tailwind"
```

---

## Task 5: Update ESLint module boundary rules

**Files:**
- Modify: `.eslintrc.json`

**Interfaces:**
- Consumes: `scope:admin-ui` tag defined in Task 4's `cl-admin/project.json`
- Produces: `nx lint cl-admin` enforces that `cl-admin` can only import from `type:lib` packages, not from `scope:admin` (the backend subgraph)

- [ ] **Step 1: Add `scope:admin-ui` constraint to `.eslintrc.json`**

Open `.eslintrc.json`. In the `depConstraints` array, add this entry after the existing `scope:admin` entry:

```json
{
  "sourceTag": "scope:admin-ui",
  "onlyDependOnLibsWithTags": ["scope:shared"]
}
```

The `depConstraints` array after the change:

```json
"depConstraints": [
  {
    "sourceTag": "type:app",
    "onlyDependOnLibsWithTags": ["type:lib"]
  },
  {
    "sourceTag": "type:lib",
    "onlyDependOnLibsWithTags": ["type:lib"]
  },
  {
    "sourceTag": "scope:web",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:gateway",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:identity",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:events",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:classifieds",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:admin",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  },
  {
    "sourceTag": "scope:admin-ui",
    "onlyDependOnLibsWithTags": ["scope:shared"]
  }
]
```

- [ ] **Step 2: Verify lint passes on both new apps**

```bash
npx nx run-many --target=lint --projects=christian-listing,cl-admin
```

Expected: Both projects PASS lint with no module boundary errors.

- [ ] **Step 3: Verify the full workspace lint still passes**

```bash
npx nx run-many --target=lint --all
```

Expected: All projects pass.

- [ ] **Step 4: Commit**

```bash
git add .eslintrc.json
git commit -m "chore: add scope:admin-ui module boundary rule for cl-admin"
```

---

## Task 6: Update docs, env files, and CLAUDE.md

**Files:**
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/ENVIRONMENT.md`
- Modify: `.env.example`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing — documentation update only
- Produces: all references to `apps/web`, Vite, and `VITE_*` replaced with correct values

- [ ] **Step 1: Update `docs/ARCHITECTURE.md` port map**

In `docs/ARCHITECTURE.md`, find the Port Map table and replace the `web (Vite dev)` row:

Old:
```
| web (Vite dev) | 5173 | web:5173 |
```

New:
```
| christian-listing (webpack dev) | 3000 | — (runs locally, not in Docker) |
| cl-admin (webpack dev)          | 3001 | — (runs locally, not in Docker) |
```

Also update the system diagram at the top — replace `[ Vite + React SPA — port 5173 ]` with:

```
[ Webpack React SPA (christian-listing) — port 3000 ]
[ Webpack React SPA (cl-admin) — port 3001 ]
```

- [ ] **Step 2: Update `docs/ENVIRONMENT.md` — replace the `apps/web` section**

Find and replace the section headed `## apps/web (Browser — Vite)` with:

```markdown
## apps/christian-listing and apps/cl-admin (Browser — Webpack)

**Must be prefixed `CL_`** to be included in the browser bundle via webpack `DefinePlugin`. Do not put secrets here.

| Variable | Required | Description |
|----------|----------|-------------|
| `CL_GRAPHQL_URL` | Yes | Gateway URL the browser sends GraphQL requests to. `http://localhost:4000/graphql` for local dev. |
| `CL_FIREBASE_API_KEY` | Yes | Firebase client API key. Found in Firebase Console → Project Settings → Your apps → Web app |
| `CL_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain. Format: `<project-id>.firebaseapp.com` |
| `CL_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `CL_FIREBASE_APP_ID` | Yes | Firebase web app ID. Format: `1:<project-number>:web:<hash>` |

**Note:** Unlike Vite (which auto-includes `VITE_*` vars), webpack requires explicit injection. The `webpack.config.js` in each app reads all `CL_*` keys from `process.env` at build time and injects them via `DefinePlugin`. No other env vars are exposed to the browser.
```

- [ ] **Step 3: Update `.env.example` — rename `VITE_*` keys to `CL_*`**

Find the `WEB (Vite …)` section in `.env.example` and replace it entirely:

Old block:
```bash
# ----------------------------------------------------------
# WEB (Vite — must be prefixed VITE_ to be included in browser bundle)
# ----------------------------------------------------------

# Gateway URL the browser sends GraphQL requests to
VITE_GRAPHQL_URL=http://localhost:4000/graphql

# Firebase client config (from Firebase Console → Project Settings → Your apps → Web app)
VITE_FIREBASE_API_KEY=AIzaSy<rest-of-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_APP_ID=1:<project-number>:web:<app-id>

# Optional: Firebase Storage bucket (if using Firebase Storage alongside Cloudinary)
# VITE_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
```

New block:
```bash
# ----------------------------------------------------------
# BROWSER APPS (christian-listing + cl-admin — Webpack DefinePlugin)
# Must be prefixed CL_ to be injected into the browser bundle.
# Do not put secrets here.
# ----------------------------------------------------------

# Gateway URL the browser sends GraphQL requests to
CL_GRAPHQL_URL=http://localhost:4000/graphql

# Firebase client config (from Firebase Console → Project Settings → Your apps → Web app)
CL_FIREBASE_API_KEY=AIzaSy<rest-of-key>
CL_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
CL_FIREBASE_PROJECT_ID=<project-id>
CL_FIREBASE_APP_ID=1:<project-number>:web:<app-id>
```

- [ ] **Step 4: Update `CLAUDE.md` — Tech Stack and Service Map**

In `CLAUDE.md`, change the Frontend line in the Tech Stack section:

Old:
```
- **Frontend**: `apps/web` — Vite + React 18 + TypeScript + Tailwind CSS + Apollo Client + Zustand
```

New:
```
- **Frontend**: `apps/christian-listing` (port 3000) and `apps/cl-admin` (port 3001) — Webpack 5 + React 18 + TypeScript + Tailwind CSS + Apollo Client + Zustand
```

In the Service Map table, replace the `apps/web` row:

Old:
```
| `apps/web` | 5173 | — | `scope:web, type:app` |
```

New (two rows):
```
| `apps/christian-listing` | 3000 | — | `scope:web, type:app` |
| `apps/cl-admin` | 3001 | — | `scope:admin-ui, type:app` |
```

- [ ] **Step 5: Run the full workspace lint and tests to confirm nothing is broken**

```bash
npx nx run-many --target=lint --all
npx nx run-many --target=test --all
```

Expected: All projects pass.

- [ ] **Step 6: Commit**

```bash
git add docs/ARCHITECTURE.md docs/ENVIRONMENT.md .env.example CLAUDE.md
git commit -m "docs: update architecture, env catalogue, and CLAUDE.md for webpack frontend apps"
```

---

## Self-Review

**Spec coverage:**
- Section 1 (Overview): covered by Tasks 3 & 4
- Section 2 (Approach): `composePlugins` used in Tasks 3 & 4, step 1
- Section 3 (File Layout): all files listed in File Map above
- Section 4 (Tags & Boundaries): `scope:admin-ui` tag in Task 4 step 1; ESLint rule in Task 5
- Section 5 (project.json targets): complete in Tasks 3 & 4 step 1
- Section 6 (webpack.config.js): complete in Tasks 3 & 4 step 1
- Section 7 (PostCSS & Tailwind): `postcss.config.js` and `tailwind.config.js` in Tasks 3 & 4 step 1
- Section 8 (SVG Usage): SVGR enabled via `withReact({ svgr: true })` in webpack configs — not a separate task since it requires no code beyond the config
- Section 9 (Env vars): `CL_*` prefix used throughout; Task 6 updates docs and `.env.example`
- Section 10 (webpack-bundle-analyzer): Task 1
- Section 11 (What gets removed): Task 2
- Section 12 (What gets updated): Task 6
- Section 13 (Docker): explicitly out of scope, no task needed
- Section 14 (Out of Scope): Module Federation, E2E, auth UI, Apollo wiring — none implemented

**Placeholder scan:** No TBDs, no "implement later", no "add appropriate" phrases. Every step has exact file content or exact commands.

**Type consistency:** `App` default export from `./app/app` used consistently across `app.tsx`, `app.spec.tsx`, and `main.tsx` in both apps.
