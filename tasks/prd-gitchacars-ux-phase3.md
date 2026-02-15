# PRD: GitchaCars UX Phase 3

## Introduction/Overview

This PRD covers the third phase of UX improvements for GitchaCars. It addresses seven areas: fixing the price range filter's nested border issue, installing a comprehensive make/model npm package for complete vehicle data, redesigning listing cards with two-level titles, aligning the floating pill navbar width with the content area, consolidating login/register into a single auth page with tab toggle, redesigning the introduction box to match the app.gitcha.com format with a full inline form, and fixing the AI chat feature that is currently not responding.

## Goals

- Eliminate the remaining box-in-box visual bug in the Price Range filter section
- Provide comprehensive, real-world make/model data via an npm package for both filters and forms
- Give listing cards two distinct title levels: a custom buyer title and an auto-generated subtitle
- Align the floating navbar width with the content area so edges line up perfectly
- Modernize authentication UX with a single page that toggles between sign-in and sign-up
- Build a full-featured introduction form on the detail page (vehicle selector, message, send button, login gate)
- Fix AI chat so it works end-to-end: user types, AI responds, listing data is extracted
- Maintain all 169 existing E2E tests passing
- Add new E2E tests for every changed feature

## User Stories

---

### US-001: Fix Price Range Filter Box-in-Box

**Description:** As a buyer, I want the price range filter to look clean and consistent with other filter sections so that there is no nested border/box appearance.

**Acceptance Criteria:**
- [ ] The `.range-slider-input-group` border is removed (set to `border: none`)
- [ ] The `.range-slider-input-group` background matches the filter section bg pattern (use `var(--color-bg-secondary)`)
- [ ] No visible nested box/border appears inside the Price Range filter section
- [ ] All other filter sections remain visually unchanged
- [ ] The RangeSlider component still functions correctly (dragging thumbs, typing values)
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-002: Install and Integrate car-makes-models-data Package

**Description:** As a developer, I want to install a comprehensive car makes/models npm package so that the app has complete, real-world vehicle data instead of hardcoded arrays.

**Acceptance Criteria:**
- [ ] An npm package for car makes/models is installed in the frontend (`car-makes-models-data` or equivalent)
- [ ] A new utility file `frontend/src/data/carMakesModels.js` wraps the package and exports `getAllMakes()` and `getModelsByMake(make)` functions
- [ ] `getAllMakes()` returns an array of `{ value, label }` objects sorted alphabetically
- [ ] `getModelsByMake(make)` returns an array of `{ value, label }` objects for the selected make
- [ ] The existing `vehicleData.js` continues to export `getModelInfo()` and `getSuggestedFeatures()` for enrichment but delegates make/model lists to the new utility
- [ ] Typecheck passes

---

### US-003: Update FilterSidebar to Use Complete Make/Model Data

**Description:** As a buyer, I want the Make filter dropdown to show all real car makes so that I can filter by any manufacturer.

**Acceptance Criteria:**
- [ ] The `MAKES` array in `FilterSidebar.jsx` is replaced with data from the new `carMakesModels.js` utility
- [ ] The Make dropdown shows all available makes (50+), with "Any" as the first option
- [ ] Selecting a make filters listings correctly (existing API behavior unchanged)
- [ ] The dropdown is still a simple `<select>` element (not SearchableSelect, keeping it lightweight for filters)
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-004: Update Create/Edit Listing Forms to Use Complete Make/Model Data

**Description:** As a buyer creating a listing, I want the Make and Model dropdowns to show all available makes and models so that I can accurately describe the car I want.

**Acceptance Criteria:**
- [ ] `CreateListingPage.jsx` and `EditListingPage.jsx` use `getAllMakes()` and `getModelsByMake()` from the new utility
- [ ] When a Make is selected, the Model dropdown updates to show all models for that make
- [ ] The SearchableSelect component still works correctly with the larger dataset
- [ ] The "Other" option is still available for both Make and Model
- [ ] AI chat auto-population still works correctly with the new data
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-005: Want Listing Card Two-Level Titles

**Description:** As a buyer browsing listings, I want cards to show both my custom title prominently and a standard auto-generated subtitle so that I can quickly scan what each buyer is looking for.

