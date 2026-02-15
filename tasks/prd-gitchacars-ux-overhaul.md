# PRD: GitchaCars UX Overhaul & Private Inventory

## 1. Introduction / Overview

This PRD covers three interconnected improvements to GitchaCars:

1. **Fix the Create Want Listing form** — the SearchableSelect dropdowns are unusable (z-index bug), the AI chat doesn't guide users, and the form needs better UX flow with emphasis on AI-generated titles and descriptions.
2. **Private Inventory language change** — replace all "Add Vehicle" / "My Vehicles" language with "Private Inventory" terminology to reflect the platform's core concept: vehicles are private until introduced to a buyer.
3. **Comprehensive UI revamp** — elevate the entire platform's visual quality with optimized Inter font usage, increased border-radius, scroll-triggered animations, and premium micro-interactions.

## 2. Goals

- Fix the blocking SearchableSelect z-index bug so users can actually select Make/Model
- Make the AI chat mode genuinely useful by guiding users and generating compelling titles/descriptions
- Rebrand all vehicle-related language to "Private Inventory" across every page, component, and test
- Upgrade the visual design to premium quality (Airbnb/Linear/Vercel level) while keeping the GitchaCars identity
- Maintain all 138 existing E2E tests passing (update assertions where language changes)
- Add new E2E tests covering all changed functionality

## 3. User Stories

---

### US-001: Fix SearchableSelect dropdown z-index

**Description:** As a user creating a want listing, I want the Make/Model dropdown menus to render above all other form elements so that I can actually see and select options.

**Acceptance Criteria:**
- [ ] SearchableSelect dropdown renders above accordion sections, other form fields, and all sibling elements
- [ ] Dropdown is fully visible and clickable when opened inside any AccordionSection
- [ ] Set `.searchable-select-dropdown` z-index to at least `100` and ensure parent `.accordion-body-wrapper` has `overflow: visible` (not hidden/auto)
- [ ] The accordion collapse animation still works (use clip-path or a portal approach if needed to avoid overflow conflicts)
- [ ] Dropdown closes when clicking outside
- [ ] Works correctly on mobile (375px viewport)
- [ ] **Verify in browser:** Open create-listing manual form, click Make dropdown — all options are visible and selectable. Then select a Make, click Model dropdown — all model options are visible and selectable.

---

### US-002: Improve AI Chat greeting and guidance

**Description:** As a user on the Create Want Listing page, I want the AI chat to greet me with helpful guidance so that I know what to say and feel supported.

**Acceptance Criteria:**
- [ ] AI chat displays an initial greeting message (not from the API — hardcoded in the component) such as: _"Hey! Let us help you create your want listing. Tell us what kind of car you're looking for — make, model, year range, budget, or just describe your dream car and we'll help fill in the details."_
- [ ] The greeting appears immediately when the chat loads (no API call needed for the greeting)
- [ ] Input placeholder updated to: `"Tell us about your dream car..."`
- [ ] Greeting message is styled as an assistant bubble (left-aligned, secondary background)
- [ ] If the AI API fails (e.g., no credits), show a friendly fallback: _"Our AI assistant is temporarily unavailable. Switch to Manual Form to create your listing."_ with a clickable link/button to switch modes
- [ ] **Verify in browser:** Load /create-listing — greeting message is immediately visible in the chat area without any API call

---

### US-003: AI-generated title and description focus

**Description:** As a user chatting with the AI, I want it to generate a compelling listing title and detailed description so that my want listing attracts the right sellers.

**Acceptance Criteria:**
- [ ] The AI system prompt instructs Claude to: (1) extract structured data (make, model, year, budget, etc.) from conversation, (2) generate a compelling title (e.g., "Looking for a 2020-2024 Honda CR-V under $35k"), (3) generate a detailed 2-3 sentence description highlighting key preferences
- [ ] The ListingPreview sidebar updates in real-time as the AI extracts data, showing the generated title and description prominently
- [ ] Title and description fields are visually prominent in the ListingPreview (larger font for title, full description visible)
- [ ] When the user clicks "Create Listing" from chat mode, the generated title and description are submitted along with all extracted fields
- [ ] The AI backend endpoint (`/api/ai/chat`) system prompt is updated to emphasize title and description generation
- [ ] **Verify in browser:** Chat with AI about wanting a Honda CR-V, see the preview update with a generated title and description, then submit and verify the listing appears on the dashboard with that title and description

