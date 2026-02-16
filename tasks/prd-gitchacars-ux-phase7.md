# PRD: GitchaCars UX Phase 7 — Navigation CTA, Open Access, NHTSA Vehicle Data, Sidebar Fix, Realistic Seed Data

## 1. Introduction/Overview

GitchaCars has five UX and data gaps blocking conversion and credibility: (1) the navbar hides key actions from logged-out visitors, missing the chance to funnel them into sign-up; (2) there is no prominent "Post Want Listing" CTA button, the primary conversion action; (3) the vehicle make/model data is incomplete — missing modern exotics, EVs, and recent models; (4) the filter sidebar still clips content on desktop due to parent layout constraints; and (5) the seed data is generic and sparse, making the demo feel unrealistic. This phase fixes all five to bring the platform to demo-ready, investor-pitch quality.

## 2. Goals

- **Open navigation**: Every nav item visible to all users; protected items funnel to sign-in via inline toast (no jarring redirect)
- **Prominent CTA**: Solid primary "Post Want Listing" button on right side of navbar, always visible, matching app.gitcha.com pattern
- **Comprehensive vehicle data**: Replace `car-info` with NHTSA's free vPIC API for makes/models, with server-side caching and `car-info` fallback
- **Fix sidebar height**: Ensure filter sidebar never clips or scrolls independently on desktop — extends fully with content
- **Realistic seed data**: 10-15 diverse, elaborately written want listings across classic, exotic, SUV, daily driver, EV, and luxury categories with 6-8 matching vehicles
- **E2E coverage**: Every feature has dedicated Playwright tests

## 3. User Stories

---

### US-001: NHTSA Vehicle Makes API Endpoint
**Description:** As a developer, I want a backend endpoint that returns all vehicle makes from NHTSA's vPIC API with server-side caching so the frontend has comprehensive, up-to-date make data without hitting an external API on every request.

**Acceptance Criteria:**
- [ ] New route `GET /api/vehicles/makes` in `backend/src/routes/vehicles.js`
- [ ] New controller function `getVehicleMakes` in `backend/src/controllers/vehicleController.js`
- [ ] Calls NHTSA vPIC API: `https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json`
- [ ] Response shape: `{ data: [{ value: "Toyota", label: "Toyota" }, ...] }` — sorted alphabetically by label
- [ ] In-memory cache with 24-hour TTL (use a simple `let cache = { data: null, timestamp: 0 }` pattern)
- [ ] If NHTSA API fails or times out (5s), fall back to `car-info` package's `getMakes()` and return those
- [ ] NHTSA response is filtered to exclude makes with empty/null names
- [ ] Endpoint requires no authentication (public)
- [ ] Test via `curl http://localhost:3001/api/vehicles/makes | head -c 500` — returns JSON array of makes

---

### US-002: NHTSA Vehicle Models API Endpoint
**Description:** As a developer, I want a backend endpoint that returns models for a given make from NHTSA's vPIC API so the Model dropdown has complete, accurate data.

**Acceptance Criteria:**
- [ ] New route `GET /api/vehicles/models/:make` in `backend/src/routes/vehicles.js`
- [ ] New controller function `getVehicleModels` in `backend/src/controllers/vehicleController.js`
- [ ] Calls NHTSA vPIC API: `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/{make}?format=json`
- [ ] Response shape: `{ data: [{ value: "Camry", label: "Camry" }, ...] }` — sorted alphabetically
- [ ] Per-make in-memory cache with 24-hour TTL (use a `Map` keyed by lowercase make name)
- [ ] If NHTSA API fails, fall back to `car-info` package's `getModels(make)` and return those
- [ ] Endpoint requires no authentication (public)
- [ ] URL-encode the make parameter before sending to NHTSA (handles "Mercedes-Benz", etc.)
- [ ] Test via `curl http://localhost:3001/api/vehicles/models/Toyota` — returns models including Camry, Corolla, RAV4, etc.
- [ ] Test via `curl http://localhost:3001/api/vehicles/models/McLaren` — returns 720S, 570S, GT, etc. (data `car-info` is missing)

---

### US-003: Frontend — Fetch Makes/Models from Backend API
**Description:** As a user, I want the Make and Model dropdowns to load comprehensive data from the NHTSA-backed API so I can find any vehicle brand including exotics, EVs, and modern models.

