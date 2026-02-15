# PRD: GitchaCars — Auth, Unified Roles, Smart Forms & UI Polish

## 1. Introduction/Overview

GitchaCars currently restricts users to a single role (buyer OR seller) chosen at registration, has email-only authentication, basic form inputs, and a functional but MVP-quality UI. This PRD addresses five interconnected areas:

1. **Unified User Roles** — Remove the buyer/seller restriction. Every user can post want listings AND list vehicles from the same account. The registration "intent" question becomes a UX guide, not a gate.
2. **Google OAuth** — Add "Sign in with Google" as an alternative to email/password on both login and registration pages.
3. **Auth UX Improvements** — Better duplicate-email error handling with a helpful "Already have an account? Log in" prompt, and password visibility toggles.
4. **Smart Vehicle-Specific Want Listing Form** — Transform the flat manual form into a cascading, KBB-style experience with make/model dropdowns, auto-populated year ranges, smart defaults, and progressive accordion reveal.
5. **Enterprise-Quality UI/UX Overhaul** — Elevate visual quality to match Airbnb/Cars.com/Carvana with micro-animations, Lottie animations for key moments, refined card designs, polished typography, and better mobile responsiveness.

**Tech Stack:** Node.js/Express 4, React 19/Vite 7, Neon Postgres, plain CSS with CSS custom properties.

---

## 2. Goals

- Allow every user to both buy and sell from a single account with no role restrictions
- Reduce registration friction by 40%+ via Google OAuth sign-in
- Eliminate user confusion on duplicate-email registration (clear messaging + login link)
- Reduce want listing creation time by making the form smarter (cascading dropdowns, auto-fill)
- Achieve enterprise-grade visual polish comparable to Airbnb, Cars.com, or Carvana
- Maintain plain CSS architecture — no framework dependencies
- Comprehensive E2E test coverage for all new features

---

## 3. User Stories

---

### US-AU01: Database Schema — Remove Single-Role Restriction

**Description:** As a developer, I need to update the user model so that all users can perform both buyer and seller actions, instead of being locked to one role.

**Acceptance Criteria:**
- [ ] Add a new column `primary_intent VARCHAR(10) DEFAULT 'buy'` to the `users` table — this stores the user's initial preference (buy, sell, or both) for UX guidance only, NOT for access control
- [ ] Keep the existing `role` column for now but set a migration plan: existing `buyer` users keep their role, existing `seller` users keep theirs, but role is no longer enforced for access control (except `admin`)
- [ ] Update `backend/src/middleware/auth.js`: the `requireRole` middleware should ONLY enforce `admin` role checks. For `buyer` and `seller` checks, replace with `authenticate` only (any logged-in user can access)
- [ ] Update all routes in `backend/src/routes/wantListings.js`: remove `requireRole('buyer')` — any authenticated user can create/edit/archive want listings
- [ ] Update all routes in `backend/src/routes/vehicles.js`: remove `requireRole('seller')` — any authenticated user can add/edit vehicles and upload images
- [ ] Update `backend/src/controllers/authController.js` register function: accept `primaryIntent` field (optional, defaults to 'buy'), store it in `primary_intent` column. Still accept `role` for backward compat but set it to `'user'` for new registrations (keep `admin` role distinct)
- [ ] Run the migration against Neon database
- [ ] Verify with curl: a user previously registered as 'buyer' can now POST to `/api/vehicles` successfully
- [ ] Verify with curl: a user previously registered as 'seller' can now POST to `/api/want-listings` successfully

---

### US-AU02: Frontend — Unified Dashboard

**Description:** As a user, I want a single dashboard where I can see both my want listings and my vehicles, so I don't need separate buyer/seller dashboards.

**Acceptance Criteria:**
- [ ] Create `frontend/src/pages/DashboardPage.jsx` — a unified dashboard replacing both `BuyerDashboardPage.jsx` and `SellerDashboardPage.jsx`
- [ ] The dashboard has two sections:
  - **"My Want Listings"** — shows all the user's want listings (same data as current BuyerDashboardPage), with "Create Want Listing" action button
  - **"My Vehicles"** — shows all the user's vehicles (same data as current SellerDashboardPage), with "Add Vehicle" action button
- [ ] Each section has a header with count and action button
- [ ] Empty states for each section: "You haven't posted any want listings yet" / "You haven't listed any vehicles yet" with a CTA button
- [ ] Update `App.jsx` routing:
  - Add route `/dashboard` pointing to `DashboardPage`
  - Keep `/buyer/dashboard` and `/seller/dashboard` as redirects to `/dashboard` for backward compatibility
  - Remove `RoleRoute` wrappers from want listing and vehicle routes — use `ProtectedRoute` instead