---

### US-004: Improve manual form description area

**Description:** As a user using the manual form, I want a prominent, well-designed description area so that I can write (or have auto-suggested) a compelling listing description.

**Acceptance Criteria:**
- [ ] Description textarea in the "Features & Details" accordion is at least 4 rows tall with a helpful placeholder: `"Describe what you're looking for — condition preferences, must-have features, deal-breakers, etc."`
- [ ] The textarea has a character count indicator (e.g., "0 / 500")
- [ ] The "Features & Details" section auto-opens when the user completes the Budget & Location section (progressive reveal — currently it stays closed)
- [ ] Title input has an auto-generate hint: small text below it saying _"Tip: A good title includes year range, make, model, and budget"_
- [ ] **Verify in browser:** Fill make/model/year/budget on manual form → "Features & Details" section auto-opens → description textarea is prominent with character count

---

### US-005: Private Inventory — NavBar language update

**Description:** As a user, I want the navigation to say "Private Inventory" instead of "Add Vehicle" so that I understand vehicles are private until introduced.

**Acceptance Criteria:**
- [ ] NavBar CTA button text changed from `"Add Vehicle"` to `"+ Private Inventory"`
- [ ] NavBar CTA `title` attribute updated to `"Add to Private Inventory"`
- [ ] Route remains `/add-vehicle` (no URL changes — only labels)
- [ ] Mobile view (< 480px) still shows icon-only (label hidden)
- [ ] **Verify in browser:** NavBar shows "+ Private Inventory" button when logged in

---

### US-006: Private Inventory — Dashboard language update

**Description:** As a user on the dashboard, I want to see "My Private Inventory" instead of "My Vehicles" so the terminology is consistent.

**Acceptance Criteria:**
- [ ] DashboardPage section heading changed from `"My Vehicles ({count})"` to `"My Private Inventory ({count})"`
- [ ] CTA button changed from `"+ Add Vehicle"` to `"+ Add to Inventory"`
- [ ] Empty state message changed from `"You haven't listed any vehicles yet."` to `"Your private inventory is empty. Add vehicles that only you can see — then introduce them to interested buyers."`
- [ ] Empty state CTA changed from `"Add Your First Vehicle"` to `"Add Your First Vehicle to Inventory"`
- [ ] SellerDashboardPage (legacy) updated with same language changes
- [ ] **Verify in browser:** Dashboard shows "My Private Inventory" heading and updated empty state copy

---

### US-007: Private Inventory — Add/Edit vehicle page language

**Description:** As a user adding or editing a vehicle, I want the page to use "Private Inventory" language so I understand the vehicle is private.

**Acceptance Criteria:**
- [ ] AddVehiclePage heading changed from `"Add Vehicle"` to `"Add to Private Inventory"`
- [ ] Submit button changed from `"Add Vehicle"` to `"Add to Inventory"`
- [ ] Add a subtitle/helper text below the heading: _"Vehicles in your private inventory are only visible to you. Introduce them to buyers through their want listings."_
- [ ] EditVehiclePage heading changed from `"Edit Vehicle"` to `"Edit Inventory Vehicle"`
- [ ] Description placeholder changed from `"Describe your vehicle..."` to `"Describe your vehicle — this will be shown to buyers when you introduce it..."`
- [ ] **Verify in browser:** /add-vehicle page shows "Add to Private Inventory" heading with helper text

---

### US-008: Private Inventory — Matches and introduction language

**Description:** As a user on the vehicle matches page, I want language that reflects private inventory terminology.