**Acceptance Criteria:**
- [ ] Add `apiService.vehicles.makes()` and `apiService.vehicles.models(make)` methods to `frontend/src/services/apiService.js`
- [ ] In `FilterSidebar.jsx`: fetch makes from API on component mount instead of importing from `car-info` directly
- [ ] Makes loaded into state; show loading indicator (or keep `car-info` data as initial value until API responds)
- [ ] When Make is selected, fetch models from `apiService.vehicles.models(make)` — show brief loading state
- [ ] "Any" option is always prepended (not from API)
- [ ] If API call fails, fall back to existing `car-info` data from `carMakesModels.js` (keep the import as fallback)
- [ ] `carMakesModels.js` remains in codebase as fallback — do not delete
- [ ] No flicker: if `car-info` data loads instantly, show it; if API data arrives, replace silently
- [ ] Typecheck passes
- [ ] **Verify in browser**: open Make dropdown → see 100+ makes (far more than the 71 from car-info) → select "McLaren" → Model dropdown shows 720S, 570S, GT, etc.

---

### US-004: Navbar — "Post Want Listing" CTA on Right Side
**Description:** As a visitor, I want a prominent "Post Want Listing" button on the right side of the navbar so I immediately know the primary action I can take.

**Acceptance Criteria:**
- [ ] In `NavBar.jsx`: add a solid primary CTA button ("Post Want Listing") positioned to the RIGHT of the nav links and to the LEFT of auth buttons (Sign In/Sign Up) or user controls (NotificationBell/Avatar)
- [ ] Button is always visible regardless of auth state
- [ ] When authenticated: clicking navigates to `/create-listing`
- [ ] When not authenticated: clicking shows an inline toast notification "Sign in to post a want listing" with a clickable "Sign In" link that navigates to `/auth?mode=login&redirect=/create-listing`
- [ ] Button uses classes `btn btn-primary btn-sm navbar-cta`
- [ ] Button has a "+" icon (SVG) before the text label
- [ ] On mobile (≤480px): text label hides, only icon visible (reuse existing `.navbar-cta-label` pattern)
- [ ] The existing "Post Want" text link in the nav links area is removed (replaced by the CTA button)
- [ ] CSS: `.navbar-cta` gets `white-space: nowrap` to prevent text wrapping
- [ ] Typecheck passes
- [ ] **Verify in browser**: logged out → see blue "Post Want Listing" button on right → click → toast appears with sign-in link → click sign-in → redirected to auth page with redirect param

---

### US-005: Navbar — Open All Menu Items to Unauthenticated Users
**Description:** As an unauthenticated visitor, I want to see all navigation items (Browse, Dashboard, Add Vehicle) so I can understand what the platform offers, and clicking any protected item prompts me to sign in.

**Acceptance Criteria:**
- [ ] In `NavBar.jsx`: remove the `{isAuthenticated && (...)}` conditional wrapping around Dashboard and Add Vehicle links — they are now always visible
- [ ] Admin link remains gated behind `isAuthenticated && isRole('admin')` (admin-only is correct)
- [ ] When an unauthenticated user clicks "Dashboard" or "Add Vehicle": show an inline toast notification saying "Sign in to access [page name]" with a clickable "Sign In" link to `/auth?mode=login&redirect=/[page-path]`
- [ ] Toast uses the existing `useToast()` context (import `useToast` from `../context/ToastContext`)
- [ ] Toast auto-dismisses after 4 seconds
- [ ] The link inside the toast text is styled with `color: var(--color-accent)` and underline
- [ ] Mobile menu also shows all items; same toast behavior for protected items when logged out
- [ ] Typecheck passes
- [ ] **Verify in browser**: logged out → see Browse, Dashboard, Add Vehicle, Post Want Listing CTA → click Dashboard → toast appears "Sign in to access Dashboard" with Sign In link → page does NOT navigate away

---

### US-006: Fix Filter Sidebar Height — Remove Parent Layout Constraints
**Description:** As a user, I want the filter sidebar to extend fully with its content on desktop so every filter option is visible when expanded, with no clipping or independent scrollbar.

