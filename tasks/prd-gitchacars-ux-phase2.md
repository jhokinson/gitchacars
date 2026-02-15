# PRD: GitchaCars UX Polish Phase 2

## 1. Introduction / Overview

GitchaCars is a demand-first car marketplace where buyers post want listings and sellers introduce private vehicles. This Phase 2 UX overhaul addresses critical usability issues and visual polish needed to make the platform feel premium, engaging, and industry-competitive.

Key problems being solved:
- **Filter sidebar has a boxes-within-boxes UI glitch** — nested borders make it feel cluttered and broken
- **NavBar feels like a basic sticky rectangle** — needs a modern floating pill design like app.gitcha.com
- **Site looks boring with just SVG icons** — needs real car images pulled from Imagin Studio API
- **Want listing detail page is too plain** — missing car imagery, missing introduction tool for unauthenticated users, and lacks visual hierarchy
- **Google OAuth is broken** — returns "access blocked" / invalid_client error
- **AI chat doesn't guide users enough** — needs better prompting for classic cars, high-end vehicles, family cars
- **Filters are in wrong priority order** — vehicle specs should come first, location last (industry standard)
- **The whole site blends together** — needs strategic use of color for better readability and engagement

## 2. Goals

- Fix the filter sidebar UI glitch and reorder filters to match industry standards (Cars.com, AutoTrader)
- Redesign the NavBar as a floating pill with proportionate, appealing CTAs
- Integrate Imagin Studio API for real car images on listing cards and detail pages
- Add "Buyer" + vehicle type tag overlay on listing card images
- Show the introduction tool to unauthenticated users (with login prompt) on want listing detail pages
- Fix Google OAuth so sign-in works end-to-end
- Improve AI chat prompting to guide users toward specific vehicle descriptions
- Apply strategic color across the platform for better visual hierarchy and engagement
- All 149 existing E2E tests continue to pass
- Add new E2E tests covering all changed features

## 3. User Stories

---

### US-001: Fix FilterSidebar boxes-within-boxes UI glitch

**Description:** As a user browsing listings, I want the filter sidebar to look clean without nested borders/boxes so it doesn't appear broken.

**Acceptance Criteria:**
- [ ] Remove the outer `.filter-sidebar` border (currently `border: 1px solid var(--color-border)`)
- [ ] Remove the `.filter-section` bottom border between sections — replace with subtle spacing (`padding-bottom: var(--space-2)`)
- [ ] The `.filter-input-icon` wrapper should NOT have its own visible border — instead use a subtle background (`var(--color-bg-secondary)`) with no border, so inputs don't create a box-inside-a-box effect
- [ ] The `.filter-select` dropdowns should match the same borderless style with subtle background
- [ ] Add a single clean card-style container: `background: var(--color-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);` on the `.filter-sidebar` itself
- [ ] The `.filter-section-toggle` buttons should have no visible borders, just background on hover
- [ ] On mobile, the slide-up sheet retains the top rounded corners and shadow (no border)
- [ ] Verify in browser: Filter sidebar looks like one clean card with no nested boxes
- [ ] Existing E2E tests pass: `npx playwright test e2e/filters.spec.js e2e/homepage.spec.js`

---

### US-002: Reorder filter sections and update distance options

**Description:** As a car shopper, I want filters ordered by what matters most (vehicle first, location last) with industry-standard distance options so the experience matches major car sites.

**Acceptance Criteria:**
- [ ] Reorder FilterSidebar sections to: (1) Keyword Search, (2) Make, (3) Vehicle Type, (4) Year Range, (5) Price Range, (6) Mileage, (7) Transmission, (8) Drivetrain, (9) Location (zip + radius) — location is LAST
- [ ] Update radius/distance dropdown options from current `[5, 10, 25, 50, 100, 200]` to `[25, 50, 100, 250, 500, "Nationwide"]`
- [ ] "Nationwide" option should send an empty/null radius to the API (no distance filter)
- [ ] The Location section should default to collapsed (closed) since it's lowest priority
- [ ] Keyword, Make, and Vehicle Type sections should default to expanded (open)
- [ ] Verify in browser: Filters appear in correct order, distance dropdown shows industry-standard options
- [ ] Existing E2E tests pass: `npx playwright test e2e/filters.spec.js e2e/homepage.spec.js`