**Acceptance Criteria:**
- [ ] VehicleMatchesPage: "Introduce Vehicle" button text changed to `"Introduce from Inventory"`
- [ ] VehicleMatchesPage: Modal heading "Introduce Your Vehicle" changed to `"Introduce Your Vehicle to This Buyer"`
- [ ] VehicleMatchesPage: Textarea placeholder changed from `"Tell the buyer about your vehicle..."` to `"Write a personal note to the buyer about your vehicle..."`
- [ ] VehicleMatchesPage: Empty state changed from `"No matching want listings found for this vehicle."` to `"No matching buyers found for this vehicle yet. Check back as new want listings are posted."`
- [ ] WantListingDetailPage: "Introduce a Vehicle" link text changed to `"Introduce from My Inventory"`
- [ ] **Verify in browser:** Navigate to a vehicle's matches page — all labels use updated language

---

### US-009: Private Inventory — VehicleCard component update

**Description:** As a user viewing vehicle cards on the dashboard, I want the card actions to use inventory language.

**Acceptance Criteria:**
- [ ] VehicleCard "View Matches" button text changed to `"Find Buyers"`
- [ ] VehicleCard "Edit" button text remains `"Edit"` (no change needed)
- [ ] **Verify in browser:** Dashboard vehicle cards show "Find Buyers" button

---

### US-010: Design tokens upgrade — border-radius and typography

**Description:** As a user, I want the platform to feel more modern with rounder corners and refined typography.

**Acceptance Criteria:**
- [ ] Update CSS variables in `variables.css`:
  - `--radius-sm`: `4px` → `6px`
  - `--radius-md`: `8px` → `12px`
  - `--radius-lg`: `12px` → `16px`
  - Add `--radius-xl: 20px`
- [ ] Optimize Inter font weights: add `300` (light) weight for secondary text, use `700` for primary headings instead of `600`
- [ ] Increase heading sizes slightly: `--font-3xl`: `2rem` → `2.25rem`, add `--font-4xl: 2.75rem`
- [ ] Add a `--font-display` weight variable set to `700` for hero/page headings
- [ ] Update letter-spacing: add `--letter-tight: -0.02em` for headings
- [ ] All page headings (h1) use `font-weight: var(--font-bold)` with `letter-spacing: var(--letter-tight)`
- [ ] **Verify in browser:** Corners are noticeably rounder on cards, buttons, inputs. Headings feel bolder and tighter.

---

### US-011: Scroll-triggered card animations

**Description:** As a user scrolling through listings, I want cards to animate in with a staggered fade+slide effect so the experience feels dynamic and premium.

**Acceptance Criteria:**
- [ ] Create a reusable `useScrollReveal` hook (or CSS-based approach using Intersection Observer) that triggers animations when elements enter the viewport
- [ ] Animation: fade in (opacity 0→1) + slide up (translateY 30px→0) with `0.5s ease-out` duration
- [ ] Stagger: each card in a grid/list has a slight delay offset (50ms per card, max 300ms total)
- [ ] Apply to: ListingCard grid on HomePage, VehicleCard grid on Dashboard, IntroCard list on Dashboard
- [ ] Cards only animate on first appearance (not on re-scroll)
- [ ] `prefers-reduced-motion` disables all scroll animations
- [ ] **Verify in browser:** Scroll down the homepage — listing cards fade in and slide up as they enter the viewport, with a slight stagger between each card

---

### US-012: Enhanced card hover and interaction effects

**Description:** As a user hovering over listing cards, I want polished hover effects that make the interface feel responsive and premium.

