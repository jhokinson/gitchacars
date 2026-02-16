# GitchaCars

## What This Is
Demand-first car marketplace. Buyers post want listings, sellers introduce vehicles. Live at **https://gitchacars.onrender.com** (demo password: `gitcha`).

## Stack
| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Express 4 / Node.js | Raw SQL via `pg`, JWT auth, port 3001 |
| Frontend | React 19 / Vite 7 | Plain CSS (no Tailwind), CSS variables in `styles/variables.css` |
| Database | Neon Serverless Postgres | Connection via `backend/src/db/pool.js` |
| Hosting | Render (free tier) | Auto-deploys on push to `main` |
| Repo | github.com/jhokinson/gitchacars | Public |

## Critical Patterns (read before writing code)
1. **Response wrapper**: Backend wraps all responses in `{ data: ... }` via `utils/response.js`. Frontend accesses payload with `res.data.data`.
2. **API layer**: All frontend API calls go through `src/services/apiService.js` (axios + auth interceptor). Never use raw `fetch`.
3. **Auth**: `middleware/auth.js` exports `authenticate`, `optionalAuth`, `requireRole`. JWT stored in localStorage.
4. **Models**: Raw SQL in `src/models/`. No ORM.
5. **CSS**: Plain CSS with variables from `styles/variables.css`. No CSS-in-JS, no Tailwind.
6. **Vite env vars**: `VITE_*` vars are inlined at BUILD TIME. Changes require `npm run build`. This is the #1 deployment gotcha.
7. **Demo gate**: `DemoGate.jsx` wraps entire app. Reads `VITE_DEMO_PASSWORD`. Skipped when env var is empty (local dev).

## File Map (find things fast)
```
backend/
  src/
    app.js              ← Express app setup, route mounting, CORS
    server.js           ← Entry point (starts on PORT)
    routes/             ← 9 route files: admin, ai, auth, carImage, favorites, introductions, notifications, vehicles, wantListings
    controllers/        ← 9 controllers (match routes 1:1, plus googleAuth)
    models/             ← Raw SQL models: user, wantListing, vehicle, introduction, notification, favorites
    middleware/          ← auth.js (JWT), errorHandler.js
    services/           ← aiService.js (Anthropic), emailService.js (SendGrid), firebaseService.js
    db/
      pool.js           ← Neon PG pool
      migrate.js        ← Run migrations
      migrations/       ← SQL migration files
      seeds/            ← seed.js (test data), seedZipCodes.js
frontend/
  src/
    App.jsx             ← Router + DemoGate + AuthProvider + ToastProvider
    components/         ← 64 components (NavBar, ListingCard, FilterSidebar, AIChatBox, DemoGate, etc.)
    pages/              ← 21 pages (HomePage, AuthPage, DashboardPage, CreateListingPage, etc.)
    services/
      apiService.js     ← Centralized API client
      firebaseService.js ← Lazy-loaded Firebase
    context/            ← AuthContext, ToastContext
    styles/             ← variables.css, base.css, components.css
  e2e/                  ← Playwright tests (smoke-deploy.spec.js + feature tests)
  playwright.config.js  ← baseURL: localhost:3001
tasks/                  ← PRD files (see below)
render.yaml             ← Render deployment blueprint
package.json            ← Root: build/start scripts for Render
```

## Commands
```bash
# Dev (local)
cd backend && node src/server.js          # Start server → localhost:3001
cd frontend && npm run build              # Rebuild frontend after changes
cd frontend && VITE_DEMO_PASSWORD=gitcha npm run build  # Build with demo gate

# Test
cd frontend && npx playwright test e2e/smoke-deploy.spec.js  # 4 smoke tests
cd frontend && npx playwright test        # All E2E tests

# Deploy (auto on push to main)
git push origin main                      # Triggers Render auto-deploy

# Database
cd backend && npm run migrate             # Run migrations
cd backend && node src/db/seeds/seed.js   # Seed test data

# Playwright screenshots (for verification)
npx playwright screenshot --browser chromium --wait-for-timeout=3000 "http://localhost:3001/path" /tmp/screenshot.png
```

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | jhokinson@gmail.com | password123 |
| Buyer | buyer1@example.com | password123 |
| Buyer | buyer2@example.com | password123 |
| Seller | seller1@example.com | password123 |
| Seller | seller2@example.com | password123 |