**Acceptance Criteria:**
- [ ] In `FilterSidebar.css`: change `overflow: hidden` to `overflow: visible` on `.filter-sidebar`
- [ ] Apply `border-radius` clipping to `.filter-sidebar-header` (top corners) and the last `.filter-section` or `.filter-sidebar-footer` (bottom corners) individually instead of relying on container overflow
- [ ] In `HomePage.css`: ensure `.home-sidebar-desktop` has no `max-height`, no `overflow` constraints, and no `height` or `flex-basis` that limits the sidebar
- [ ] In `HomePage.css`: ensure `.home-page` flex layout uses `align-items: flex-start` (sidebar aligns to top, not stretched to content height)
- [ ] Test: open ALL filter sections simultaneously on desktop (Make/Model, Price, Year, Mileage, Location, Vehicle Type, Transmission, Drivetrain) — all content visible, no sidebar scrollbar, only the page scrollbar exists
- [ ] Mobile overlay behavior unchanged (mobile `.filter-sidebar` keeps its `position: fixed` + `max-height: 85vh` + `overflow-y: auto`)
- [ ] Typecheck passes
- [ ] **Verify in browser**: expand all 8 filter sections → page scrollbar handles all content → no sidebar scrollbar → no content clipped

---

### US-007: Realistic & Diverse Seed Want Listings
**Description:** As a demo viewer, I want to see a variety of realistic want listings that showcase the breadth of the marketplace — from budget daily drivers to classic car collectors to exotic car seekers.

**Acceptance Criteria:**
- [ ] In `backend/src/db/seeds/seed.js`: add 4 new buyer users with distinct, realistic names:
  - `marcus.chen@example.com` / Marcus Chen / buyer (daily driver + EV seeker)
  - `sarah.mitchell@example.com` / Sarah Mitchell / buyer (classic car collector)
  - `james.rodriguez@example.com` / James Rodriguez / buyer (exotic + luxury)
  - `emily.watson@example.com` / Emily Watson / buyer (family + budget)
- [ ] Add 2 new seller users:
  - `david.kim@example.com` / David Kim / seller (exotic dealer)
  - `rachel.green@example.com` / Rachel Green / seller (used car dealer)
- [ ] Add 12 new want listings (15 total with existing 3) across these categories:
  - **Classic**: 1967 Ford Mustang Fastback, 1970 Chevrolet Chevelle SS
  - **Exotic**: Ferrari 488 GTB, Porsche 911 Turbo S (991/992), Lamborghini Huracán
  - **Luxury SUV**: Range Rover Sport, BMW X5 M Competition
  - **Specific truck**: RAM 2500 Cummins diesel with towing package
  - **Daily driver budget**: Honda Accord under $15k, Mazda CX-5 under $25k
  - **EV**: Tesla Model Y Long Range, Rivian R1S
  - **Project car**: Nissan 240SX / Silvia for drift build
- [ ] Each listing has an elaborately written `description` (2-4 sentences) with specific details about what the buyer wants — not generic "looking for a reliable car" but real enthusiast language
- [ ] Each listing uses realistic zip codes from different US regions (LA, NYC, Chicago, Austin, Miami, Denver, Seattle)
- [ ] Each listing has appropriate `transmission`, `drivetrain`, `mileageMax`, `condition` fields where relevant
- [ ] Listings are distributed across the 6 buyer accounts (existing 2 + new 4)
- [ ] `ON CONFLICT` handling: seed is idempotent — re-running doesn't create duplicates (use email-based conflict for users, title-based or delete-and-recreate for listings)
- [ ] Test: `cd ~/gitchacars/backend && node src/db/seeds/seed.js` completes without errors
- [ ] **Verify**: `curl http://localhost:3001/api/want-listings?limit=20` returns 15 listings with diverse makes/titles

---

### US-008: Realistic & Diverse Seed Vehicles
**Description:** As a demo viewer, I want to see matching vehicles in seller inventories that correspond to some of the want listings, demonstrating the marketplace's matching flow.

**Acceptance Criteria:**
- [ ] In `backend/src/db/seeds/seed.js`: add 6 new vehicles (8 total with existing 2) that partially match want listings:
  - 2019 Ferrari 488 GTB — 12k miles, $245k (matches exotic listing)
  - 2021 Porsche 911 Turbo S — 8k miles, $189k (matches Porsche listing)
  - 1968 Ford Mustang Fastback — 78k miles, $55k (matches classic listing)
  - 2023 Tesla Model Y Long Range — 15k miles, $42k (matches EV listing)
  - 2022 Range Rover Sport HSE — 22k miles, $68k (matches luxury SUV listing)
  - 2020 RAM 2500 Cummins — 35k miles, $52k (matches truck listing)