- [ ] Update `NavBar.jsx`: show BOTH "Post Want-Listing" and "Add Vehicle" buttons for authenticated users (not conditionally based on role)
- [ ] Update `AuthContext.jsx`: remove `isRole()` checks from NavBar usage. Keep `isRole()` function for admin checks only
- [ ] Update login redirect: after login, always redirect to `/dashboard` (not role-specific dashboards)
- [ ] Verify in browser: a single user can see both want listings and vehicles on one dashboard
- [ ] Verify in browser: NavBar shows both action buttons when logged in

---

### US-AU03: Frontend — Updated Registration Flow (Intent, Not Role)

**Description:** As a new user, I want the registration to ask what I'm looking to do (buy, sell, or both) as a guide — not a permanent role assignment.

**Acceptance Criteria:**
- [ ] Update `RegisterPage.jsx`: replace the buyer/seller role selector with a three-option "What brings you here?" intent selector:
  - **"I'm looking to buy a car"** — icon: magnifying glass, sets `primaryIntent: 'buy'`
  - **"I'm looking to sell a car"** — icon: car with tag, sets `primaryIntent: 'sell'`
  - **"Both — buy and sell"** — icon: arrows exchange, sets `primaryIntent: 'both'`
- [ ] The intent selector uses the existing `.role-card` styling pattern (cards with icons, active state)
- [ ] On submit, send `primaryIntent` instead of `role` to the register API
- [ ] After registration, redirect to `/dashboard` regardless of intent
- [ ] Add a small helper text below the intent selector: "Don't worry — you can always do both. This just helps us personalize your experience."
- [ ] Verify in browser: new user can register with "Both" intent and see the unified dashboard

---

### US-AU04: Backend — Google OAuth Token Verification Endpoint

**Description:** As a developer, I need a backend endpoint that verifies Google ID tokens and either logs in an existing user or creates a new account.

**Acceptance Criteria:**
- [ ] Install `google-auth-library` in the backend: `npm install google-auth-library`
- [ ] Add `GOOGLE_CLIENT_ID` to `backend/.env` (instructions for obtaining this are in the Technical Considerations section)
- [ ] Create `backend/src/controllers/googleAuthController.js` with a `googleSignIn` function:
  - Accepts `{ idToken, primaryIntent }` in the request body
  - Uses `google-auth-library` `OAuth2Client.verifyIdToken()` to verify the token against `GOOGLE_CLIENT_ID`
  - Extracts `email`, `given_name`, `family_name`, `sub` (Google user ID), and `picture` from the token payload
  - Checks if a user with that email already exists:
    - **If exists**: log them in (generate JWT, return user + token)
    - **If new**: create the user with `password_hash = NULL` (Google-only user), `google_id = sub`, `avatar_url = picture`, `primary_intent = primaryIntent || 'buy'`
  - Returns `{ user, token, isNewUser: boolean }` — `isNewUser` tells the frontend whether to show an onboarding hint
- [ ] Add `google_id VARCHAR(255) DEFAULT NULL` and `avatar_url TEXT DEFAULT NULL` columns to the `users` table via migration
- [ ] Update `userModel.js`: add `findByGoogleId(googleId)` and `createGoogleUser(data)` functions, update `findByEmail` to also return `google_id`
- [ ] Add route `POST /api/auth/google` in `backend/src/routes/auth.js`
- [ ] Verify with curl: POST to `/api/auth/google` with a valid Google ID token creates/returns a user

---

### US-AU05: Frontend — Google Sign-In Button on Login Page

**Description:** As a user, I want to sign in with my Google account so I don't need to remember another password.

**Acceptance Criteria:**
- [ ] Add `VITE_GOOGLE_CLIENT_ID` to `frontend/.env`
- [ ] Load the Google Identity Services (GIS) script in `index.html`: `<script src="https://accounts.google.com/gsi/client" async></script>`
- [ ] Create `frontend/src/components/GoogleSignInButton.jsx` and `GoogleSignInButton.css`:
  - Renders a "Sign in with Google" button that matches Google's branding guidelines (white background, Google logo, dark text)
  - On click, initializes `google.accounts.id.initialize()` with the client ID and a callback
  - The callback receives the `credential` (ID token), calls `apiService.auth.googleSignIn({ idToken: credential })`
  - On success, calls `login()` from AuthContext and navigates to `/dashboard`
  - On error, displays an error message