---

### US-003: NavBar redesign — floating pill style

**Description:** As a user, I want the navigation bar to be a modern floating pill/rounded rectangle (like app.gitcha.com) instead of a basic sticky rectangle, so the site feels premium.

**Acceptance Criteria:**
- [ ] NavBar becomes a floating pill: `max-width: 1140px; margin: var(--space-3) auto 0; border-radius: var(--radius-xl);` (20px rounded corners)
- [ ] Add a gap between the browser top edge and the navbar (12px margin-top)
- [ ] NavBar has a solid white/bg background with `box-shadow: 0 2px 16px rgba(0,0,0,0.08);` — no backdrop blur
- [ ] Remove the full-width edge-to-edge appearance — the pill should float with visible page background on either side
- [ ] On scroll, the pill remains fixed/sticky at the top with the margin preserved
- [ ] The hide-on-scroll behavior still works (slides up to hide, slides down to show)
- [ ] Body/main content padding-top accounts for the new navbar height + margin
- [ ] Mobile (< 768px): NavBar goes back to full-width (no side margins) but keeps rounded bottom corners (`border-radius: 0 0 var(--radius-lg) var(--radius-lg)`)
- [ ] Verify in browser: NavBar floats as a rounded pill with visible background on sides at desktop, full-width on mobile
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-004: NavBar CTA proportions and appeal

**Description:** As a user, I want the navigation CTAs to feel proportionate to the platform and visually appealing so I'm drawn to click them.

**Acceptance Criteria:**
- [ ] "Post Want-Listing" CTA: solid accent button (`background: var(--color-accent)`) with white text, `padding: 8px 20px`, `border-radius: var(--radius-full)`, `font-weight: 600`, `font-size: var(--font-sm)`
- [ ] "+ Private Inventory" CTA: outlined style (`border: 1.5px solid var(--color-accent); color: var(--color-accent); background: transparent;`) with same padding and radius
- [ ] Both CTAs have consistent height (36px) and feel balanced next to each other
- [ ] Hover states: "Post Want-Listing" gets slight brightness increase, "Private Inventory" gets accent background fill with white text transition
- [ ] On mobile (< 480px): CTAs become icon-only pills with 36px height, maintaining the rounded style
- [ ] Remove the gradient from CTAs — use flat accent color instead (cleaner look)
- [ ] Login/Register links for unauthenticated users use the same proportionate sizing
- [ ] Verify in browser: Both CTAs feel balanced and inviting inside the floating pill
- [ ] Existing E2E tests pass: `npx playwright test e2e/navigation.spec.js`

---

### US-005: Backend car image proxy service (Imagin Studio)

**Description:** As a developer, I want a backend endpoint that proxies car image URLs from Imagin Studio so the frontend can display real car photos without exposing API keys.

**Acceptance Criteria:**
- [ ] Create new backend route: `GET /api/car-image?make={make}&model={model}&year={year}&angle={angle}`
- [ ] Route returns a redirect (302) to the Imagin Studio CDN URL: `https://cdn.imagin.studio/getImage?customer={IMAGIN_API_KEY}&make={make}&modelFamily={model}&modelYear={year}&angle={angle}&width=800`
- [ ] If `IMAGIN_API_KEY` env var is not set, return a fallback placeholder image URL (or 204 No Content)
- [ ] The `angle` parameter defaults to `01` if not provided (front 3/4 view)
- [ ] Add `IMAGIN_API_KEY` to `backend/.env.example` with a comment
- [ ] Create a helper function `getCarImageUrl(make, model, year)` that generates the direct CDN URL for frontend use (no proxy needed if key is public/demo)
- [ ] Add the route to `backend/src/routes/` and register in server.js
- [ ] Test with curl: `curl -I "http://localhost:3001/api/car-image?make=honda&model=cr-v&year=2023"` returns 302 redirect to Imagin CDN
- [ ] Typecheck passes