**Acceptance Criteria:**
- [ ] `ListingCard.jsx` displays two title levels: (1) `listing.title` as the primary, emphasized title (larger font, bold), (2) An auto-generated subtitle below it like "Wanting to buy 2020–2024 Porsche Cayenne" (smaller, secondary color)
- [ ] The subtitle is generated from `listing.yearMin`, `listing.yearMax`, `listing.make`, `listing.model` (format: "Wanting to buy {yearMin}–{yearMax} {make} {model}")
- [ ] If make/model are missing, the subtitle falls back to just "Wanting to buy" with available info
- [ ] The primary title uses a class like `.listing-card-title` with `font-weight: var(--font-semibold)` and `font-size: var(--font-base)`
- [ ] The subtitle uses a class like `.listing-card-subtitle` with `font-size: var(--font-sm)` and `color: var(--color-text-secondary)`
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-006: Align NavBar Width with Content Area

**Description:** As a user, I want the floating navbar edges to align perfectly with the content area (filter sidebar left edge + listing cards right edge) so that the layout looks cohesive.

**Acceptance Criteria:**
- [ ] The `.navbar` `max-width` is changed from `1140px` to `1200px` to match `.layout` `max-width`
- [ ] The navbar horizontal padding matches so that the navbar visual edges align with the content edges
- [ ] On desktop (1280px+ viewport), the navbar left edge aligns with the filter sidebar left edge
- [ ] On desktop, the navbar right edge aligns with the listing cards right edge
- [ ] Mobile behavior (full-width, no transform) is unchanged
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-007: Consolidate Login/Register into Single Auth Page

**Description:** As a user, I want a single "Sign In / Up" button in the navbar that takes me to one auth page where I can toggle between sign-in and sign-up modes so that the experience is modern and streamlined.

**Acceptance Criteria:**
- [ ] `NavBar.jsx`: The separate "Login" link and "Register" button are replaced with a single "Sign In / Up" button styled as `btn btn-primary btn-sm`
- [ ] The button links to `/auth` (a new combined route)
- [ ] A new `AuthPage.jsx` is created that combines login and register functionality on one page
- [ ] The page has two tabs/modes: "Sign In" and "Sign Up", toggled by clicking tab buttons at the top
- [ ] The "Sign In" tab shows the login form (email, password, Google Sign-In, submit)
- [ ] The "Sign Up" tab shows the registration form (name, email, password, intent selector, Google Sign-In, submit)
- [ ] URL updates when toggling: `/auth?mode=login` and `/auth?mode=register`
- [ ] `?redirect=` parameter still works for both modes
- [ ] The old `/login` and `/register` routes redirect to `/auth?mode=login` and `/auth?mode=register` respectively
- [ ] All existing login/register links across the app (`/login`, `/register`) continue to work via redirect
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-008: Introduction Box Redesign — Full Inline Form

**Description:** As a seller viewing a want listing, I want to see a full introduction form (vehicle selector, message box, send button) directly on the detail page so that I can introduce a vehicle without navigating away.

**Acceptance Criteria:**
- [ ] The `detail-intro-card` on `WantListingDetailPage.jsx` is redesigned with:
  - A heading: "Introduce Your Vehicle"
  - A description: "Send an introduction to let this buyer know you have what they're looking for."
  - A "Select Vehicle" dropdown (if user has vehicles in inventory) or an "Add a Vehicle First" button (if user has no vehicles)
  - A message/note textarea (placeholder: "Add a personal note to the buyer...")
  - A "Send Introduction" button (disabled until vehicle is selected)
- [ ] If user is NOT authenticated: show a login gate with "Sign in to introduce your vehicle" text and a "Sign In / Up" button linking to `/auth?mode=login&redirect=/want-listings/{id}`
- [ ] If user IS authenticated but has no vehicles: show "Add a Vehicle First" button linking to `/add-vehicle?redirect=/want-listings/{id}`
- [ ] If user IS authenticated and has vehicles: show the vehicle selector dropdown populated with their vehicles from `/api/vehicles`
- [ ] The vehicle selector shows each vehicle as "{year} {make} {model}" in the dropdown
- [ ] Clicking "Send Introduction" calls `POST /api/introductions` with `{ vehicleId, wantListingId, message }`
- [ ] After successful send, show a success message and disable the form
- [ ] If introduction already exists for that vehicle+listing, show "Introduction already sent" instead
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-009: Fix AI Chat Not Responding

**Description:** As a buyer, I want the AI chat on the create-listing page to respond to my messages so that it can help me build my want listing.