- [ ] Add `googleSignIn` to `apiService.auth`: `googleSignIn: (data) => api.post('/auth/google', data)`
- [ ] Place the Google button on `LoginPage.jsx`:
  - Below the login form, separated by a divider with "or" text (horizontal rule with centered "or")
  - The Google button is full-width, matching the login button width
- [ ] Verify in browser: clicking "Sign in with Google" opens Google's consent flow, and on success the user is logged in

---

### US-AU06: Frontend — Google Sign-In Button on Register Page

**Description:** As a new user, I want to sign up with Google so I can create an account without filling out a form.

**Acceptance Criteria:**
- [ ] Add the same `GoogleSignInButton` component to `RegisterPage.jsx`
- [ ] Place it above the registration form, separated by an "or continue with email" divider
- [ ] When a Google sign-up creates a new user (`isNewUser: true` in response), show a brief toast or inline message: "Welcome to GitchaCars! You can buy and sell from your account."
- [ ] The `primaryIntent` from the intent selector (if already selected) is passed to the Google sign-in API call
- [ ] If the user hasn't selected an intent yet, default to `'both'`
- [ ] Verify in browser: new user signs up with Google, account is created, redirected to dashboard

---

### US-AU07: Frontend — Duplicate Email Registration Error UX

**Description:** As a user trying to register with an email that already exists, I want a clear, helpful message that tells me I already have an account and offers to log in.

**Acceptance Criteria:**
- [ ] In `RegisterPage.jsx`, update the catch block to detect 409 status specifically:
  ```js
  if (err.response?.status === 409) {
    // Show the special "already exists" UI
  }
  ```
- [ ] When a 409 is detected, instead of just showing a red error banner, display a distinct UI card/callout:
  - Light blue/info background (not red)
  - Icon: info circle or person icon
  - Text: "An account with **{email}** already exists."
  - Sub-text: "Would you like to log in instead?"
  - A prominent "Log In" button that links to `/login?email={email}` (pre-fill the email)
  - A "Try a different email" link that clears the error and focuses the email input
- [ ] On the `LoginPage.jsx`, if the URL has an `email` query param, pre-fill the email input field
- [ ] Style this callout using existing CSS variables: `var(--color-accent)` background tint, `var(--color-accent)` text, `var(--radius-md)` corners
- [ ] Verify in browser: register with buyer1@example.com (existing account), see the friendly "already exists" card with login link
- [ ] Verify in browser: clicking "Log In" goes to login page with email pre-filled

---

### US-AU08: Frontend — Password Visibility Toggle

**Description:** As a user, I want to toggle password visibility so I can verify what I'm typing.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/PasswordInput.jsx` and `PasswordInput.css`:
  - Wraps a standard `<input>` with a toggle button inside (positioned absolutely on the right)
  - Toggle button shows an "eye" SVG icon when password is hidden, "eye-off" SVG when visible
  - Clicking toggles `type` between `"password"` and `"text"`
  - Accepts all standard input props (name, value, onChange, placeholder, etc.) via spread
  - The toggle button has `type="button"` to prevent form submission
  - Accessible: `aria-label="Show password"` / `aria-label="Hide password"`
- [ ] The input wrapper has `position: relative`, the toggle button is `position: absolute; right: 12px; top: 50%; transform: translateY(-50%)`
- [ ] Toggle icon color: `var(--color-text-muted)`, hover: `var(--color-text-secondary)`
- [ ] Replace the password `<input>` in `LoginPage.jsx` with `<PasswordInput>`
- [ ] Replace both password inputs in `RegisterPage.jsx` (password and confirm password) with `<PasswordInput>`
- [ ] Verify in browser: clicking the eye icon reveals the password text, clicking again hides it
- [ ] Verify in browser: the toggle works independently on password and confirm password fields

---

### US-AU09: Frontend — Vehicle Data File (Makes, Models, Years)

**Description:** As a developer, I need a static data file of vehicle makes, models, and year ranges so the smart form can provide cascading dropdowns without an external API.

**Acceptance Criteria:**
- [ ] Create `frontend/src/data/vehicleData.js` exporting a structured data object
- [ ] Cover at least 30 major makes: Toyota, Honda, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Lexus, Nissan, Hyundai, Kia, Subaru, Mazda, Volkswagen, Jeep, RAM, GMC, Dodge, Chrysler, Buick, Cadillac, Lincoln, Acura, Infiniti, Volvo, Porsche, Tesla, Land Rover, Mini, Mitsubishi, Genesis
- [ ] Each make has an array of models, each model has:
  - `name`: model name (e.g., "CR-V")
  - `yearStart`: first production year (e.g., 1997)
  - `yearEnd`: last/current year (e.g., 2025)
  - `type`: vehicle type enum (sedan, suv, truck, etc.)
  - `defaultTransmission`: "automatic" or "manual"
  - `defaultDrivetrain`: "fwd", "rwd", "awd", "4wd"
  - `suggestedFeatures`: array of commonly available features for this model