**Notes:** Imagin Studio URL pattern: `https://cdn.imagin.studio/getImage?customer={key}&make={make}&modelFamily={model}&modelYear={year}&angle=01&width=800`. Start with the `demo` customer key for development — it returns watermarked but functional images.

---

### US-006: ListingCard car image + buyer tag overlay

**Description:** As a user browsing the homepage feed, I want to see real car images on listing cards with a "Buyer" tag showing the vehicle type, so cards are visually engaging and I can quickly identify what buyers want.

**Acceptance Criteria:**
- [ ] Replace the VehicleTypeIcon in `.listing-card-image` with an `<img>` tag that loads from the car image service: `/api/car-image?make={listing.make}&model={listing.model}&year={listing.yearMax}`
- [ ] Image should `object-fit: cover` and fill the entire `.listing-card-image` area (200px wide on desktop, full-width on mobile)
- [ ] Add a fallback: if the image fails to load (onerror), show the existing VehicleTypeIcon as a fallback
- [ ] Add a tag overlay on the **top-left** of the image area: a small pill badge showing the VehicleTypeIcon (16px) + "Buyer" text
- [ ] Tag styling: `position: absolute; top: 8px; left: 8px; background: rgba(27, 42, 74, 0.85); color: white; padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px);`
- [ ] The listing-card-image container needs `position: relative; overflow: hidden;` for the overlay to work
- [ ] Image has a subtle dark gradient overlay at top for tag readability: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%)`
- [ ] Verify in browser: Homepage shows real car images on listing cards with "Buyer" + icon tags
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-007: WantListingDetailPage car image hero and visual overhaul

**Description:** As a user viewing a want listing detail page, I want to see a prominent car image and better visual design so the page is engaging and informative.

**Acceptance Criteria:**
- [ ] Add a car image hero section at the top of the detail page, above the title — full-width image (max 960px) with rounded corners (`border-radius: var(--radius-lg)`)
- [ ] Image source: `/api/car-image?make={listing.make}&model={listing.model}&year={listing.yearMax}&angle=01`
- [ ] Image has `aspect-ratio: 16/9; object-fit: cover; width: 100%;`
- [ ] Fallback: if no image loads, show a styled gradient background (`var(--gradient-primary)`) with the VehicleTypeIcon centered at 80px
- [ ] Add a "Buyer" badge in the top-left corner of the image (same style as listing cards) with vehicle type icon + "Buyer" + make/model text
- [ ] The budget range should be displayed prominently as a large pill/badge below the image: `$XX,XXX – $XX,XXX` with green color (`--color-success`) and larger font
- [ ] Add the vehicle type icon + label displayed as a colored pill next to the budget
- [ ] Verify in browser: Detail page shows a large car image hero, budget is prominent, page feels engaging
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-008: Introduction tool visible to unauthenticated users

**Description:** As an unauthenticated visitor viewing a want listing, I want to see the introduction/action section so I know I can respond to this buyer — with a prompt to log in to take action.

**Acceptance Criteria:**
- [ ] On WantListingDetailPage, the "Introduce from My Inventory" section is visible to ALL visitors, not just logged-in users
- [ ] For unauthenticated users, show a card section titled "Have this vehicle?" with text: "Log in to introduce a vehicle from your private inventory to this buyer."
- [ ] Include a prominent CTA button: "Log In to Respond" that navigates to `/login?redirect=/want-listings/{id}`
- [ ] Below the login CTA, add a secondary link: "Don't have an account? Register" linking to `/register?redirect=/want-listings/{id}`
- [ ] For authenticated non-owner users, the existing "Introduce from My Inventory" button remains as-is
- [ ] The introduction card should be visually prominent — use a light accent background (`rgba(37, 99, 235, 0.04)`) with an accent left border (`3px solid var(--color-accent)`)
- [ ] Position this card in the right column of the detail body, above the "Posted By" section
- [ ] Verify in browser: Visit a want listing while logged out — see the "Have this vehicle?" card with login/register options
- [ ] Existing E2E tests pass: `npx playwright test e2e/want-listings.spec.js`

---

### US-009: Fix Google OAuth invalid_client error

**Description:** As a user, I want Google Sign-In to work without the "access blocked" / invalid_client error so I can log in with my Google account.

**Acceptance Criteria:**
- [ ] Create or update the Google Cloud Console OAuth 2.0 Client ID:
  - Application type: Web application
  - Authorized JavaScript origins: `http://localhost:3001`, `https://gitchacars.com` (and any production domain)
  - Authorized redirect URIs: `http://localhost:3001`, `https://gitchacars.com`