**Acceptance Criteria:**
- [ ] The `ANTHROPIC_API_KEY` in `backend/.env` is set to a valid, working key (already updated)
- [ ] The backend AI service (`aiService.js`) properly catches and logs errors when the API call fails
- [ ] The frontend `AIChatBox.jsx` properly shows error messages if the API returns an error (not infinite loading)
- [ ] The AI chat responds to user messages within a reasonable time (under 10 seconds)
- [ ] The chat conversation works end-to-end: user types a message, AI responds with follow-up questions
- [ ] When enough info is gathered, the AI generates a listing summary that auto-populates the form
- [ ] The loading indicator (spinner/dots) shows while waiting for AI response and disappears when response arrives
- [ ] Typecheck passes
- [ ] **Verify in browser**

---

### US-010: E2E Tests — Price Range Filter & NavBar Alignment

**Description:** As a developer, I want E2E tests covering the price range filter fix and navbar alignment so that regressions are caught.

**Acceptance Criteria:**
- [ ] Test: Price Range filter section has no visible nested border (`.range-slider-input-group` has no border)
- [ ] Test: RangeSlider inputs are visible and functional within the price filter
- [ ] Test: NavBar `max-width` matches layout `max-width` (both evaluate to the same computed value or both are >= 1200px)
- [ ] Test: NavBar edges are within 40px tolerance of the content area edges on desktop viewport
- [ ] All 169 existing tests still pass
- [ ] Tests are in `frontend/e2e/ux-phase3-layout.spec.js`
- [ ] Typecheck passes

---

### US-011: E2E Tests — Make/Model Data & Card Redesign

**Description:** As a developer, I want E2E tests covering the comprehensive make/model data and card title redesign so that regressions are caught.

**Acceptance Criteria:**
- [ ] Test: Make filter dropdown has more than 20 options (confirming comprehensive data)
- [ ] Test: Listing cards display a `.listing-card-title` element (primary custom title)
- [ ] Test: Listing cards display a `.listing-card-subtitle` element containing "Wanting to buy"
- [ ] Test: The subtitle contains make/model info when available
- [ ] All 169 existing tests still pass
- [ ] Tests are in `frontend/e2e/ux-phase3-cards.spec.js`
- [ ] Typecheck passes

---

### US-012: E2E Tests — Consolidated Auth Page

**Description:** As a developer, I want E2E tests covering the consolidated auth page so that login and registration flows work correctly.

**Acceptance Criteria:**
- [ ] Test: NavBar shows a single "Sign In / Up" button for unauthenticated users (no separate Login/Register)
- [ ] Test: Clicking "Sign In / Up" navigates to `/auth`
- [ ] Test: Auth page defaults to sign-in mode with email and password fields
- [ ] Test: Toggling to "Sign Up" tab shows registration fields (first name, last name, etc.)
- [ ] Test: Old `/login` route redirects to `/auth?mode=login`
- [ ] Test: Old `/register` route redirects to `/auth?mode=register`
- [ ] Test: Successful login from auth page redirects to dashboard
- [ ] All 169 existing tests still pass
- [ ] Tests are in `frontend/e2e/ux-phase3-auth.spec.js`
- [ ] Typecheck passes

---

### US-013: E2E Tests — Introduction Box & AI Chat

**Description:** As a developer, I want E2E tests covering the introduction box redesign and AI chat fix so that regressions are caught.

**Acceptance Criteria:**
- [ ] Test: Unauthenticated user sees "Sign in to introduce your vehicle" on detail page
- [ ] Test: Unauthenticated intro card has a "Sign In / Up" button linking to `/auth`
- [ ] Test: Introduction section heading says "Introduce Your Vehicle"
- [ ] Test: AI chat page loads with greeting message containing category bullet points
- [ ] Test: AI chat input placeholder is "Describe your ideal vehicle purchase..."
- [ ] All 169 existing tests still pass
- [ ] Tests are in `frontend/e2e/ux-phase3-intro-ai.spec.js`
- [ ] Typecheck passes

---

### US-014: Fix Existing E2E Tests for Auth Changes

**Description:** As a developer, I want all existing E2E tests that reference `/login`, `/register`, or test for separate "Login"/"Register" buttons to be updated so they pass with the new consolidated auth flow.

**Acceptance Criteria:**
- [ ] `homepage.spec.js`: Test "unauthenticated view shows Login/Register" is updated to check for "Sign In / Up" button instead
- [ ] `ux-phase2-misc.spec.js`: Test "Google Sign-In button is visible on login page" is updated to navigate to `/auth?mode=login` instead of `/login`
- [ ] All E2E tests that navigate to `/login` or `/register` directly are updated to use `/auth?mode=login` or `/auth?mode=register`
- [ ] All E2E helpers that use `page.goto('/login')` are updated
- [ ] All 169+ tests pass after the updates
- [ ] Typecheck passes