- [ ] Each make should have at least 3-8 of their most popular models
- [ ] Export helper functions:
  - `getMakes()` — returns sorted array of make names
  - `getModels(make)` — returns models for a given make
  - `getModelInfo(make, model)` — returns the full model object with year range, type, defaults
  - `getYearRange(make, model)` — returns `{ start, end }`
  - `getSuggestedFeatures(make, model)` — returns feature array
- [ ] Verify: importing the data file and calling `getMakes()` returns 30+ makes

---

### US-AU10: Frontend — Smart Cascading Want Listing Form

**Description:** As a buyer, I want a smart form that auto-populates options based on my vehicle selection, like KBB or Cars.com, with progressive accordion reveal.

**Acceptance Criteria:**
- [ ] Refactor the `ListingForm` component in `CreateListingPage.jsx` to use accordion-style progressive disclosure:
  - **Section 1: "What are you looking for?"** — Vehicle type icon grid (already exists) + Make dropdown + Model dropdown (cascading). Always visible.
  - **Section 2: "Year & Specs"** — Revealed after Make+Model selected. Year min/max dropdowns (pre-populated from vehicle data year range), transmission, drivetrain, mileage. Auto-filled with smart defaults from `vehicleData.js`
  - **Section 3: "Budget & Location"** — Revealed after Section 2 has at least year range filled. Budget min/max, zip code, radius.
  - **Section 4: "Features & Details"** — Revealed after Section 3 has budget filled. Feature tag picker (pre-selects suggested features for the make/model), description, title (auto-generated suggestion based on make/model/year).
- [ ] Each section has a header that shows a green checkmark when complete, and a summary of what was filled (e.g., "Honda CR-V, 2020–2024")
- [ ] Completed sections are collapsible (click header to expand/collapse)
- [ ] Sections reveal with a smooth CSS height transition animation
- [ ] **Make dropdown**: searchable select with all makes from `vehicleData.js`, sorted alphabetically. Includes an "Other" option for unlisted makes (falls back to free text input)
- [ ] **Model dropdown**: disabled until a make is selected. Populates with models for the selected make. Includes "Other" option for free text.
- [ ] When make+model are selected:
  - Auto-set vehicle type if not already selected (from model data)
  - Auto-populate year range defaults (yearStart to current year)
  - Auto-set default transmission and drivetrain
  - Pre-select suggested features in the feature picker
- [ ] **Title auto-suggestion**: when make, model, and year range are filled, auto-generate a title like "Looking for a 2020-2024 Honda CR-V" (user can edit)
- [ ] The "Other" make/model options render free-text inputs like the current form (backward compatible)
- [ ] Verify in browser: selecting "Honda" populates the model dropdown with Honda models
- [ ] Verify in browser: selecting "CR-V" auto-fills year range (1997-2025), sets vehicle type to SUV, defaults transmission to Automatic, drivetrain to AWD
- [ ] Verify in browser: sections reveal progressively with smooth animation
- [ ] Verify in browser: can still manually override any auto-filled value

---

### US-AU11: Frontend — Searchable Select Component

**Description:** As a user, I want a searchable dropdown for make and model selection so I can quickly find what I'm looking for.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/SearchableSelect.jsx` and `SearchableSelect.css`
- [ ] The component renders a text input that, when focused or typed into, shows a dropdown list of filtered options
- [ ] Props: `options` (array of `{ value, label }`), `value`, `onChange`, `placeholder`, `disabled`
- [ ] Typing filters the options list (case-insensitive substring match)
- [ ] Clicking an option selects it and closes the dropdown
- [ ] Pressing Enter selects the first filtered option
- [ ] Pressing Escape closes the dropdown
- [ ] The selected value displays in the input field
- [ ] A small chevron icon on the right indicates it's a dropdown
- [ ] The dropdown has a max-height of 240px with overflow scroll
- [ ] Style matches the existing form input design system (border, radius, focus state)
- [ ] Verify in browser: typing "hon" in the make dropdown shows "Honda" as the only option

---

### US-AU12: UI Polish — Enhanced CSS Design System

**Description:** As a user, I want the app to feel polished and enterprise-grade with refined visual design, better typography, and subtle depth.

