# PRD: GitchaCars — Production Deployment (GitHub + Neon + Render)

## 1. Introduction / Overview

GitchaCars needs to go live as a publicly accessible demo. This PRD covers everything required to take the existing local-only app and deploy it as a live web service that anyone can visit, sign up, and use.

The deployment stack is:
- **GitHub** (private repo) — source control & deployment trigger
- **Neon Postgres** — database (already in use, no changes needed)
- **Render** — web hosting (single Web Service running the unified Express server)

A **demo password gate** will protect the entire app behind a simple password screen (`gitcha`) so only people given the password can access the demo. Once entered, it persists in localStorage and never asks again on that browser.

## 2. Goals

- Deploy GitchaCars to a publicly accessible URL (`gitchacars.onrender.com`)
- Protect the demo with a password gate (password: `gitcha`, persisted in localStorage)
- Push codebase to a private GitHub repository
- Ensure environment variables and secrets are properly documented and excluded from source control
- Provide core E2E smoke tests that verify the deployed app is functional
- Enable continuous deployment: push to `main` → auto-deploy on Render

## 3. User Stories

---

### US-001: Create `.env.example` Files

**Description:** As a developer, I want `.env.example` files for both backend and frontend so that anyone cloning the repo knows exactly which environment variables are required.

**Acceptance Criteria:**
- [ ] `backend/.env.example` exists with every env var from the current backend `.env`, but with placeholder values (no real secrets)
- [ ] Each variable has a comment explaining what it is and whether it's required or optional
- [ ] `frontend/.env.example` exists with every `VITE_*` env var, with placeholder values
- [ ] Each variable has a comment explaining what it is and whether it's required or optional
- [ ] Neither `.env.example` file contains any real API keys, passwords, or connection strings

**Reference — Backend variables:**
```
DATABASE_URL=           # Required — Neon Postgres connection string
JWT_SECRET=             # Required — Secret for signing JWT tokens
PORT=3001               # Optional — Server port (default: 3001)
FRONTEND_URL=           # Optional — Frontend URL for CORS (default: http://localhost:5173)
SENDGRID_API_KEY=       # Optional — SendGrid API key for email notifications
SENDGRID_FROM_EMAIL=    # Optional — From address for emails (default: noreply@gitchacars.com)
FIREBASE_PROJECT_ID=    # Optional — Firebase project ID for image storage
FIREBASE_CLIENT_EMAIL=  # Optional — Firebase service account email
FIREBASE_PRIVATE_KEY=   # Optional — Firebase service account private key
ANTHROPIC_API_KEY=      # Optional — Anthropic API key for AI chat features
GOOGLE_CLIENT_ID=       # Optional — Google OAuth client ID
IMAGIN_API_KEY=         # Optional — Imagin Studio car image API key
```

**Reference — Frontend variables:**
```
VITE_API_URL=/api                       # Optional — API base URL (default: /api)
VITE_GOOGLE_CLIENT_ID=                  # Optional — Google OAuth client ID
VITE_FIREBASE_API_KEY=                  # Optional — Firebase config
VITE_FIREBASE_AUTH_DOMAIN=              # Optional — Firebase config
VITE_FIREBASE_DATABASE_URL=             # Optional — Firebase config
VITE_FIREBASE_PROJECT_ID=              # Optional — Firebase config
VITE_FIREBASE_STORAGE_BUCKET=          # Optional — Firebase config
VITE_FIREBASE_MESSAGING_SENDER_ID=     # Optional — Firebase config
VITE_FIREBASE_APP_ID=                  # Optional — Firebase config
VITE_USE_MOCKS=false                   # Optional — Use mock data instead of real API
VITE_DEMO_PASSWORD=                    # Optional — Demo gate password (if set, enables demo gate)
```

---

### US-002: Update `.gitignore` for Production Readiness

**Description:** As a developer, I want the `.gitignore` to properly exclude all sensitive files, build artifacts, and platform-specific files so nothing dangerous gets committed.