- [ ] Each vehicle has a detailed `description` (2-3 sentences) with enthusiast-appropriate language
- [ ] Each vehicle has 3 placeholder image URLs (using placehold.co with descriptive text)
- [ ] Vehicles distributed across all 4 seller accounts (existing 2 + new 2)
- [ ] Test: `cd ~/gitchacars/backend && node src/db/seeds/seed.js` completes without errors
- [ ] **Verify**: `curl http://localhost:3001/api/vehicles?limit=20` returns 8 vehicles with diverse makes

---

### US-009: E2E Tests — NHTSA API & Model Dropdown
**Description:** As a developer, I want E2E tests verifying the NHTSA-backed makes/models load correctly in the filter sidebar.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase7-vehicle-data.spec.js`
- [ ] Test: Make dropdown contains more than 71 options (proving NHTSA data loaded, not just car-info)
- [ ] Test: Select "McLaren" → Model dropdown appears with multiple models (car-info only has 1)
- [ ] Test: Select "Rivian" → Model dropdown appears (car-info doesn't have Rivian at all)
- [ ] Test: Select "Toyota" → Model dropdown contains "Camry", "Corolla", "RAV4" (basic sanity)
- [ ] Test: If API is slow, Make dropdown still shows options (car-info fallback loaded initially)
- [ ] Tests pass via `cd ~/gitchacars/frontend && npx playwright test e2e/ux-phase7-vehicle-data.spec.js`

---

### US-010: E2E Tests — Navbar CTA & Open Access
**Description:** As a developer, I want E2E tests for the navbar CTA button and open navigation.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase7-navbar.spec.js`
- [ ] Test: Unauthenticated user sees "Post Want Listing" CTA button in navbar
- [ ] Test: Unauthenticated user sees "Dashboard" and "Add Vehicle" nav links
- [ ] Test: Clicking "Post Want Listing" when logged out shows a toast containing "Sign in"
- [ ] Test: Clicking "Dashboard" when logged out shows a toast containing "Sign in to access Dashboard"
- [ ] Test: Toast contains a clickable link to `/auth`
- [ ] Test: Logged-in user clicking "Post Want Listing" navigates to `/create-listing`
- [ ] Test: Logged-in user clicking "Dashboard" navigates to `/dashboard`
- [ ] Tests pass via `cd ~/gitchacars/frontend && npx playwright test e2e/ux-phase7-navbar.spec.js`
- [ ] Uses existing `loginAsBuyer`/`loginAsSeller` helpers

---

### US-011: E2E Tests — Sidebar Height Fix
**Description:** As a developer, I want E2E tests verifying the sidebar extends fully with no independent scroll.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase7-sidebar.spec.js`
- [ ] Test: `.filter-sidebar` does not have `overflow-y: auto` or `overflow-y: scroll` computed style
- [ ] Test: `.home-sidebar-desktop` does not have `max-height` or `overflow` constraints
- [ ] Test: Expand all 8 filter sections → `.filter-sidebar` scrollHeight equals its clientHeight (no hidden overflow)
- [ ] Test: Page has a vertical scrollbar when all sections are expanded (page handles scroll, not sidebar)
- [ ] Tests pass via `cd ~/gitchacars/frontend && npx playwright test e2e/ux-phase7-sidebar.spec.js`

---

### US-012: E2E Tests — Seed Data Diversity
**Description:** As a developer, I want E2E tests verifying the seed data is diverse and realistic.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase7-seed-data.spec.js`
- [ ] Test: Homepage loads at least 10 want listings (up from 3)
- [ ] Test: Listings contain at least 3 different makes visible on first page
- [ ] Test: At least one listing title contains "Ferrari" or "Porsche" or "Lamborghini" (exotic representation)
- [ ] Test: At least one listing title contains "Mustang" or "Chevelle" or classic car reference
- [ ] Test: Listings have descriptions longer than 50 characters (not generic one-liners)
- [ ] Tests pass via `cd ~/gitchacars/frontend && npx playwright test e2e/ux-phase7-seed-data.spec.js`

---

## 4. Functional Requirements

**NHTSA Vehicle Data:**
- FR-1: Backend exposes `GET /api/vehicles/makes` returning all NHTSA makes, cached for 24 hours
- FR-2: Backend exposes `GET /api/vehicles/models/:make` returning models for a make, cached per-make for 24 hours
- FR-3: Both endpoints fall back to `car-info` npm package data if NHTSA API is unavailable
- FR-4: NHTSA API calls use a 5-second timeout to prevent hanging
- FR-5: Response shape matches existing pattern: `{ data: [...] }` via the response wrapper
- FR-6: Frontend fetches makes on FilterSidebar mount, models on make selection
- FR-7: Frontend uses `car-info` data as initial/fallback, replaced when API responds