**Acceptance Criteria:**
- [ ] Update `frontend/src/styles/variables.css` with enhanced design tokens:
  - Add gradient variables: `--gradient-primary: linear-gradient(135deg, #1B2A4A 0%, #2563EB 100%)`, `--gradient-subtle: linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)`
  - Add `--shadow-xl` for elevated cards
  - Add `--font-3xl: 2rem` for hero headings
  - Add `--transition-base: 0.2s ease` and `--transition-slow: 0.3s ease` for consistent transitions
- [ ] Update `frontend/src/styles/base.css`:
  - Add a subtle background gradient to the body: `background: var(--gradient-subtle)`
  - Improve link hover transitions
  - Add smooth scroll: `html { scroll-behavior: smooth }`
- [ ] Update `frontend/src/styles/components.css`:
  - Buttons: add subtle `box-shadow` on hover, slightly larger padding, smoother transitions
  - Cards: add refined shadow progression (rest → hover → active), subtle border-left accent on hover
  - Inputs: add a subtle inner shadow on focus, slightly taller (44px) for better touch targets
  - Badges: slightly refined with tighter padding and better font sizing
- [ ] Improve the NavBar:
  - Add a subtle shadow when scrolled (use `position: sticky` or add shadow class on scroll via JS)
  - Refine CTA button with a slight gradient background
  - Better mobile spacing and touch targets
- [ ] Polish listing cards:
  - Add a subtle gradient overlay on the vehicle type icon area
  - Better visual hierarchy: larger budget text, refined specs layout
  - Hover effect: lift + shadow + subtle border color change
- [ ] Verify in browser: the overall app feels noticeably more polished, shadows are subtle, transitions are smooth
- [ ] Verify in browser: all pages still render correctly after CSS changes

---

### US-AU13: UI Polish — Lottie Animations for Key Moments

**Description:** As a user, I want delightful animations at key moments (empty states, loading, success) that make the app feel premium.

**Acceptance Criteria:**
- [ ] Install `lottie-react` in the frontend: `npm install lottie-react`
- [ ] Create `frontend/src/components/LottieAnimation.jsx` — a wrapper component that accepts a `src` (JSON animation data) and `size` prop
- [ ] Add Lottie animations for these 4 key moments:
  1. **Empty state — no listings**: A car-themed "nothing here" animation on the homepage when no listings match filters. Replace the current magnifying glass SVG.
  2. **Empty state — no vehicles**: An "add your first car" animation on the dashboard vehicles section when empty
  3. **Success — listing created**: A brief checkmark/confetti animation shown as a toast or overlay after creating a want listing or adding a vehicle
  4. **Loading — page skeleton**: A subtle pulsing car silhouette animation that replaces the plain skeleton loader
- [ ] Use free Lottie animations from LottieFiles.com — download the JSON files and place them in `frontend/src/assets/lottie/`
- [ ] Each animation should be small (< 50KB JSON), loop appropriately (empty states loop, success plays once), and respect `prefers-reduced-motion`
- [ ] Verify in browser: empty states show animated illustrations instead of static SVGs
- [ ] Verify in browser: creating a listing shows a brief success animation

---

### US-AU14: UI Polish — Page Transitions & Micro-interactions

**Description:** As a user, I want smooth page transitions and micro-interactions that make the app feel responsive and fluid.

**Acceptance Criteria:**
- [ ] Add CSS page entrance animations:
  - Create a `.page-enter` class with a subtle fade-in + slide-up animation (opacity 0→1, translateY 8px→0, duration 0.3s)
  - Apply `.page-enter` to the main content wrapper in `Layout.jsx` using a key based on the current route
- [ ] Add button micro-interactions:
  - Primary buttons: subtle scale-down on click (transform: scale(0.98)), spring back on release
  - Ghost buttons: background color transition on hover
- [ ] Add form input animations:
  - Focus: input border color transition + subtle shadow expansion
  - Error state: brief shake animation (translateX -4px → 4px → 0) when validation fails
- [ ] Add listing card interactions:
  - Hover: image area gets a subtle brightness increase
  - Click: brief scale-down (0.99) before navigation
- [ ] Add smooth scroll-to-top on route changes
- [ ] All animations respect `prefers-reduced-motion` media query
- [ ] Verify in browser: navigating between pages has a smooth fade-in effect
- [ ] Verify in browser: clicking buttons has a satisfying tactile feel

---

### US-AU15: UI Polish — Mobile Responsiveness Refinement

**Description:** As a mobile user, I want the app to feel native-quality on small screens with proper spacing, touch targets, and layout.