---

## Functional Requirements

- **FR-1:** The RangeSlider input groups must not have visible borders when rendered inside a filter section. The background should be `var(--color-bg-secondary)` to visually separate the inputs from the white filter panel.
- **FR-2:** An npm package providing real-world car makes and models must be installed and used as the single source of truth for all make/model dropdowns across the app.
- **FR-3:** The FilterSidebar Make dropdown must show all available makes from the package, not the current hardcoded 20-item list.
- **FR-4:** The CreateListingPage and EditListingPage SearchableSelect dropdowns must use the package data for Make, and dynamically load Model options based on the selected make.
- **FR-5:** Listing cards must display two title lines: the user's custom title (primary, prominent) and an auto-generated subtitle (secondary, smaller) in the format "Wanting to buy {yearRange} {make} {model}".
- **FR-6:** The navbar `max-width` must match the layout `max-width` (1200px) so that edges align with the content area.
- **FR-7:** The navbar must have a single "Sign In / Up" button for unauthenticated users instead of separate Login/Register buttons.
- **FR-8:** A new `/auth` route must serve a combined auth page with Sign In and Sign Up tabs.
- **FR-9:** The old `/login` and `/register` routes must redirect to the corresponding `/auth` mode.
- **FR-10:** The detail page introduction section must show a full inline form for authenticated users with vehicles: vehicle selector, message textarea, and Send Introduction button.
- **FR-11:** The introduction form must call `POST /api/introductions` with `vehicleId`, `wantListingId`, and `message`.
- **FR-12:** If an introduction already exists for the selected vehicle+listing, the UI must show "Introduction already sent" and disable the send button.
- **FR-13:** The AI chat must work end-to-end: user sends message, backend calls Anthropic API, response is displayed in the chat.
- **FR-14:** The AIChatBox must display user-friendly error messages if the API call fails (not infinite loading spinner).

## Non-Goals (Out of Scope)

- Migrating from plain CSS to Tailwind or any CSS framework
- Changing the backend database schema or API response format
- Adding new authentication providers beyond Google OAuth
- Real-time chat/WebSocket features
- Vehicle image upload functionality
- Mobile app development
- Changing the car image proxy (Imagin Studio) integration
- Adding pagination to make/model dropdowns

## Design Considerations

- **Auth page tabs:** Use a simple two-tab design with `.auth-tab` and `.auth-tab.active` classes. The active tab should have an accent border-bottom and the inactive tab should have a muted text color.
- **Introduction form:** The intro card should use the existing `.detail-intro-card` container style (accent left border, light background). The vehicle selector should be a standard `<select>` element. The message textarea should match the app's form styles.
- **Card titles:** The primary title should truncate with `text-overflow: ellipsis` if too long (2 lines max). The subtitle should be a single line.
- **NavBar button:** The "Sign In / Up" button replaces both the Login link and Register button. Use `btn btn-primary btn-sm` styling.

## Technical Considerations

- **Make/Model package:** `car-makes-models-data` or similar npm package. Must work with the existing SearchableSelect component's `{ value, label }` format.
- **Existing vehicleData.js:** Keep this file for `getModelInfo()` and `getSuggestedFeatures()` functions that provide enrichment data (year ranges, default transmission, suggested features). The npm package handles the comprehensive make/model list; `vehicleData.js` handles enrichment.
- **React Router:** The new `/auth` route is added to `App.jsx`. Old routes use `<Navigate to="/auth?mode=login" />` redirects.
- **API key:** The Anthropic API key has been updated in `backend/.env`. The `aiService.js` should add better error handling/logging.
- **Introduction API:** Uses existing `POST /api/introductions` endpoint which already accepts `vehicleId`, `wantListingId`, and `message`. The frontend needs to call `GET /api/vehicles` to get the user's vehicle list.

## Success Metrics

- All 7 features are implemented and functional
- All 169 existing E2E tests pass
- At least 15 new E2E tests are added covering all new/changed features
- The AI chat responds within 10 seconds of user input
- The auth page correctly handles both sign-in and sign-up flows
- Introduction form successfully sends introductions via the existing API

## Open Questions

- None — all requirements have been clarified via user input.
