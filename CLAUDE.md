# GitchaCars — Project Instructions

## Project Overview
GitchaCars is a demand-first car marketplace where buyers post want listings and sellers introduce private vehicles. Tech stack: Node.js/Express 4 backend, React/Vite frontend, Neon Postgres, Firebase (chat/storage), SendGrid (email).

## Architecture
- **Backend**: `/backend/` — Express 4, raw SQL with `pg`, JWT auth, served on port 3001
- **Frontend**: `/frontend/` — React 19, Vite 7, plain CSS, production build served by Express
- **Database**: Neon Serverless Postgres (connection string in `backend/.env`)
- **Unified server**: Backend serves both API (`/api/*`) and frontend static files (`frontend/dist/`) on port 3001

## Key Patterns
- Backend wraps all responses in `{ data: ... }` via `utils/response.js` — frontend must use `res.data.data` to access payload
- All backend models use raw SQL queries with `db/pool.js`
- Auth middleware in `middleware/auth.js` provides `authenticate` and `requireRole`
- Frontend uses `apiService.js` as the single API layer (axios with auth interceptor)
- Firebase services are lazy-loaded (not required at startup)

## Test Accounts
- Admin: jhokinson@gmail.com / password123
- Buyer: buyer1@example.com / password123
- Buyer: buyer2@example.com / password123
- Seller: seller1@example.com / password123
- Seller: seller2@example.com / password123

## Running the App
```bash
# Start unified server (API + frontend)
cd backend && node src/server.js
# App available at http://localhost:3001

# Rebuild frontend after changes
cd frontend && npm run build
```

## Build Mode — Autonomous Development

When told to "build autonomously" or given a PRD to implement:

1. **Read the specified PRD file** from `tasks/` directory
2. **Implement each user story in order** (US-001, US-002, etc.)
3. **After each story**, verify ALL acceptance criteria yourself:
   - Run the server and test API endpoints with curl
   - Use Playwright screenshots to verify UI changes: `npx playwright screenshot --browser chromium --wait-for-timeout=3000 "http://localhost:3001/path" /tmp/screenshot.png`
   - Check for console errors or build failures
4. **Do NOT stop or ask for confirmation** between stories — keep going
5. **If something fails**, debug and fix it immediately — do not skip stories
6. **After fixing frontend code**, rebuild: `cd frontend && npm run build`
7. **Print "US-XXX COMPLETE"** after each story passes all acceptance criteria
8. **When ALL stories are done**, print "BUILD COMPLETE" and summarize what was built

### Important Rules for Autonomous Builds
- Never ask "Should I proceed?" — just proceed
- Never ask "Is this approach okay?" — pick the best approach and build it
- If a dependency is missing, install it
- If the server isn't running, start it
- If a test fails, fix the code and re-test
- Always verify in browser via Playwright, not just curl
- Keep the server running between stories (restart only when backend changes require it)

## PRD Files
- `tasks/prd-gitchacars-backend.md` — Original backend PRD (completed)
- `tasks/prd-gitchacars-frontend.md` — Original frontend PRD (completed)
- `tasks/prd-gitchacars-ui-framework.md` — UI redesign PRD (28 stories)
- `tasks/prd-gitchacars-e2e-testing.md` — E2E testing PRD (18 stories)