- [ ] Ensure the OAuth consent screen is configured (app name, support email, authorized domains)
- [ ] Set `GOOGLE_CLIENT_ID` in `backend/.env` to the correct OAuth client ID
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to the SAME client ID
- [ ] The Google Sign-In button should load the Google Identity Services library via script tag (verify it's in `index.html` or loaded dynamically)
- [ ] Test: Click "Sign in with Google" on `/login` — Google One Tap or popup appears (no "access blocked" error)
- [ ] If the user's Google account is new, create account and redirect to `/dashboard`
- [ ] If the user's Google account already exists, log in and redirect to `/dashboard`
- [ ] Add user-friendly error handling: if OAuth still fails, show "Google Sign-In is temporarily unavailable. Please sign in with email." instead of a cryptic error
- [ ] Document the Google Cloud Console setup steps in a comment block at the top of `GoogleSignInButton.jsx`

**Notes:** The error "Error 401: invalid_client" means the `VITE_GOOGLE_CLIENT_ID` env var is either not set, set to a placeholder value, or the OAuth client doesn't exist in Google Cloud Console. This story requires access to Google Cloud Console to create/fix the OAuth client.

---

### US-010: AI Chat improved prompting and guidance

**Description:** As a user creating a want listing via AI chat, I want the chatbot to guide me with specific prompts so I know exactly what details to share.

**Acceptance Criteria:**
- [ ] Update the hardcoded greeting message in AIChatBox.jsx to: "Hey! I'm here to help you create the perfect want listing. Tell me about your dream car — here are some things to include:\n\n• **Type:** Classic car, luxury/high-end, family SUV, daily driver, truck, etc.\n• **Make & Model:** Honda CR-V, Ford Mustang, Tesla Model 3, etc.\n• **Year Range:** 2020–2024, pre-1970 for classics, etc.\n• **Budget:** Your ideal price range\n• **Must-Haves:** Color, features, mileage, condition\n\nThe more specific you are, the better sellers can match you!"
- [ ] The greeting message should render markdown formatting (bold text) — update the chat bubble to parse `**text**` as `<strong>` tags
- [ ] Input placeholder changed to: "Describe your ideal vehicle purchase..."
- [ ] Update the AI system prompt in `backend/src/services/aiService.js` to emphasize generating detailed descriptions for: classic cars, luxury vehicles, family vehicles, and specific preferences like color
- [ ] The system prompt should instruct the AI to ask follow-up questions about color, specific features, and condition preferences if the user doesn't mention them
- [ ] Verify in browser: Load /create-listing — greeting shows bullet points with categories. Placeholder says "Describe your ideal vehicle purchase..."
- [ ] Existing E2E tests pass: `npx playwright test e2e/ai-listing-chat.spec.js`

---

### US-011: Strategic color system — accent colors and visual hierarchy

**Description:** As a user, I want the platform to use color strategically so important elements pop and the site is easy to scan and read.

**Acceptance Criteria:**
- [ ] Add new CSS variables in variables.css:
  - `--color-accent-light: rgba(37, 99, 235, 0.08);` — light accent background for highlights
  - `--color-accent-medium: rgba(37, 99, 235, 0.15);` — medium accent for tags/badges
  - `--color-primary-light: rgba(27, 42, 74, 0.06);` — light primary for section backgrounds
  - `--color-success-light: rgba(5, 150, 105, 0.08);` — light green for budget highlights
  - `--color-tag-bg: #EFF6FF;` — blue-tinted background for feature tags
  - `--color-tag-text: #1E40AF;` — darker blue text for feature tags
- [ ] Update `.tag-pill` styling: `background: var(--color-tag-bg); color: var(--color-tag-text); font-weight: 500;` — tags should pop with color instead of being gray
- [ ] Update `.badge` status colors to be more vibrant: active badges get green background, archived get muted
- [ ] Section headers (`.detail-section-title`, `.dashboard-section h2`) should have a left accent border: `border-left: 3px solid var(--color-accent); padding-left: var(--space-3);`
- [ ] The `.listing-card-budget` should use `color: var(--color-success); font-weight: 700;` to make budget pop on cards
- [ ] Filter sidebar section toggles should have accent color on the currently-open section text
- [ ] Verify in browser: Feature tags are blue-tinted, budgets pop in green, section headers have accent borders
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-012: Detail page color treatment and visual engagement

**Description:** As a user viewing a want listing detail page, I want strategic use of color to make key information pop and the page easy to scan.

**Acceptance Criteria:**
- [ ] The detail budget display should be in a colored pill: `background: var(--color-success-light); color: var(--color-success); padding: 8px 16px; border-radius: var(--radius-full); font-size: var(--font-lg); font-weight: 700;`
- [ ] Spec rows should alternate with subtle background: even rows get `background: var(--color-bg-secondary)` for zebra-striping
- [ ] The "Desired Features" tags should use the new blue-tinted tag colors from US-011
- [ ] The "Posted By" card should have a subtle accent-light left border
- [ ] Detail section titles ("Specifications", "Desired Features", "Description", "Posted By") should use the accent left-border style from US-011
- [ ] The vehicle type badge on the detail page should be a colored pill: `background: var(--color-accent-light); color: var(--color-accent); padding: 4px 12px; border-radius: var(--radius-full);`
- [ ] Location display should have a subtle map-pin icon in accent color
- [ ] Verify in browser: Detail page has clear visual hierarchy — budget pops in green, sections are delineated, features are blue-tinted
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-013: Icon and UI polish across platform

**Description:** As a user, I want icons and UI elements to pop more with subtle color so the platform is more engaging and easy to navigate.

**Acceptance Criteria:**
- [ ] ListingCard location icon should use `color: var(--color-accent)` instead of muted gray
- [ ] ListingCard time-ago text should use a subtle icon (clock) in muted color before the text
- [ ] The Share and Favorite action buttons on listing cards should have colored icon states: favorite heart = `--color-danger` when active, share = `--color-accent` on hover
- [ ] NavBar brand "GitchaCars" should have a subtle gradient text effect: `background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
- [ ] Dashboard section empty states should have the accent-light background: `background: var(--color-accent-light); border-radius: var(--radius-lg); padding: var(--space-6);`
- [ ] The SortDropdown should have an accent-colored sort icon
- [ ] Filter sidebar "Clear All" button should be `color: var(--color-danger)` for visibility
- [ ] Verify in browser: Icons throughout the site use color purposefully, not just gray
- [ ] Rebuild frontend: `cd frontend && npm run build`

---

### US-014: E2E tests — filter sidebar and navbar changes

**Description:** As a developer, I want E2E tests that verify the filter sidebar reordering, distance options, and floating navbar work correctly.

**Acceptance Criteria:**
- [ ] New test: Filter sidebar sections appear in correct order — first visible section is Keyword, last is Location
- [ ] New test: Distance/radius dropdown contains options: 25, 50, 100, 250, 500, Nationwide
- [ ] New test: Selecting "Nationwide" radius does not send a radius parameter (or sends empty)
- [ ] New test: Filter sidebar has no nested visible borders (verify `.filter-sidebar` has no border CSS)
- [ ] New test: NavBar has border-radius > 0 on desktop (floating pill style)
- [ ] New test: NavBar CTAs are visible and clickable — "Post Want-Listing" and "+ Private Inventory"
- [ ] New test: NavBar width is less than viewport width on desktop (not full-width)
- [ ] All tests added to `e2e/filter-navbar-v2.spec.js`
- [ ] Full suite passes: `npx playwright test` — 0 failures

---

### US-015: E2E tests — car images, tags, and detail page

**Description:** As a developer, I want E2E tests that verify car images load, buyer tags appear, and the detail page has the new visual elements.

**Acceptance Criteria:**
- [ ] New test: Listing cards on homepage have an `<img>` tag inside `.listing-card-image` (not just an SVG icon)
- [ ] New test: Listing cards have a `.listing-card-tag` element with text containing "Buyer"
- [ ] New test: Want listing detail page has an image element in the hero section
- [ ] New test: Detail page budget display is visible and contains a dollar sign
- [ ] New test: Detail page feature tags use blue-tinted styling (verify background-color is not gray)
- [ ] New test: Detail page shows introduction card for unauthenticated users — text contains "Have this vehicle?"
- [ ] New test: Unauthenticated detail page intro card has "Log In to Respond" button
- [ ] All tests added to `e2e/detail-images-v2.spec.js`
- [ ] Full suite passes: `npx playwright test` — 0 failures

---

### US-016: E2E tests — AI chat, OAuth, and color system

**Description:** As a developer, I want E2E tests that verify the updated AI chat prompts, Google OAuth error handling, and strategic color usage.

**Acceptance Criteria:**
- [ ] New test: AI chat greeting contains bullet points (verify text includes "Type:", "Make & Model:", "Budget:")
- [ ] New test: AI chat input placeholder is "Describe your ideal vehicle purchase..."
- [ ] New test: Google Sign-In button is visible on login page (does not test actual OAuth flow)
- [ ] New test: Section headers on detail page have a left border (verify border-left CSS property is not "none")
- [ ] New test: Feature tags (`.tag-pill`) have a non-white, non-gray background color (blue-tinted)
- [ ] New test: Budget text on listing cards uses green color (verify computed color is not the default text color)
- [ ] All tests added to `e2e/ux-phase2-misc.spec.js`
- [ ] Full suite passes: `npx playwright test` — 0 failures

---

## 4. Functional Requirements

- **FR-1:** The filter sidebar must display as a single clean card with no nested visible borders
- **FR-2:** Filter sections must be ordered: Keyword, Make, Vehicle Type, Year Range, Price Range, Mileage, Transmission, Drivetrain, Location
- **FR-3:** Distance/radius options must be: 25, 50, 100, 250, 500, Nationwide
- **FR-4:** The NavBar must render as a floating pill with rounded corners and side margins on desktop
- **FR-5:** The NavBar must revert to full-width on mobile (< 768px)
- **FR-6:** NavBar CTAs must have consistent 36px height with balanced proportions
- **FR-7:** The backend must provide a `GET /api/car-image` endpoint that proxies to Imagin Studio CDN
- **FR-8:** Listing cards must display real car images with an img tag, falling back to VehicleTypeIcon on error
- **FR-9:** Listing cards must show a "Buyer" + vehicle type icon tag overlay on the top-left of the image
- **FR-10:** The want listing detail page must display a large car image hero above the title
- **FR-11:** The introduction/action section must be visible to unauthenticated users with login prompt
- **FR-12:** Google OAuth must work end-to-end (requires Google Cloud Console configuration)
- **FR-13:** AI chat greeting must include specific category prompts (classic, luxury, family, etc.)
- **FR-14:** Feature tags must use blue-tinted colors instead of gray
- **FR-15:** Budget displays must use green color for visual prominence
- **FR-16:** Section headers must have accent left-border for visual hierarchy
- **FR-17:** All 149 existing E2E tests must continue to pass

## 5. Non-Goals (Out of Scope)

- **No user-uploaded car images** — this phase only adds API-sourced manufacturer images
- **No image caching/CDN** — images are loaded directly from Imagin Studio CDN per their license terms
- **No dark mode** — color system additions are for light mode only
- **No new pages or routes** — only modifying existing components and adding one backend endpoint
- **No Tailwind or CSS framework** — all styling remains in plain CSS with CSS custom properties
- **No changes to the database schema** — all changes are frontend/CSS or backend route additions
- **No changes to the registration flow** — Google OAuth fix is configuration, not flow redesign
- **No car image search/browse** — images are automatically matched to make/model, not user-selectable

## 6. Design Considerations

- **NavBar pill:** Should look like app.gitcha.com with ~20px border-radius, floating with 12px margin from top. On mobile, reverts to full-width with bottom rounded corners.
- **Imagin Studio images:** URL pattern is `https://cdn.imagin.studio/getImage?customer={key}&make={make}&modelFamily={model}&modelYear={year}&angle=01&width=800`. Use `demo` key for development (watermarked but functional). Images are 1200x750px.
- **Color palette stays the same** — navy (#1B2A4A) and blue accent (#2563EB). We're adding USAGE of color, not changing the palette. New light/medium accent variants for backgrounds.
- **Buyer tag design:** Dark semi-transparent pill (`rgba(27,42,74,0.85)`) with white text and vehicle icon, positioned absolute top-left of image container.
- **Filter sidebar:** Should feel like Apple Settings — clean sections with subtle dividers, no nested boxes.
- **Detail page hero:** 16:9 aspect ratio image, full-width within the 960px max container, with rounded corners.

## 7. Technical Considerations

- **Imagin Studio API:** Requires an API key set as `IMAGIN_API_KEY` env var. The `demo` key works for development. Images are served via CDN and should not be downloaded/cached per license terms — browser caching only.
- **Image loading performance:** Use `loading="lazy"` on car images in listing cards. The detail page hero image should load eagerly.
- **Google OAuth:** Requires Google Cloud Console access to create/update OAuth 2.0 credentials. The client ID must match between `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend).
- **AI chat markdown:** The greeting uses `**bold**` syntax. Implement a simple inline markdown parser for the chat bubble (just bold tags, not full markdown).
- **CSS variables:** All new colors go in `variables.css`. No hardcoded color values in component CSS files.
- **Backward compatibility:** The car image proxy endpoint returns a 302 redirect, so it works with standard `<img src>` tags.

## 8. Success Metrics

- Filter sidebar has zero visual glitches (no nested boxes)
- NavBar renders as a floating pill on desktop viewports
- Car images load successfully on > 90% of listing cards (fallback for unknown models)
- Want listing detail page shows car image hero
- Introduction tool is visible to unauthenticated users
- Google OAuth sign-in works without errors
- AI chat greeting includes specific vehicle category prompts
- Feature tags and budgets use color strategically (not gray)
- All 149+ existing E2E tests pass
- New E2E tests cover all changed features

## 9. Open Questions

- **Imagin Studio pricing:** Need to confirm pricing and sign up for an API key. The `demo` key works for development but may have rate limits. Contact service@imagin.studio for production key.
- **Production domain for OAuth:** What production domain(s) need to be added to Google OAuth authorized origins?
- **Image fallback coverage:** What percentage of make/model combinations does Imagin Studio cover? Need to test with less common models.
- **Mobile image performance:** Car images on listing cards may increase page weight significantly. May need to add `width=400` parameter for mobile to reduce payload.