**Navbar CTA & Open Access:**
- FR-8: "Post Want Listing" is a solid primary button (`btn btn-primary`) on the far right of the navbar, before auth buttons or user controls
- FR-9: All nav links (Browse, Dashboard, Add Vehicle) are visible regardless of auth state
- FR-10: Clicking a protected item when logged out triggers a toast via `useToast()` with a sign-in link including redirect param
- FR-11: Toast auto-dismisses after 4 seconds
- FR-12: Admin link remains gated behind `isAuthenticated && isRole('admin')`
- FR-13: Mobile navbar shows all items; same toast behavior applies

**Filter Sidebar:**
- FR-14: `.filter-sidebar` uses `overflow: visible` on desktop; border-radius applied to individual child elements
- FR-15: `.home-sidebar-desktop` has no height/overflow constraints
- FR-16: `.home-page` uses `align-items: flex-start` (already present, verify)
- FR-17: Mobile sidebar retains `position: fixed` + `max-height: 85vh` + `overflow-y: auto`

**Seed Data:**
- FR-18: 6 buyer users total (existing 2 + 4 new with real names and diverse locations)
- FR-19: 4 seller users total (existing 2 + 2 new)
- FR-20: 15 want listings total across 6 categories: classic, exotic, luxury SUV, truck, daily driver/budget, EV/project
- FR-21: 8 vehicles total, partially matching want listings to demonstrate the marketplace flow
- FR-22: Seed is idempotent — safe to re-run without duplicates

## 5. Non-Goals (Out of Scope)

- **No paid APIs**: NHTSA vPIC API is free and government-operated. No API keys needed.
- **No database schema changes**: Want listings and vehicles tables already support all needed fields.
- **No year/trim-level filtering via API**: NHTSA has year-specific data but we only need make → model mapping for the dropdown.
- **No real car images**: Seed vehicles continue using placehold.co placeholder images.
- **No autocomplete/typeahead**: Make and Model remain `<select>` dropdowns, not search-as-you-type inputs.
- **No removal of `car-info` package**: It stays as a fallback; do not uninstall it.
- **No changes to ProtectedRoute.jsx**: The route guard still exists for direct URL access — we're only changing the navbar click behavior.
- **No toast component rewrite**: Use the existing `useToast()` context as-is.

## 6. Design Considerations

**Navbar Layout (left to right):**
```
[GitchaCars logo] — [Browse] [Dashboard] [Add Vehicle] — [Post Want Listing CTA] [Sign In] [Sign Up]
                                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                          NEW: solid blue primary button
```
When logged in:
```
[GitchaCars logo] — [Browse] [Dashboard] [Add Vehicle] — [Post Want Listing CTA] [Bell] [Avatar]
```

**Toast for Protected Items:**
When an unauthenticated user clicks "Dashboard":
```
┌──────────────────────────────────────────┐
│ Sign in to access Dashboard. [Sign In →] │
└──────────────────────────────────────────┘
```
Toast appears at top-right, auto-dismisses after 4 seconds. "Sign In" is a clickable link styled with `var(--color-accent)`.

**Seed Data Tone Examples:**
- Classic: "Searching for a numbers-matching '67 Fastback in Highland Green or Raven Black. Must be a real S-code 390 GT, not a clone. Willing to travel for the right car."
- Exotic: "Looking for a low-mile 488 GTB with the carbon fiber racing package. Prefer Rosso Corsa or Grigio Silverstone. Must have full dealer service history."
- Budget: "Need a reliable commuter under $15k. Prefer Honda or Toyota for parts availability. Automatic, good on gas, under 100k miles."

**NHTSA API Notes:**
- Base URL: `https://vpic.nhtsa.dot.gov/api/`
- No API key required, no rate limits documented
- Response format: JSON with `Results` array containing `Make_Name`/`Model_Name` fields
- Some makes have hundreds of models (Mercedes-Benz: 200+) — this is fine for a dropdown

## 7. Technical Considerations

**NHTSA API Integration:**
- The vPIC API returns data in `{ Results: [{ Make_Name: "...", Model_Name: "..." }] }` format
- Makes endpoint returns ~1000+ makes including commercial vehicles — filter to passenger vehicle makes or accept all
- Models endpoint returns all models ever produced for a make (no year filtering) — this is ideal for our use case
- Server-side caching avoids CORS issues and reduces external API calls
- Use Node's built-in `fetch` (available in Node 18+) or `axios` (already in backend dependencies)