**Acceptance Criteria:**
- [ ] ListingCard hover: `translateY(-4px)` lift + `box-shadow: 0 12px 24px rgba(0,0,0,0.08)` + subtle `border-color` transition to accent at 20% opacity
- [ ] ListingCard image area: subtle `scale(1.03)` zoom on hover with `overflow: hidden` on container (parallax-like feel)
- [ ] VehicleCard hover: same lift effect as ListingCard
- [ ] All hover transitions use `0.25s cubic-bezier(0.4, 0, 0.2, 1)` for smooth, natural feel
- [ ] Button hover effects: all `.btn` elements get a subtle `translateY(-1px)` + enhanced shadow on hover
- [ ] Active/pressed state: `scale(0.97)` for satisfying click feedback
- [ ] **Verify in browser:** Hover over listing cards — smooth lift with shadow. Hover over buttons — subtle rise effect.

---

### US-013: NavBar visual polish

**Description:** As a user, I want a more premium-feeling navigation bar with refined spacing and transitions.

**Acceptance Criteria:**
- [ ] NavBar background: add subtle bottom shadow `box-shadow: 0 1px 3px rgba(0,0,0,0.04)` (softer than current border)
- [ ] NavBar height increased from `64px` to `68px` for more breathing room
- [ ] Brand name: use `font-weight: 800` (extra-bold) for "GitchaCars"
- [ ] CTA buttons: add subtle `backdrop-filter: blur(4px)` effect and refine gradient to be softer
- [ ] Avatar dropdown and notification bell: add `0.2s` hover scale effect (`scale(1.05)`)
- [ ] Smooth hide/show on scroll: NavBar hides (translateY -100%) when scrolling down, shows when scrolling up (60px threshold)
- [ ] Transition for hide/show: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- [ ] **Verify in browser:** Scroll down — NavBar smoothly hides. Scroll up — it reappears. Hover CTA buttons — refined effects.

---

### US-014: Form input premium styling

**Description:** As a user filling out forms, I want inputs that feel modern and responsive with smooth focus transitions.

**Acceptance Criteria:**
- [ ] All text inputs and textareas: border-radius updated to `var(--radius-md)` (12px after US-010)
- [ ] Focus state: border transitions to `var(--color-accent)` with a soft glow `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12)` — smoother and wider than current `2px`
- [ ] Focus transition duration: `0.2s ease`
- [ ] Input padding: increase to `12px 16px` for more spacious feel
- [ ] Label: `font-weight: 500`, `font-size: var(--font-sm)`, `margin-bottom: 6px`, color `var(--color-text-secondary)`
- [ ] Placeholder text: color `var(--color-text-muted)` with `font-weight: 300` (light)
- [ ] Select elements: same border-radius and focus treatment as text inputs
- [ ] **Verify in browser:** Click into a form field — smooth blue glow appears. All inputs feel spacious with rounded corners.

---

### US-015: Page transitions between routes

**Description:** As a user navigating between pages, I want smooth transitions so the app feels like a native experience.

**Acceptance Criteria:**
- [ ] Add a CSS-based page transition: content fades in with `opacity 0→1` and slight `translateY(8px→0)` on route change
- [ ] Transition duration: `0.25s ease-out`
- [ ] Implement via a wrapper component around route content (e.g., `<PageTransition>`) that re-triggers animation on route change using React `key` prop tied to location
- [ ] No layout shift during transitions (use `will-change: opacity, transform`)
- [ ] `prefers-reduced-motion` disables page transitions
- [ ] **Verify in browser:** Click between Homepage → Login → Register — each page fades in smoothly

---

### US-016: Enhanced empty states

**Description:** As a user seeing an empty section, I want personality and clear guidance so I'm not confused.

**Acceptance Criteria:**
- [ ] Dashboard empty states: update copy to be warmer and actionable (see US-006 for inventory language)
- [ ] Empty states on all pages use Lottie animation (already exists) + updated copy with stronger CTAs
- [ ] Add a subtle background accent (light gradient or pattern) behind empty state content
- [ ] Empty state CTA buttons use the primary gradient style (not outline)
- [ ] Introductions empty state: _"No introductions yet. When sellers introduce their vehicles to your listings, they'll appear here."_
- [ ] **Verify in browser:** View dashboard with no listings — empty state has Lottie animation, warm copy, and prominent CTA button

---

### US-017: Mobile experience polish