**Acceptance Criteria:**
- [ ] Audit and fix all pages at 375px viewport width (iPhone SE):
  - NavBar: logo + single CTA button (overflow into hamburger menu or icon-only mode)
  - Homepage: filter sidebar becomes a slide-up sheet (not just an overlay)
  - Listing cards: stack to full-width single column
  - Dashboard: sections stack vertically with full-width action buttons
  - Forms: full-width inputs, sections have proper padding
  - Detail page: all content stacks vertically, budget and specs are prominent
- [ ] Minimum touch target size: 44px x 44px for all interactive elements
- [ ] Add bottom safe area padding for iOS: `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Fix any horizontal overflow issues (no horizontal scroll on mobile)
- [ ] The unified dashboard is swipeable between "Buying" and "Selling" sections on mobile (optional: simple scroll is OK too)
- [ ] Verify in browser at 375px width: all pages render correctly with no overflow
- [ ] Verify in browser at 375px width: all buttons and links are easily tappable

---

### US-AU16: E2E Test — Google OAuth Flow

**Description:** As a developer, I want E2E tests covering the Google OAuth authentication flow.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/google-auth.spec.js`
- [ ] **Test: Google button visible on login page** — Navigate to `/login`, verify a "Sign in with Google" button is visible
- [ ] **Test: Google button visible on register page** — Navigate to `/register`, verify a Google sign-in button is visible
- [ ] **Test: Mock Google sign-in flow** — Mock the Google Identity Services callback to simulate a successful Google sign-in, verify the user is logged in and redirected to `/dashboard`
- [ ] **Test: Google sign-in for existing user** — Mock Google sign-in with an email that already exists in the DB, verify the user is logged in (not a new account created)
- [ ] All tests pass: `npx playwright test e2e/google-auth.spec.js --reporter=list`

---

### US-AU17: E2E Test — Unified Dashboard & Role Removal

**Description:** As a developer, I want E2E tests verifying any user can access both buyer and seller features.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/unified-dashboard.spec.js`
- [ ] **Test: Dashboard shows both sections** — Log in as any user, navigate to `/dashboard`, verify both "My Want Listings" and "My Vehicles" sections are visible
- [ ] **Test: Any user can create a want listing** — Log in as seller1@example.com (previously seller-only), navigate to create-listing, fill form, submit, verify listing appears on dashboard
- [ ] **Test: Any user can add a vehicle** — Log in as buyer1@example.com (previously buyer-only), navigate to add-vehicle, fill form, submit, verify vehicle appears on dashboard
- [ ] **Test: NavBar shows both actions** — Log in, verify both "Post Want-Listing" and "Add Vehicle" buttons are visible in the NavBar
- [ ] **Test: Old dashboard URLs redirect** — Navigate to `/buyer/dashboard`, verify redirect to `/dashboard`. Same for `/seller/dashboard`.
- [ ] All tests pass: `npx playwright test e2e/unified-dashboard.spec.js --reporter=list`

---

### US-AU18: E2E Test — Registration & Auth UX

**Description:** As a developer, I want E2E tests for the improved registration flow, duplicate email handling, and password visibility.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/auth-ux.spec.js`
- [ ] **Test: Intent selector on register** — Navigate to `/register`, verify three intent options are visible (Buy, Sell, Both)
- [ ] **Test: Register with "Both" intent** — Select "Both", fill form, register, verify redirect to `/dashboard` with both sections
- [ ] **Test: Duplicate email shows friendly message** — Try registering with buyer1@example.com, verify the "account already exists" callout appears (not just an error banner)
- [ ] **Test: Duplicate email "Log In" link works** — Click the "Log In" link in the callout, verify redirect to `/login` with email pre-filled
- [ ] **Test: Password visibility toggle** — On login page, verify password is hidden by default, click the eye icon, verify password is visible (input type changes to text), click again, verify hidden
- [ ] **Test: Register password toggles** — On register page, verify both password and confirm password fields have independent visibility toggles
- [ ] All tests pass: `npx playwright test e2e/auth-ux.spec.js --reporter=list`

---

### US-AU19: E2E Test — Smart Form Cascading Behavior