## Render Deployment
- **Service ID**: `srv-d691fjl6ubrc73abe3g0`
- **Build command**: `npm run build` (root package.json → installs frontend with `--include=dev`, builds Vite, installs backend)
- **Start command**: `npm start` (→ `cd backend && node src/server.js`)
- **Env vars**: Set via Render API or dashboard. `VITE_*` vars require rebuild.
- **Free tier**: Spins down after 15min idle. Cold start ~30-60s.

## Build Mode — Autonomous Development

When told to "build", given a PRD, or told to "run Ralph":

1. Read the PRD from `tasks/`
2. Implement each user story in order (US-001, US-002, etc.)
3. After each story, verify ALL acceptance criteria:
   - API: curl endpoints
   - UI: Playwright screenshots
   - Build: `cd frontend && npm run build` must pass
4. Never stop or ask for confirmation between stories
5. If something fails, debug and fix immediately
6. Print "US-XXX COMPLETE" after each story
7. Print "BUILD COMPLETE" when all stories are done

### Rules
- Never ask "Should I proceed?" — just proceed
- If a dependency is missing, install it
- If the server isn't running, start it
- If a test fails, fix the code and re-test
- Keep server running between stories (restart only for backend changes)

## PRDs
| File | Status | Scope |
|------|--------|-------|
| `prd-gitchacars-backend.md` | Done | Core backend API |
| `prd-gitchacars-frontend.md` | Done | Core frontend UI |
| `prd-gitchacars-ui-framework.md` | Done | UI redesign (28 stories) |
| `prd-gitchacars-e2e-testing.md` | Done | E2E testing (18 stories) |
| `prd-gitchacars-ux-overhaul.md` | Done | UX overhaul |
| `prd-gitchacars-ux-phase2.md` | Done | Floating navbar, car images, colors |
| `prd-gitchacars-ux-phase3.md` | Done | Auth, cards, intro/AI |
| `prd-gitchacars-ux-phase4.md` | Done | Sidebar, smart action, visual |
| `prd-gitchacars-deploy.md` | Done | Deployment to Render |
| `prd-gitchacars-ai-listing.md` | Done | AI chat listing creation |
| `prd-gitchacars-auth-ui.md` | Done | Auth page redesign |
| `prd-gitchacars-bugfix-phase5.md` | Review | Bug fixes |

## Lessons Learned (saves debugging time)
1. **Vite + Render**: `NODE_ENV=production` skips devDependencies. Build command must use `npm install --include=dev` for frontend or Vite won't be found.
2. **Render build commands**: Default auto-detection may choose `yarn`. Always verify and override to `npm run build` / `npm start`.
3. **iCloud Drive**: Files in iCloud-synced directories can become `compressed,dataless` (macOS eviction). Reads return 0 bytes silently. Never develop from iCloud folders. The project was moved from `~/Desktop/Jake Development/Auto` to `~/gitchacars` for this reason.
4. **Playwright strict mode**: Locators matching multiple elements fail. Always use `.first()` or more specific selectors.
5. **gh CLI auth**: `gh auth login --web` needs a real TTY. When running from Claude Code, have the user run it in their Terminal app separately.
6. **Render CLI auth**: After `render login`, must also run `render workspace set <teamId>` before any commands work. Workspace ID: `tea-d66crdp5pdvs73ed1it0`.
7. **Response shape debugging**: If frontend shows undefined, check the `res.data.data` nesting. It's always `{ data: { ...payload } }` from the backend wrapper.