**Description:** As a mobile user, I want a native-app quality experience with proper touch targets and spacing.

**Acceptance Criteria:**
- [ ] All touch targets at least 44px × 44px on mobile
- [ ] Card spacing on mobile: `gap: 16px` between listing cards (ensure no cramping)
- [ ] Bottom padding on all pages: at least `80px` to clear any floating elements
- [ ] Form inputs on mobile: `font-size: 16px` to prevent iOS zoom (verify existing)
- [ ] NavBar mobile: compact but not cramped, CTA icons are clear
- [ ] Listing cards on mobile: full-width with proper image aspect ratio maintained
- [ ] Scroll animations still work on mobile but with reduced motion thresholds
- [ ] **Verify in browser (375px viewport):** Navigate through homepage, dashboard, create-listing — all elements properly sized and spaced

---

### US-018: E2E tests — Private Inventory language

**Description:** As a developer, I want all E2E tests updated to reflect the new "Private Inventory" terminology so the test suite stays green.

**Acceptance Criteria:**
- [ ] Update `seller-dashboard.spec.js`: "Add Vehicle" text assertions → "Private Inventory" or "Add to Inventory"
- [ ] Update `unified-dashboard.spec.js`: "My Vehicles" → "My Private Inventory", "Add Vehicle" → updated labels
- [ ] Update `vehicles.spec.js`: page heading assertions from "Add Vehicle" to "Add to Private Inventory"
- [ ] Update `navigation.spec.js`: NavBar "Add Vehicle" text assertion → "Private Inventory"
- [ ] Update `introductions.spec.js`: "Introduce Vehicle" → "Introduce from Inventory"
- [ ] Update `visual.spec.js`: re-capture baseline screenshots after language changes
- [ ] Update `auth-ux.spec.js`: "My Vehicles" assertion → "My Private Inventory"
- [ ] All 138 existing tests pass after updates (some assertions changed, no tests removed)
- [ ] Run full test suite: `npx playwright test` — 0 failures

---

### US-019: E2E tests — SearchableSelect and form fixes

**Description:** As a developer, I want E2E tests that verify the SearchableSelect dropdown renders correctly and the AI chat provides guidance.

**Acceptance Criteria:**
- [ ] New test: SearchableSelect dropdown is visible above other form elements when opened (verify dropdown has non-zero height and is not clipped)
- [ ] New test: AI chat greeting message is immediately visible on page load (no API call)
- [ ] New test: AI chat error fallback shows "switch to Manual Form" message when API fails
- [ ] New test: Manual form description textarea has character count indicator
- [ ] New test: "Features & Details" section auto-opens after Budget & Location is completed
- [ ] All new tests added to existing spec files or a new `form-ux.spec.js`
- [ ] Full suite passes: `npx playwright test` — 0 failures

---

### US-020: E2E tests — UI revamp visual verification

**Description:** As a developer, I want E2E tests that verify scroll animations, page transitions, and the NavBar hide/show behavior work correctly.

**Acceptance Criteria:**
- [ ] New test: Scroll down homepage — verify cards have `opacity: 1` after scrolling into viewport (not `0`)
- [ ] New test: NavBar hides when scrolling down 100px, reappears when scrolling up
- [ ] New test: Page transition — navigate to /login, verify content is visible (opacity: 1) after 500ms
- [ ] New test: Card hover — verify listing card has elevated box-shadow on hover
- [ ] New test: Mobile viewport (375px) — no horizontal overflow on homepage, dashboard, create-listing
- [ ] Re-capture all visual regression screenshots in `visual.spec.js`
- [ ] Full suite passes: `npx playwright test` — 0 failures

---

## 4. Functional Requirements

**SearchableSelect Fix:**
- FR-1: The `.searchable-select-dropdown` must render above all sibling and parent elements using `z-index: 100` or higher
- FR-2: The `.accordion-body-wrapper` must use `overflow: visible` when any child SearchableSelect is open, or the dropdown must use a React portal to render outside the accordion DOM tree
- FR-3: Dropdown must dismiss on outside click and on Escape key