**Description:** As a developer, I want E2E tests verifying the smart cascading form works correctly.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/smart-form.spec.js`
- [ ] **Test: Make dropdown is searchable** — Navigate to create-listing, switch to manual mode, verify the make field is a searchable dropdown, type "Hon", verify "Honda" appears
- [ ] **Test: Model populates from make** — Select "Honda" as make, verify the model dropdown is now enabled and contains Honda models (CR-V, Civic, Accord, etc.)
- [ ] **Test: Auto-fill from make+model** — Select Honda CR-V, verify year range auto-fills (1997-2025), vehicle type auto-selects "SUV", transmission defaults to "Automatic"
- [ ] **Test: Sections reveal progressively** — Verify that Section 2 (Year & Specs) only appears after Make+Model are selected. Section 3 appears after year range is filled. Section 4 appears after budget is filled.
- [ ] **Test: Title auto-suggestion** — After filling make, model, and year range, verify the title field is auto-populated with something like "Looking for a 2020-2025 Honda CR-V"
- [ ] **Test: Other make fallback** — Select "Other" as make, verify a free-text input appears for manual entry
- [ ] **Test: Suggested features** — Select a truck (Ford F-150), verify "Tow Package" is pre-selected in features
- [ ] All tests pass: `npx playwright test e2e/smart-form.spec.js --reporter=list`

---

### US-AU20: E2E Test — UI Polish Verification

**Description:** As a developer, I want visual regression tests ensuring the UI polish looks correct.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ui-polish.spec.js`
- [ ] **Test: Page transitions** — Navigate between homepage and a listing detail page, verify no layout shift or flash of unstyled content
- [ ] **Test: Empty state animations** — Create a new user (no listings), navigate to dashboard, verify animated empty state is rendered (not just text)
- [ ] **Test: Mobile layout** — Set viewport to 375x812 (iPhone), navigate through homepage → listing detail → dashboard → create listing, verify no horizontal overflow on any page
- [ ] **Test: Password toggle visual** — Screenshot the login page with password hidden, toggle, screenshot with password visible, verify they differ
- [ ] **Test: Card hover states** — Navigate to homepage with listings, verify listing cards are rendered with proper styling
- [ ] All tests pass: `npx playwright test e2e/ui-polish.spec.js --reporter=list`

---

## 4. Functional Requirements

- **FR-1:** The system must allow any authenticated user to create want listings AND add vehicles — no role-based restrictions (except admin-only routes).
- **FR-2:** The system must support Google OAuth 2.0 sign-in using Google Identity Services, verifying tokens server-side with `google-auth-library`.
- **FR-3:** When a user tries to register with an email that already exists, the system must display a helpful card with the message "An account with this email already exists" and a link to log in with the email pre-filled.
- **FR-4:** All password input fields must have a visibility toggle (eye/eye-off icon) that switches between hidden and visible text.
- **FR-5:** The want listing form must provide cascading make→model dropdowns populated from a static vehicle data file with 30+ makes.
- **FR-6:** Selecting a make+model must auto-populate year range, vehicle type, default transmission, default drivetrain, and suggested features.
- **FR-7:** The form must use progressive accordion reveal — sections appear as the user fills out prior sections, with smooth CSS height transitions.
- **FR-8:** The make and model dropdowns must be searchable (type-ahead filtering).
- **FR-9:** The unified dashboard must show both "My Want Listings" and "My Vehicles" sections for every authenticated user.
- **FR-10:** The NavBar must show both "Post Want-Listing" and "Add Vehicle" action buttons for all authenticated users.
- **FR-11:** The registration page must offer three intent options: Buy, Sell, or Both — this is for UX guidance only, not access control.
- **FR-12:** The app must include Lottie animations for 4 key moments: empty state (no listings), empty state (no vehicles), success (listing created), and loading skeleton.
- **FR-13:** All interactive elements must have micro-animations (hover, click, focus) that feel fluid and responsive.
- **FR-14:** All pages must be fully responsive at 375px viewport width with no horizontal overflow and minimum 44px touch targets.
- **FR-15:** All animations must respect the `prefers-reduced-motion` media query.

---

## 5. Non-Goals (Out of Scope)

- **No Apple Sign-In** — Only Google OAuth for now
- **No role management settings** — No user settings page to change role (there are no restrictive roles anymore)
- **No external vehicle data API** — All make/model data is static JSON, not fetched from an API like NHTSA
- **No VIN decoder** — Vehicle identification is make/model selection only
- **No CSS framework** — No Tailwind, Material UI, or Chakra. Plain CSS with variables only.
- **No dark mode** — Light theme only
- **No SSR or page transition library** — CSS-only page animations, no React Transition Group or Framer Motion
- **No vehicle image search** — The smart form doesn't show photos of vehicle models
- **No admin role changes** — Admin routes remain admin-only; this PRD only affects buyer/seller distinction

---

## 6. Design Considerations