**Cache Strategy:**
```js
// Simple in-memory cache pattern
const cache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCached(key) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data
  return null
}
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}
```

**Navbar Toast Pattern:**
```jsx
const handleProtectedClick = (e, path, label) => {
  if (!isAuthenticated) {
    e.preventDefault()
    toast.info(<>Sign in to access {label}. <Link to={`/auth?mode=login&redirect=${path}`}>Sign In</Link></>)
  }
}
```

**Seed Idempotency:**
The existing seed uses `ON CONFLICT (email) DO UPDATE SET password_hash = $2` for users. Want listings should use a delete-and-recreate pattern: `DELETE FROM want_listings WHERE user_id IN (seeded user ids)` before reinserting, to safely re-run without accumulating duplicates.

## 8. Success Metrics

- Make dropdown shows 100+ makes (vs 71 from car-info alone)
- McLaren shows 10+ models (vs 1 from car-info)
- "Post Want Listing" CTA visible on every page, every auth state
- All nav items visible when logged out; toasts fire correctly on protected items
- Filter sidebar: zero independent scrollbar on desktop with all sections expanded
- Homepage shows 15 diverse want listings spanning 6+ categories
- All 4 new E2E spec files pass
- Existing Phase 6 E2E tests unaffected
- `npm run build` passes clean
- `node src/db/seeds/seed.js` runs idempotently

## 9. Open Questions

1. **NHTSA makes filtering**: The NHTSA API returns ~10,000+ makes including commercial/heavy vehicles (e.g., "Peterbilt", "Freightliner"). Should we filter to passenger vehicles only, or show all? **Recommendation**: Filter to common passenger makes (~200-300) using a lightweight allowlist or by cross-referencing with car-info's 71 makes as a base set, plus known missing brands.

2. **Toast component**: Does the existing `useToast()` support JSX content (with clickable links), or only plain strings? If string-only, we may need to extend it. **Action**: Check `ToastContext.jsx` during implementation.

---

## Files to Modify

| File | Stories | Changes |
|------|---------|---------|
| `backend/src/routes/vehicles.js` | US-001, US-002 | Add `/makes` and `/models/:make` routes |
| `backend/src/controllers/vehicleController.js` | US-001, US-002 | Add `getVehicleMakes`, `getVehicleModels` with NHTSA + cache + fallback |
| `frontend/src/services/apiService.js` | US-003 | Add `vehicles.makes()` and `vehicles.models(make)` methods |
| `frontend/src/components/FilterSidebar.jsx` | US-003 | Fetch makes/models from API, fallback to car-info |
| `frontend/src/components/NavBar.jsx` | US-004, US-005 | Add CTA button, open all links, toast on protected clicks |
| `frontend/src/components/NavBar.css` | US-004 | CTA button styling |
| `frontend/src/components/FilterSidebar.css` | US-006 | Change overflow to visible, individual border-radius |
| `frontend/src/pages/HomePage.css` | US-006 | Verify/fix sidebar container constraints |
| `backend/src/db/seeds/seed.js` | US-007, US-008 | Add users, diverse want listings, matching vehicles |
| `frontend/e2e/ux-phase7-vehicle-data.spec.js` | US-009 | New file — NHTSA makes/models tests |
| `frontend/e2e/ux-phase7-navbar.spec.js` | US-010 | New file — CTA + open access tests |
| `frontend/e2e/ux-phase7-sidebar.spec.js` | US-011 | New file — sidebar height tests |
| `frontend/e2e/ux-phase7-seed-data.spec.js` | US-012 | New file — seed data diversity tests |

## Parallelization Strategy (for Ralph)

These workstreams are independent and can run in parallel terminals:

**Terminal 1 — Backend API (US-001, US-002):**
NHTSA proxy endpoints + caching + fallback. No frontend dependency.

**Terminal 2 — Seed Data (US-007, US-008):**
New users + want listings + vehicles. No frontend dependency. Can run `seed.js` independently.

**Terminal 3 — Frontend Navbar + Sidebar (US-004, US-005, US-006):**
NavBar CTA + open access + sidebar CSS fix. Independent of API changes (existing filter behavior works).

**Terminal 4 — Frontend Vehicle Data Integration (US-003):**
Depends on Terminal 1 (backend API). Start after US-001/002 complete.

**Terminal 5 — E2E Tests (US-009 through US-012):**
Depends on all other terminals. Run last.