**AI Chat:**
- FR-4: The AIChatBox must display a hardcoded greeting message on mount (no API call)
- FR-5: The AI system prompt must instruct Claude to extract structured data AND generate a title and 2-3 sentence description
- FR-6: The ListingPreview must display the AI-generated title and description prominently
- FR-7: When the AI API is unavailable, the chat must display a fallback message with a button to switch to manual mode

**Private Inventory Language:**
- FR-8: All user-facing instances of "Add Vehicle" must be replaced with inventory terminology
- FR-9: All user-facing instances of "My Vehicles" must become "My Private Inventory"
- FR-10: Helper text must explain: "Vehicles in your private inventory are only visible to you"
- FR-11: URL routes remain unchanged (`/add-vehicle`, `/edit-vehicle/:id`, `/vehicles/:id/matches`)

**UI Revamp:**
- FR-12: Border-radius values must increase globally via CSS variable updates
- FR-13: Scroll-triggered animations must use Intersection Observer API with staggered delays
- FR-14: NavBar must hide on scroll-down and show on scroll-up with smooth transitions
- FR-15: Page transitions must animate on route changes using opacity and translateY
- FR-16: All animations must respect `prefers-reduced-motion` media query

## 5. Non-Goals (Out of Scope)

- No font family changes (keep Inter — just optimize weights/sizes)
- No Tailwind CSS or component library additions (keep plain CSS)
- No URL/route changes (only labels and copy)
- No backend API changes (except AI system prompt update)
- No new pages or features beyond what's described
- No changes to admin page terminology (admin sees "Vehicles" tab as-is)
- No changes to the database schema

## 6. Design Considerations

- **Color palette**: Keep navy (#1B2A4A) + blue accent (#2563EB) as primary. Use lighter tints for backgrounds and hover states.
- **Border-radius philosophy**: Everything should feel pill-like or softly rounded. No sharp 90-degree corners.
- **Animation philosophy**: Subtle, purposeful, never distracting. All animations under 0.5s. Natural easing curves (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Typography hierarchy**: Page titles bold (700) and tight. Section headers semibold (600). Body normal (400). Secondary text light (300) and muted.
- **Whitespace**: Increase padding and margins by ~20% throughout for breathing room.

## 7. Technical Considerations

- **SearchableSelect z-index**: The accordion uses `maxHeight` animation (not conditional rendering), so `overflow: hidden` on the wrapper clips dropdowns. Solutions: (a) use `overflow: visible` with `clip-path` for collapse animation instead, or (b) render dropdowns via React portal outside the accordion DOM.
- **Scroll animations**: Use a single Intersection Observer instance for performance. Disconnect observers after animation triggers.
- **NavBar scroll behavior**: Use a `scroll` event listener with `requestAnimationFrame` throttling. Track scroll direction by comparing `window.scrollY` across frames.
- **Page transitions**: Use React Router's `useLocation` to detect route changes. Animate with CSS transitions keyed to `location.pathname`.
- **Test impact**: ~15 E2E tests will need assertion text updates for the language change. All visual regression screenshots need re-capture.

## 8. Success Metrics

- SearchableSelect dropdown is fully usable on all form instances (0 z-index related support issues)
- AI chat generates a title and description for at least 80% of conversations
- All "Add Vehicle" / "My Vehicles" text replaced — grep confirms 0 stale references
- PageSpeed Insights: no regression in performance score from animations (use `will-change` and GPU-accelerated properties)
- Full E2E suite: 138+ tests passing (original + new tests)

## 9. Open Questions

- Should the AI chat also offer quick-start buttons (e.g., "SUV under $30k", "Family sedan", "Electric vehicle") for users who don't know what to type?
- Should we add a "copy to clipboard" feature for the AI-generated description so users can edit it in manual mode?
- For the NavBar hide-on-scroll: should it hide on the homepage only, or all pages?