### Unified Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  NavBar  [GitchaCars]  [Post Want-Listing] [Add Vehicle] [Bell] [Avatar] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Dashboard                                      │
│                                                 │
│  ┌─ My Want Listings (3) ──── [Create New] ──┐  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ Looking for a Honda CR-V   [Active] │   │  │
│  │  │ 2020–2024 • $25k–$35k • 2 intros   │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ Family SUV wanted         [Active]  │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────┘  │
│                                                 │
│  ┌─ My Vehicles (1) ──────── [Add Vehicle] ──┐  │
│  │  ┌──────┐                                  │  │
│  │  │ 📷   │ 2021 Toyota Camry SE            │  │
│  │  │      │ 32,000 mi • $24,500             │  │
│  │  └──────┘                                  │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Smart Form Accordion
```
┌─ ✅ What are you looking for? ─── Honda CR-V ──┐
│  [Vehicle Type Grid]                            │
│  Make: [Honda ▼]  Model: [CR-V ▼]              │
└─────────────────────────────────────────────────┘

┌─ ✅ Year & Specs ─── 2020-2024, Auto, AWD ─────┐
│  Year: [2020 ▼] to [2024 ▼]                    │
│  Max Mileage: [50000]                           │
│  Transmission: [Automatic ▼]                    │
│  Drivetrain: [AWD ▼]  Condition: [Any ▼]        │
└─────────────────────────────────────────────────┘

┌─ 🔵 Budget & Location ─────────────────────────┐  ← currently open
│  Budget: [$25,000] to [$35,000]                 │
│  Zip: [90210]  Radius: [50 mi ▼]               │
└─────────────────────────────────────────────────┘

┌─ ○ Features & Details ──────────────────────────┐  ← locked until above filled
│  (reveals when Budget section is complete)       │
└─────────────────────────────────────────────────┘
```

### Components to Reuse
- `.card`, `.btn`, `.badge`, `.tag-pill` from `components.css`
- `.form-group`, `.form-row`, `.form-section-title` for form layout
- `.role-card` pattern adapted for intent selector
- `.auth-card`, `.auth-page` for login/register pages
- `VehicleTypeIcon` component for vehicle type grid

---

## 7. Technical Considerations

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to APIs & Services → Credentials
4. Create an OAuth 2.0 Client ID (Web application type)
5. Add authorized JavaScript origins: `http://localhost:3001` (dev), plus production domain later
6. Add authorized redirect URIs: `http://localhost:3001` (for implicit flow)
7. Copy the Client ID to both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`)
8. The backend verifies tokens using `google-auth-library` — no client secret needed for ID token verification

### Database Migrations
- `ALTER TABLE users ADD COLUMN primary_intent VARCHAR(10) DEFAULT 'buy'`
- `ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL`
- `ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL`
- No destructive changes — existing data is unaffected

### Vehicle Data File Size
- The static JSON file with 30+ makes and 150+ models will be approximately 30-50KB
- This is small enough to include in the JS bundle without lazy loading
- If it grows beyond 100KB, consider lazy loading with dynamic `import()`

### Lottie File Management
- Download free animations from LottieFiles.com
- Store JSON files in `frontend/src/assets/lottie/`
- Keep each animation under 50KB for performance
- Use `lottie-react` for rendering (lightweight wrapper)

### Backward Compatibility
- Old `/buyer/dashboard` and `/seller/dashboard` URLs redirect to `/dashboard`
- The `role` column is not removed from the DB — it's just no longer enforced for access (except admin)
- Existing API consumers still work — no breaking endpoint changes
- The `isRole()` function remains in AuthContext for admin checks

---

## 8. Success Metrics

- **Google sign-in adoption** — Percentage of new registrations using Google (target: >30%)
- **Registration completion rate** — Percentage of users who start registration and complete it (target: improvement from duplicate email fix)
- **Cross-role usage** — Percentage of users who both post a want listing AND add a vehicle within 30 days (target: >15%)
- **Form completion time** — Average time to create a want listing via smart form (target: <2 minutes)
- **Mobile engagement** — Percentage of users on mobile viewports who complete key actions (target: comparable to desktop)
- **E2E test pass rate** — All 5 Playwright test files pass on every build

---

## 9. Open Questions

1. **Google Cloud billing** — Does the team have a Google Cloud account, or does one need to be created? OAuth is free but requires a project.
2. **Existing user migration** — Should existing buyer-only and seller-only users be notified that they can now do both? (e.g., a one-time banner on login)
3. **Vehicle data maintenance** — Who maintains the make/model data file when new models are released? Should there be an admin tool for this, or is a code update sufficient?
4. **Google sign-in for existing email/password users** — If a user already registered with email/password and then tries Google sign-in with the same email, should their accounts be linked automatically, or should they be prompted?
5. **Admin role assignment** — With roles being relaxed, how are new admins created? Currently via direct DB update — is that sufficient?