**Acceptance Criteria:**
- [ ] `.gitignore` at repo root includes: `node_modules/`, `.env`, `dist/`, `*.log`, `.DS_Store`, `test-results/`, `playwright-report/`, `backend/package-lock 2.json`, `.claude/settings.local.json`
- [ ] `backend/.env` and `frontend/.env` are both explicitly listed (not just `.env` in root)
- [ ] `frontend/dist/` is excluded (it's a build artifact, Render will build it fresh)
- [ ] No real `.env` files are currently tracked in git (verify with `git ls-files` — if they are, remove them from tracking with `git rm --cached`)

---

### US-003: Build Demo Password Gate Component

**Description:** As a visitor, I want to see a password gate when I first visit the site so that only people with the demo password can access the app.

**Acceptance Criteria:**
- [ ] New file `frontend/src/components/DemoGate.jsx` exists
- [ ] New file `frontend/src/components/DemoGate.css` exists
- [ ] The component renders a full-screen overlay with:
  - GitchaCars logo/title text
  - A subtitle like "Private Demo — Enter password to continue"
  - A single password input field (type="password")
  - A "Enter" submit button
  - The input submits on Enter key press
- [ ] When the wrong password is entered, an inline error message appears: "Incorrect password"
- [ ] When the correct password (`gitcha`) is entered, the gate disappears and the app renders
- [ ] The correct password is read from the `VITE_DEMO_PASSWORD` environment variable
- [ ] If `VITE_DEMO_PASSWORD` is not set or is empty, the demo gate is completely skipped (app renders normally) — this allows local development without the gate
- [ ] The component is visually polished — dark background, centered card, consistent with the existing GitchaCars design (use the app's existing color palette: dark navy/charcoal backgrounds, accent colors)
- [ ] **Verify in browser** via Playwright screenshot

---

### US-004: Integrate Demo Gate into App.jsx

**Description:** As a developer, I want the demo gate to wrap the entire application so that no routes, navbar, or content are visible until the password is entered.

**Acceptance Criteria:**
- [ ] `App.jsx` imports `DemoGate` component
- [ ] `DemoGate` wraps ALL content in `App.jsx` (including `NavBar`, `Layout`, and all `Routes`) — nothing renders until gate is passed
- [ ] On correct password entry, the value `"true"` is stored in `localStorage` under key `gitcha_demo_access`
- [ ] On subsequent visits, if `localStorage.getItem('gitcha_demo_access') === 'true'`, the gate is skipped entirely
- [ ] The gate does NOT appear when `VITE_DEMO_PASSWORD` env var is empty/unset (local dev mode)
- [ ] After passing the gate, all existing routes and functionality work exactly as before
- [ ] **Verify in browser**: Visit `/` — gate appears. Enter "gitcha" — app loads. Refresh page — gate does NOT reappear
- [ ] **Verify in browser**: Visit `/auth`, `/dashboard`, or any route — gate still appears first if not yet unlocked

---

### US-005: Add Render Build Script and Production Configuration

**Description:** As a deployment platform, Render needs a single build command and start command to deploy the unified server.

**Acceptance Criteria:**
- [ ] `package.json` exists at the repo root (new file) with:
  ```json
  {
    "name": "gitchacars",
    "private": true,
    "scripts": {
      "build": "cd frontend && npm install && npm run build && cd ../backend && npm install",
      "start": "cd backend && node src/server.js",
      "migrate": "cd backend && npm run migrate"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  }
  ```
- [ ] The `build` script installs frontend deps, builds frontend to `frontend/dist/`, then installs backend deps
- [ ] The `start` script starts the backend server (which serves both API and frontend static files)
- [ ] Backend `app.js` — the `frontendDist` path (`path.join(__dirname, '..', '..', 'frontend', 'dist')`) works correctly when run from the repo root via `cd backend && node src/server.js` (it already does — verify this)
- [ ] Backend CORS is configured to allow the Render domain: update `app.use(cors())` to `app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))` so it can be locked down later if needed
- [ ] The `PORT` env var is respected (Render sets this automatically)
- [ ] **Verify**: Run `npm run build` from repo root — frontend builds successfully, backend deps install
- [ ] **Verify**: Run `npm start` from repo root — server starts and serves the app on the configured port

---

### US-006: Create `render.yaml` Deployment Blueprint

**Description:** As a developer, I want a `render.yaml` file so that Render can auto-detect the service configuration and deploy with minimal manual setup.

**Acceptance Criteria:**
- [ ] `render.yaml` exists at the repo root with the following configuration:
  ```yaml
  services:
    - type: web
      name: gitchacars
      runtime: node
      plan: free
      buildCommand: npm run build
      startCommand: npm start
      envVars:
        - key: NODE_ENV
          value: production
        - key: DATABASE_URL
          sync: false  # Set manually in Render dashboard
        - key: JWT_SECRET
          sync: false
        - key: PORT
          value: 10000  # Render's default port
        - key: VITE_DEMO_PASSWORD
          value: gitcha
        - key: ANTHROPIC_API_KEY
          sync: false
        - key: GOOGLE_CLIENT_ID
          sync: false
        - key: SENDGRID_API_KEY
          sync: false
        - key: IMAGIN_API_KEY
          sync: false
  ```
- [ ] The blueprint uses the `free` plan
- [ ] `DATABASE_URL` and `JWT_SECRET` are marked `sync: false` (must be set manually in Render dashboard — never committed)
- [ ] `VITE_DEMO_PASSWORD` is set to `gitcha` directly in the blueprint (not a secret — it's the demo password)
- [ ] **Important**: The `VITE_DEMO_PASSWORD` env var must be available at BUILD TIME (not just runtime) because Vite inlines env vars during the build step. Render makes all env vars available during build, so this works automatically with the blueprint above.

---

### US-007: Create Private GitHub Repository and Push Code

**Description:** As a developer, I want the codebase pushed to a private GitHub repository so that Render can connect to it for continuous deployment.

**Acceptance Criteria:**
- [ ] A private GitHub repository named `gitchacars` is created under the user's GitHub account using `gh repo create`
- [ ] The current local git history is pushed to the new repo's `main` branch
- [ ] No `.env` files with real secrets are in the commit history (verify with `git log --all --full-history -- '*.env'`)
- [ ] The repo is accessible via GitHub (verify with `gh repo view`)
- [ ] The `main` branch contains the latest code including all changes from this PRD (demo gate, render.yaml, etc.)

---

### US-008: Post-Deployment Verification Checklist

**Description:** As a developer, after deploying to Render, I want to verify that everything works correctly on the live URL.

**Acceptance Criteria:**
- [ ] The Render service is created and connected to the GitHub repo (manual step — document the instructions below)
- [ ] The live URL (`https://gitchacars.onrender.com`) loads the demo gate
- [ ] Entering "gitcha" on the demo gate reveals the app
- [ ] The health check endpoint (`/api/health`) returns `{ status: "ok" }`
- [ ] User registration works (create a new account)
- [ ] User login works with test accounts (buyer1@example.com / password123)
- [ ] Homepage displays want listings from the database
- [ ] AI chat feature works (if ANTHROPIC_API_KEY is configured)

**Manual Render Setup Instructions (for reference — not automated):**
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub account and select the `gitchacars` repo
4. Render will auto-detect `render.yaml` and pre-fill settings
5. Add the following env vars manually in the Render dashboard:
   - `DATABASE_URL` — Copy from `backend/.env` (your Neon connection string)
   - `JWT_SECRET` — Copy from `backend/.env` or generate a new one
   - `ANTHROPIC_API_KEY` — Copy from `backend/.env`
   - `GOOGLE_CLIENT_ID` — Copy from `backend/.env` (if using Google OAuth)
   - Any other optional keys (SENDGRID, FIREBASE, IMAGIN)
6. Click "Create Web Service"
7. Wait for build to complete (~3-5 minutes)
8. Visit the `.onrender.com` URL to verify

---

### US-009: E2E Smoke Test — Health Check Endpoint

**Description:** As a developer, I want an E2E test that verifies the `/api/health` endpoint returns a successful response so I can confirm the backend is running.

**Acceptance Criteria:**
- [ ] New test file `frontend/e2e/smoke-deploy.spec.js` is created
- [ ] Test `"health check endpoint returns ok"` makes a GET request to `/api/health`
- [ ] Test asserts the response status is 200
- [ ] Test asserts the response body contains `{ status: "ok" }`
- [ ] Test uses the existing Playwright config and base URL
- [ ] Test passes when run locally with `npx playwright test frontend/e2e/smoke-deploy.spec.js`

---

### US-010: E2E Smoke Test — Demo Gate Flow

**Description:** As a developer, I want an E2E test that verifies the demo gate blocks access and unlocks with the correct password.

**Acceptance Criteria:**
- [ ] Test `"demo gate blocks access until correct password is entered"` is added to `smoke-deploy.spec.js`
- [ ] Test navigates to `/` and asserts the demo gate is visible (look for the password input and "Private Demo" text)
- [ ] Test enters the wrong password ("wrong") and clicks Enter — asserts error message "Incorrect password" appears
- [ ] Test enters the correct password ("gitcha") and clicks Enter — asserts the demo gate disappears and the homepage content is visible
- [ ] Test refreshes the page and asserts the demo gate does NOT reappear (localStorage persistence)
- [ ] **Note**: This test requires `VITE_DEMO_PASSWORD=gitcha` to be set in the frontend env during build. Add a note in the test file explaining this.
- [ ] Test passes when run locally (rebuild frontend with `VITE_DEMO_PASSWORD=gitcha npm run build` first)

---

### US-011: E2E Smoke Test — Authentication Flow

**Description:** As a developer, I want an E2E test that verifies login works so I can confirm auth and database connectivity are functional.

**Acceptance Criteria:**
- [ ] Test `"user can log in with test credentials"` is added to `smoke-deploy.spec.js`
- [ ] Test first passes through the demo gate (enters "gitcha")
- [ ] Test navigates to `/auth?mode=login`
- [ ] Test fills in email `buyer1@example.com` and password `password123`
- [ ] Test clicks the login button
- [ ] Test asserts the user is redirected to `/dashboard` or the homepage
- [ ] Test asserts the NavBar shows the logged-in user's name or a logout button (indicating auth succeeded)
- [ ] Test passes when run locally with the backend server running

---

### US-012: E2E Smoke Test — Homepage Content Loads

**Description:** As a developer, I want an E2E test that verifies the homepage displays want listings from the database so I can confirm the full stack (frontend → API → database) is working.

**Acceptance Criteria:**
- [ ] Test `"homepage displays want listings from database"` is added to `smoke-deploy.spec.js`
- [ ] Test first passes through the demo gate (enters "gitcha")
- [ ] Test navigates to `/`
- [ ] Test waits for the page to finish loading (wait for network idle or a specific element)
- [ ] Test asserts that at least one listing card is visible on the page (or if no listings exist, the empty state message is shown)
- [ ] Test does NOT require login — the homepage is publicly accessible after the demo gate
- [ ] Test passes when run locally with the backend server running

---

## 4. Functional Requirements

- **FR-1:** The demo gate MUST check the password against the `VITE_DEMO_PASSWORD` environment variable, which is baked into the frontend bundle at build time by Vite.
- **FR-2:** The demo gate MUST store access in `localStorage` under key `gitcha_demo_access` with value `"true"` on correct password entry.
- **FR-3:** The demo gate MUST be completely invisible/skipped when `VITE_DEMO_PASSWORD` is not set — this is the local development experience.
- **FR-4:** The root `package.json` MUST define `build` and `start` scripts that Render can use to build and run the app.
- **FR-5:** The `render.yaml` MUST define a single Web Service that builds the frontend, installs backend deps, and starts the Express server.
- **FR-6:** All real secrets (DATABASE_URL, JWT_SECRET, API keys) MUST be set via Render dashboard — never hardcoded in committed files.
- **FR-7:** The `VITE_DEMO_PASSWORD` variable MUST be available at Vite build time (not just Express runtime), because Vite statically replaces `import.meta.env.VITE_*` references during build.
- **FR-8:** The GitHub repo MUST be private.
- **FR-9:** The E2E smoke tests MUST be runnable both locally and against the deployed URL by changing the base URL in the Playwright config.

## 5. Non-Goals (Out of Scope)

- **Custom domain** — Using `gitchacars.onrender.com` for now. Custom domain is a future task.
- **CI/CD pipeline** — No GitHub Actions. Render auto-deploys on push to `main`.
- **Docker containerization** — Render's native Node.js runtime is sufficient.
- **CDN for static assets** — Not needed at this scale.
- **Database backups** — Neon handles this automatically.
- **Monitoring / alerting** — Out of scope for initial deployment.
- **Rate limiting / DDoS protection** — Out of scope for a demo.
- **SSL certificate management** — Render provides this automatically on `.onrender.com` domains.
- **Separate staging environment** — Single environment for demo purposes.
- **Comprehensive E2E test suite** — Only core smoke tests. Full E2E coverage already exists in other test files.

## 6. Design Considerations

### Demo Gate UI
- Full-screen overlay, dark background matching the app's existing navy/charcoal theme
- Centered card with the GitchaCars branding
- Single password input + submit button
- Minimal, clean design — this is the first thing demo visitors see
- Should feel premium and intentional, not like a janky blocker
- Reuse existing CSS variables and color palette from the app

### Demo Gate UX
- Auto-focus the password input on load
- Submit on Enter key (not just button click)
- Clear error message on wrong password (inline, not an alert)
- Smooth transition when gate is removed (fade out)

## 7. Technical Considerations

### Vite Environment Variables
- Vite replaces `import.meta.env.VITE_*` at build time, not runtime
- The `VITE_DEMO_PASSWORD` must be set BEFORE running `npm run build` in the frontend
- In Render, all env vars (including `VITE_*`) are available during the build step, so this works automatically
- For local development: do NOT set `VITE_DEMO_PASSWORD` in `frontend/.env` — this keeps the gate disabled locally

### Render Free Tier
- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds (cold start)
- This is acceptable for a demo — warn users about the initial load time
- The Neon Postgres retry logic in `pool.js` already handles cold start connection delays

### Monorepo Structure
- Render needs a single build command and start command
- The root `package.json` orchestrates: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- The start command is: `cd backend && node src/server.js`
- This avoids needing a Dockerfile while keeping the monorepo structure

### Security Notes
- The demo password (`gitcha`) is NOT a security mechanism — it's a casual gate to prevent random traffic. It's stored client-side in localStorage and the password itself is baked into the frontend JS bundle. This is intentional and acceptable for a demo.
- Real authentication (JWT + bcrypt) protects all user data and actions behind login.
- The private GitHub repo prevents source code exposure.

## 8. Success Metrics

- The app is accessible at `https://gitchacars.onrender.com`
- Demo gate appears on first visit and unlocks with "gitcha"
- New users can register, create listings, and use the app
- Test accounts work (buyer1@example.com / password123)
- All 4 E2E smoke tests pass against the deployed URL
- Push to `main` triggers automatic redeployment on Render

## 9. Open Questions

- **Q1:** Should the Render service name be `gitchacars` (resulting in `gitchacars.onrender.com`) or something else? → Defaulting to `gitchacars`.
- **Q2:** Should we seed the production database with test data (test accounts, sample listings) or start fresh? → The Neon database already has test data from development, so no action needed unless the database is reset.
- **Q3:** Should Google OAuth be configured for the Render domain? Google OAuth requires the redirect URI to be whitelisted. → This is optional and can be done later in the Google Cloud Console.
