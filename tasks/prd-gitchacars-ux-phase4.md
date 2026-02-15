# PRD: GitchaCars UX Phase 4 — Smart Actions, Visual Effects & Layout Polish

## 1. Introduction/Overview

UX Phase 4 transforms the GitchaCars homepage from a passive listing browser into an **action-driven marketplace**. The keyword search box becomes a "What would you like to do?" prompt that guides users into two primary flows: sellers finding matching buyers, and buyers creating want listings — both via conversational AI directly in the sidebar. Visual enhancements (aurora gradient backgrounds, shimmer CTA buttons) elevate the detail page experience and draw attention to the introduction workflow. Layout fixes ensure the filter sidebar scrolls naturally with page content rather than having its own scrollbar.

**Key constraint:** The project uses **plain CSS with CSS custom properties** — no Tailwind, no TypeScript, no antd. All 21st Dev-inspired effects must be adapted to plain CSS `@keyframes` animations.

## 2. Goals

- **Streamline user onboarding**: Guide new users to their primary action (find a buyer or post a want listing) within seconds of landing on the homepage
- **Increase introduction submissions**: Make the "Send Introduction" CTA impossible to miss with shimmer animation
- **Improve filter sidebar UX**: Eliminate confusing independent scroll behavior; all content scrolls with the page
- **Add visual polish**: Aurora gradient backgrounds on detail pages create a premium feel
- **Leverage AI for both sides of the marketplace**: Sellers describe their vehicle in natural language → filters auto-populate; Buyers describe what they want → want listing auto-created
- **Maintain test coverage**: All 189 existing E2E tests pass; new features get dedicated test coverage

## 3. User Stories

---

### US-001: Remove Filter Sidebar Independent Scroll
**Description:** As a user, I want the filter sidebar to scroll with the page naturally so that I don't have two competing scrollbars.

**Acceptance Criteria:**
- [ ] Remove `overflow-y: auto` and `max-height: calc(100vh - 100px)` from `.filter-sidebar` in FilterSidebar.css
- [ ] Sidebar content expands fully — all filter sections visible by scrolling the main page
- [ ] On desktop, sidebar remains `position: sticky; top: 84px` but allows content to overflow below viewport
- [ ] No horizontal layout shift when sidebar content is taller than viewport
- [ ] Mobile slide-up sheet behavior is unchanged (still has its own scroll with `max-height: 85vh`)
- [ ] Verify in browser: open all filter sections on desktop — page scrollbar handles everything, no sidebar scrollbar appears

---

### US-002: Move Location Filter Higher in Sidebar
**Description:** As a user, I want the Location filter near the top of the sidebar so I can set my area quickly without scrolling past less-used filters.

**Acceptance Criteria:**
- [ ] Location filter section moves to position 3 (after Make, before Vehicle Type)
- [ ] New order: Keyword → Make → **Location** → Vehicle Type → Year Range → Price Range → Max Mileage → Transmission → Drivetrain
- [ ] Location section is **expanded by default** (was previously collapsed)
- [ ] All filter functionality (zip code input, radius dropdown, Nationwide option) works identically in new position
- [ ] Verify in browser: Location section appears after Make and before Vehicle Type

---

### US-003: Fix Double Plus Icon in NavBar
**Description:** As a user, I want the "Add Private Inventory" button to show only one plus symbol, not two.

**Acceptance Criteria:**
- [ ] In NavBar.jsx, change the label text from `+ Private Inventory` to `Private Inventory`
- [ ] The SVG plus icon remains as-is (single plus in the icon)
- [ ] Button still links to add-vehicle page with correct redirect parameter
- [ ] Mobile view still shows icon-only (no label text)
- [ ] Verify in browser: button shows one SVG plus + "Private Inventory" text, not "+" + "Private Inventory"

---

### US-004: Aurora Background CSS Component
**Description:** As a developer, I want a reusable aurora gradient animation implemented in plain CSS so that it can be applied to page backgrounds.

**Acceptance Criteria:**
- [ ] Create `/frontend/src/components/AuroraBackground.jsx` and `AuroraBackground.css`
- [ ] Component accepts `children` and optional `className` prop
- [ ] CSS implements a slow-moving gradient animation using `@keyframes aurora` (60s linear infinite cycle)
- [ ] Gradient uses brand-adjacent colors: `#2563EB` (blue accent), `#818CF8` (indigo-400), `#93C5FD` (blue-300), `#C4B5FD` (violet-300), `#60A5FA` (blue-400)
- [ ] Animation uses `background-size: 300% 200%` with position shifting from `50% 50%` to `350% 50%`
- [ ] Background has a radial gradient mask (`radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)`) so it fades out, not covering entire page
- [ ] Opacity set to 0.3–0.5 so content remains readable
- [ ] `pointer-events: none` on the animated layer so it doesn't interfere with clicks
- [ ] `filter: blur(10px)` for soft diffused effect
- [ ] Works without Tailwind — uses plain CSS custom properties and `@keyframes`
- [ ] Verify in browser: create a test page or storybook-style render showing the aurora effect

---

### US-005: Apply Aurora Background to Want Listing Detail Page
**Description:** As a user viewing a want listing, I want a subtle animated gradient background in the hero section that makes the page feel premium.

**Acceptance Criteria:**
- [ ] Import `AuroraBackground` into `WantListingDetailPage.jsx`
- [ ] Wrap the hero/header area (image section + title area) with the aurora component
- [ ] Aurora is positioned behind content (absolute/fixed, z-index below content)
- [ ] Aurora does NOT cover the entire page — only the top hero section (approximately top 400px)
- [ ] All text, buttons, and interactive elements remain fully readable and clickable
- [ ] Page performance is acceptable — no janky scroll or dropped frames
- [ ] Mobile: aurora effect is visible but can be reduced in opacity or disabled if performance is poor
- [ ] Verify in browser: visit a want listing detail page, see subtle blue/indigo gradient animation behind the hero

---

### US-006: Shimmer Button CSS Component
**Description:** As a developer, I want a reusable shimmer/glow button animation in plain CSS so it can highlight important CTAs.

**Acceptance Criteria:**
- [ ] Create `/frontend/src/components/ShimmerButton.jsx` and `ShimmerButton.css`
- [ ] Component extends the existing `.btn` base class and accepts all standard button props
- [ ] CSS implements a rotating conic-gradient border shimmer using `@keyframes shimmer-slide` and `@keyframes spin-around`
- [ ] Shimmer color defaults to white (`#ffffff`) against accent background (`#2563EB`)
- [ ] `shimmer-slide` animation: alternating slide across container width (`100cqw`) over 3s
- [ ] `spin-around` animation: full 360° rotation over 6s with keyframes at 0%, 15%, 35%, 65%, 85%, 100%
- [ ] Inner shadow highlight: `inset_0_-8px_10px_#ffffff1f`, intensifies on hover to `#ffffff3f`
- [ ] Button has `overflow: hidden`, shimmer layer is `z-index: -1` behind content
- [ ] `border-radius: 100px` (pill shape) by default, overridable via CSS variable
- [ ] Active state: slight `translateY(1px)` press effect
- [ ] Works without Tailwind — pure CSS with `@keyframes` and CSS custom properties
- [ ] Verify in browser: render the shimmer button and confirm animation loops, hover changes shadow

---

### US-007: Introduction Box Layout & Language Redesign
**Description:** As a seller viewing a buyer's want listing, I want a clearer introduction workflow with "Add My Vehicle" and "Send Introduction" labeling so I understand exactly what to do.

**Acceptance Criteria:**
- [ ] Restructure the `.detail-intro-card` in `WantListingDetailPage.jsx`:
  1. **"Add My Vehicle" section**: A prominent button/box labeled "Add My Vehicle" with a vehicle icon. Clicking it reveals the vehicle selector dropdown below it.
  2. **Message section**: A textarea labeled "Message to Buyer" with placeholder "Write a personal note..." — always visible below the vehicle section.
  3. **"Send Introduction" button**: Full-width at the bottom, uses the ShimmerButton component.
- [ ] Vehicle selector is HIDDEN by default — only shows after clicking "Add My Vehicle"
- [ ] Once a vehicle is selected, the "Add My Vehicle" box shows the selected vehicle info (year/make/model) with an "×" to change
- [ ] If user is not authenticated: show sign-in prompt with "Sign In / Up" button (unchanged)
- [ ] If user has no vehicles: "Add My Vehicle" button links to add-vehicle page (unchanged behavior)
- [ ] Section title reads "Introduce Your Vehicle" (unchanged)
- [ ] Button text reads "Send Introduction" (already correct)
- [ ] Clear visual separation between sections using borders or spacing
- [ ] Verify in browser: visit detail page as seller with vehicles, see new 3-part layout

---

### US-008: Apply Shimmer Button to Send Introduction
**Description:** As a seller, I want the "Send Introduction" button to have an eye-catching shimmer animation so I'm drawn to complete the action.

**Acceptance Criteria:**
- [ ] Replace the standard `.btn` on the "Send Introduction" button with the `ShimmerButton` component
- [ ] Shimmer uses brand accent color `#2563EB` as background, white shimmer streak
- [ ] Button is full-width within the intro card
- [ ] Disabled state (no vehicle selected or sending in progress) stops the shimmer animation and grays out
- [ ] "Sending..." loading state shows text change but no shimmer
- [ ] After successful send, the success state replaces the entire form (existing behavior preserved)
- [ ] Verify in browser: shimmer animates on the button, stops when disabled, sends introduction correctly

---

### US-009: Smart Action Box — Replace Keyword Search
**Description:** As a user, I want the keyword search to be replaced with a "What would you like to do?" prompt that guides me to the right action.

**Acceptance Criteria:**
- [ ] In `FilterSidebar.jsx`, replace the "Keyword" filter section with a new "Smart Action Box" component
- [ ] Create `/frontend/src/components/SmartActionBox.jsx` and `SmartActionBox.css`
- [ ] Default state: Shows "What would you like to do?" text with a subtle down-arrow icon
- [ ] Clicking the box reveals a dropdown with two options:
  1. 🔍 **"Find a Buyer for My Vehicle"** — with subtitle "Describe your car and we'll match you"
  2. 📝 **"Post a Buyer Want Listing"** — with subtitle "Tell us what you're looking for"
- [ ] Dropdown has a smooth CSS slide-down animation (`max-height` transition from 0 to content height, 300ms ease-out)
- [ ] Each option is a clickable card with icon, title, and subtitle
- [ ] Hover state: slight background color change and shadow lift
- [ ] Clicking outside the dropdown closes it
- [ ] SmartActionBox is always expanded (no toggle — it's the first thing users see)
- [ ] Verify in browser: action box appears at top of sidebar, dropdown animates open/closed, options are clickable

---

### US-010: Backend AI Endpoint for Seller Filter Extraction
**Description:** As a developer, I need a backend endpoint that takes a natural-language vehicle description and returns structured filter data so the sidebar can auto-populate.

**Acceptance Criteria:**
- [ ] Create `POST /api/ai/extract-filters` endpoint in `/backend/src/routes/ai.js`
- [ ] Request body: `{ message: "I have a 2021 Toyota RAV4 AWD with 30k miles" }`
- [ ] Response format: `{ data: { make: "Toyota", model: "RAV4", yearMin: 2021, yearMax: 2021, vehicleType: "suv", drivetrain: "awd", mileageMax: 30000 } }`
- [ ] Uses Claude API (existing `aiService.js`) with a system prompt that extracts structured vehicle data
- [ ] System prompt instructs Claude to return JSON matching the filter sidebar field names exactly
- [ ] Handle partial data gracefully — if user says "I have a Honda", return `{ make: "Honda" }` only
- [ ] Handle conversational follow-ups — endpoint is stateless per call but response always returns complete extracted data
- [ ] Validate make against known makes from `car-info` package (backend should import the same data)
- [ ] Auth required (user must be logged in) — uses existing `authenticate` middleware
- [ ] Error handling: returns 400 for empty message, 500 for AI service failure
- [ ] Verify via curl: `curl -X POST localhost:3001/api/ai/extract-filters -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"message":"2022 Ford F150 4x4"}'` returns structured JSON

---

### US-011: "Find a Buyer" — Sidebar Chat Component
**Description:** As a seller, I want to describe my vehicle in a chat and have the filters automatically populate so I can find matching buyers instantly.

**Acceptance Criteria:**
- [ ] Create `/frontend/src/components/SidebarChat.jsx` and `SidebarChat.css`
- [ ] SidebarChat is a compact chat interface designed for the 280px sidebar width
- [ ] Shows a greeting message: "Tell me about the vehicle you'd like to sell. Include details like make, model, year, and condition."
- [ ] Has a text input with send button at the bottom
- [ ] User messages appear as small right-aligned bubbles; AI responses as left-aligned bubbles
- [ ] Messages scroll in the chat area (this component can have its own scroll since it's an active chat)
- [ ] Max height of chat area: 300px to leave room for filter sections below
- [ ] On send: calls `POST /api/ai/extract-filters` with the user's message
- [ ] Receives structured filter data in response
- [ ] Displays a confirmation message: "Got it! I've found buyers looking for [make] [model]. Filters applied." (or similar)
- [ ] Provides a "Clear & Start Over" link to reset the chat and filters
- [ ] Styling matches existing AIChatBox but scaled down for sidebar width
- [ ] Verify in browser: type a vehicle description, see AI response, confirm chat works

---

### US-012: "Find a Buyer" — Auto-Populate Filters from AI
**Description:** As a seller using the sidebar chat, I want the filter sidebar to automatically update with the vehicle data the AI extracts so matching buyer listings appear.

**Acceptance Criteria:**
- [ ] SidebarChat receives an `onFiltersExtracted` callback prop from FilterSidebar/HomePage
- [ ] When AI returns structured filter data, call `onFiltersExtracted(filterData)`
- [ ] FilterSidebar updates its state to apply extracted filters: make, model (if available), yearMin, yearMax, vehicleType, drivetrain, mileageMax
- [ ] Filter sections that receive values automatically expand (open state)
- [ ] Listing results update in real-time as filters are applied (existing filter behavior)
- [ ] The SidebarChat minimizes or collapses after filters are applied, showing a summary like "Showing buyers for 2021 Toyota RAV4" with an "Edit" button
- [ ] Clicking "Edit" reopens the chat to refine the search
- [ ] User can still manually adjust individual filter values after AI populates them
- [ ] Verify in browser: describe a vehicle in chat → filters populate → listings update → chat minimizes

---

### US-013: "Post a Want Listing" — Sidebar Chat Flow
**Description:** As a buyer, I want to create a want listing conversationally in the sidebar so I don't have to navigate away from the homepage.

**Acceptance Criteria:**
- [ ] When user selects "Post a Buyer Want Listing" from the Smart Action Box:
  - If NOT logged in: redirect to `/auth?mode=login&redirect=/` (return to homepage after login)
  - If logged in: show the SidebarChat in "create listing" mode
- [ ] Create-listing mode uses the existing `/api/ai/chat` endpoint (same as AIChatBox on CreateListingPage)
- [ ] Chat greeting: "What kind of vehicle are you looking for? Tell me about your ideal car — make, model, year range, budget, features..."
- [ ] As user describes their want listing, AI extracts structured listing data
- [ ] Show a preview card below the chat with extracted fields (make, model, year range, budget, etc.)
- [ ] Preview card has "Edit" button (opens the full CreateListingPage with data pre-filled) and "Post Listing" button
- [ ] "Post Listing" submits the want listing via existing `POST /api/want-listings` endpoint
- [ ] On success: show success message in sidebar + redirect to the new listing detail page after 2 seconds
- [ ] On error: show error message in chat, allow retry
- [ ] Verify in browser: select "Post a Want Listing" → chat appears → describe a car → preview shows → post succeeds

---

### US-014: E2E Tests — Filter Sidebar & NavBar Fixes
**Description:** As a developer, I want E2E tests verifying the sidebar layout changes and NavBar fix so regressions are caught.

**Acceptance Criteria:**
- [ ] Create `/frontend/e2e/ux-phase4-sidebar.spec.js`
- [ ] Test: Filter sidebar has no `overflow-y: auto` computed style on desktop
- [ ] Test: Location filter section appears before Vehicle Type section in DOM order
- [ ] Test: Location filter section is expanded by default
- [ ] Test: All filter sections are accessible by scrolling the page (not a separate scrollbar)
- [ ] Test: NavBar "Private Inventory" button text does not start with "+" (no double plus)
- [ ] Test: NavBar "Private Inventory" button contains an SVG icon
- [ ] All 189 existing E2E tests still pass
- [ ] Verify in browser: tests pass via `npx playwright test e2e/ux-phase4-sidebar.spec.js`

---

### US-015: E2E Tests — Smart Action Box & Chat Flows
**Description:** As a developer, I want E2E tests for the Smart Action Box and sidebar chat flows so the core new functionality is covered.

**Acceptance Criteria:**
- [ ] Create `/frontend/e2e/ux-phase4-smart-action.spec.js`
- [ ] Test: Smart Action Box displays "What would you like to do?" text
- [ ] Test: Clicking the action box reveals dropdown with two options
- [ ] Test: Dropdown has "Find a Buyer for My Vehicle" option
- [ ] Test: Dropdown has "Post a Buyer Want Listing" option
- [ ] Test: Clicking outside the dropdown closes it
- [ ] Test: Selecting "Find a Buyer" shows the sidebar chat interface (when logged in)
- [ ] Test: Selecting "Post a Buyer Want Listing" when not logged in redirects to auth page
- [ ] Test: Sidebar chat has input field and send button
- [ ] All tests use the existing `loginAsBuyer`/`loginAsSeller` helpers from `helpers.js`
- [ ] Verify: tests pass via `npx playwright test e2e/ux-phase4-smart-action.spec.js`

---

### US-016: E2E Tests — Visual Effects & Introduction Box
**Description:** As a developer, I want E2E tests for the aurora background, shimmer button, and introduction box redesign.

**Acceptance Criteria:**
- [ ] Create `/frontend/e2e/ux-phase4-visual.spec.js`
- [ ] Test: Want listing detail page has `.aurora-background` element in hero section
- [ ] Test: Aurora background element has `animation` CSS property containing "aurora"
- [ ] Test: Send Introduction button has shimmer animation classes/styles
- [ ] Test: Introduction card has "Add My Vehicle" button/text (not just a dropdown)
- [ ] Test: Clicking "Add My Vehicle" reveals the vehicle selector dropdown
- [ ] Test: Message textarea is visible with correct placeholder text
- [ ] Test: "Send Introduction" button text is correct
- [ ] Test: Unauthenticated user sees "Sign In / Up" in intro card (unchanged)
- [ ] Verify: tests pass via `npx playwright test e2e/ux-phase4-visual.spec.js`

---

### US-017: Verify All Legacy E2E Tests Pass
**Description:** As a developer, I want to confirm that all 189 pre-existing E2E tests pass after Phase 4 changes.

**Acceptance Criteria:**
- [ ] Run full test suite: `npx playwright test`
- [ ] All 189 previously passing tests still pass
- [ ] Any test failures caused by Phase 4 changes are identified and fixed
- [ ] Tests that reference the old keyword search (if any) are updated to match new Smart Action Box
- [ ] Tests that reference the old intro card layout (if any) are updated
- [ ] Total passing test count is 189 + new Phase 4 tests
- [ ] Print final test count summary

---

## 4. Functional Requirements

**Filter Sidebar:**
- FR-1: FilterSidebar CSS must NOT have `overflow-y: auto` or `max-height` on desktop viewports
- FR-2: Filter section order must be: Smart Action Box → Make → Location → Vehicle Type → Year Range → Price Range → Max Mileage → Transmission → Drivetrain
- FR-3: Location section must be expanded by default (`location: true` in initial sections state)
- FR-4: Mobile filter sheet retains its own scroll behavior (unchanged)

**NavBar:**
- FR-5: "Add Private Inventory" button label text must be "Private Inventory" (no leading `+`)
- FR-6: SVG plus icon remains in the button

**Smart Action Box:**
- FR-7: SmartActionBox replaces the Keyword filter section as the first section in FilterSidebar
- FR-8: Dropdown must have two options: "Find a Buyer for My Vehicle" and "Post a Buyer Want Listing"
- FR-9: Dropdown opens/closes with a CSS slide animation (max-height transition, 300ms)
- FR-10: Clicking outside the dropdown closes it (document click listener)

**Seller Chat (Find a Buyer):**
- FR-11: `POST /api/ai/extract-filters` accepts `{ message }` and returns structured filter data
- FR-12: SidebarChat component displays in 280px sidebar width with 300px max-height chat area
- FR-13: Extracted filter data auto-populates FilterSidebar state and triggers listing refresh
- FR-14: Chat minimizes after filters are applied, showing a summary with "Edit" option

**Buyer Chat (Post Want Listing):**
- FR-15: Sidebar "Post a Want Listing" flow requires authentication (redirect to /auth if not logged in)
- FR-16: Uses existing `/api/ai/chat` endpoint for conversational listing creation
- FR-17: Preview card shows extracted listing data with "Edit" and "Post Listing" buttons
- FR-18: "Post Listing" submits via `POST /api/want-listings` and redirects to the new listing on success

**Visual Effects:**
- FR-19: AuroraBackground uses `@keyframes aurora` with 60s infinite linear animation
- FR-20: Aurora gradient colors: blue-500, indigo-300, blue-300, violet-200, blue-400 (adapted to hex values from design system)
- FR-21: Aurora masked with `radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)`
- FR-22: Aurora applied to want listing detail page hero section only, with `pointer-events: none` and `opacity: 0.35`
- FR-23: ShimmerButton uses `@keyframes shimmer-slide` (3s alternate infinite) and `@keyframes spin-around` (6s linear infinite)
- FR-24: ShimmerButton has conic-gradient shimmer, inner shadow highlight, press effect on active

**Introduction Box:**
- FR-25: Intro card has three distinct sections: "Add My Vehicle" button → Message textarea → "Send Introduction" ShimmerButton
- FR-26: Vehicle selector is hidden by default; clicking "Add My Vehicle" reveals it
- FR-27: Selected vehicle shows as inline text (year/make/model) with "×" clear button, not as a dropdown
- FR-28: ShimmerButton is disabled (no animation, grayed out) when no vehicle is selected

## 5. Non-Goals (Out of Scope)

- **No Tailwind CSS**: All visual effects are adapted to plain CSS. Do not install or configure Tailwind.
- **No TypeScript**: All components remain `.jsx`. Do not add TypeScript configuration.
- **No antd**: The dropdown is custom CSS, not Ant Design. Do not install antd or @ant-design/icons.
- **No shadcn/ui**: No shadcn infrastructure. Keep existing component architecture.
- **No dark mode**: Aurora and shimmer effects only need to work in light mode (current theme).
- **No real-time WebSocket chat**: AI chat uses standard HTTP POST request/response, not streaming.
- **No vehicle image display in sidebar chat**: Chat only handles text — no image uploads or previews.
- **No full Create Listing form in sidebar**: The sidebar "Post a Want Listing" flow uses a simplified chat + preview, not the full accordion form. "Edit" button navigates to the full form.

## 6. Design Considerations

**Aurora Background:**
- Colors should be subtle and match the existing blue-accent design system
- Opacity must be low enough (0.3–0.5) that all text passes WCAG contrast requirements
- Animation should be imperceptible to most users — creates ambiance, not distraction
- `will-change: transform` for GPU acceleration; `filter: blur(10px)` for softness

**Shimmer Button:**
- The shimmer effect should be noticeable but not flashy — think Apple "slide to unlock", not Las Vegas
- White shimmer on blue background creates a premium feel
- Disabled state must clearly communicate non-interactivity (gray background, no animation)

**Smart Action Box:**
- The "What would you like to do?" prompt should feel inviting, not like a form field
- Options should have icons (magnifying glass for find, pencil/document for post)
- The transition from action box → chat should feel seamless (same container morphs)

**Sidebar Chat:**
- Chat must work in 280px width — bubbles should be compact, text small but readable
- Limit to 3-4 visible messages before scrolling
- Send button should be clearly tappable on mobile

**Introduction Box:**
- "Add My Vehicle" should look like a prominent action card, not just a select dropdown
- Consider a car icon + "Add My Vehicle" label + plus icon
- After vehicle is selected, show it as a compact "chip" with vehicle info

## 7. Technical Considerations

**CSS Animations (No Tailwind):**
- Aurora: Use CSS custom properties for gradient colors so they can be adjusted per-page
- Shimmer: `container-type: size` and `cqw` units are used for responsive shimmer — verify browser support (works in all modern browsers)
- All animations should respect `prefers-reduced-motion` media query (disable or reduce animation)
- Use `will-change: transform` sparingly — only on actively animated elements

**AI Integration:**
- The `/api/ai/extract-filters` endpoint reuses the existing Anthropic client from `aiService.js`
- System prompt for filter extraction should be specific about the JSON schema to return
- Consider caching: if user sends "Honda" then "Honda Civic", the second call should return full context
- The sidebar chat for "Post a Want Listing" reuses the existing chat endpoint — no new backend work needed for that flow

**State Management:**
- SmartActionBox state (which mode is active) lives in FilterSidebar or is lifted to HomePage
- Filter auto-population from AI needs to call the same `update` function FilterSidebar uses for manual filter changes
- The sidebar chat for posting listings needs access to the auth context (for redirect if not logged in) and the API service (for submitting listings)

**Performance:**
- Aurora CSS animation should use `transform` and `opacity` only for GPU compositing
- Shimmer uses `container-type: size` — ensure no layout thrashing
- SidebarChat: debounce input if implementing typing indicators (not in scope, but good practice)

**Backend Dependencies:**
- `car-info` package needs to be installed in `/backend/` (currently only in frontend) for make validation in the filter extraction endpoint
- Alternatively, validate against a hardcoded list or skip validation and let the frontend handle unknown makes

## 8. Success Metrics

- **All 189+ existing E2E tests pass** after Phase 4 implementation
- **New E2E tests pass** (estimated 15-20 new tests across 3 spec files)
- **Filter sidebar has no independent scrollbar** on desktop viewport
- **Smart Action Box dropdown works** with smooth animation
- **"Find a Buyer" flow works end-to-end**: describe vehicle → filters populate → listings update
- **"Post a Want Listing" flow works end-to-end**: describe want → preview shows → listing posts
- **Aurora background visible** on detail pages without affecting readability
- **Shimmer animation plays** on Send Introduction button
- **Introduction card redesign** matches the three-part layout spec

## 9. Open Questions

1. **Sidebar chat persistence**: Should the "Find a Buyer" chat state persist when navigating away from homepage and back? (Current assumption: no, reset on navigate)
2. **Mobile Smart Action Box**: On mobile, the Smart Action Box is inside the slide-up filter sheet. Should the chat also appear there, or should mobile users be redirected to a full-page chat?
3. **Rate limiting on AI endpoints**: Should `/api/ai/extract-filters` have rate limiting to prevent abuse? (Current assumption: no, relies on auth requirement)
4. **"Find a Buyer" for unauthenticated users**: Should the "Find a Buyer" option require login, or should it work for anonymous users too? (Current assumption: require login since it uses AI credits)
5. **Keyboard accessibility**: Should the Smart Action Box dropdown be navigable via arrow keys? (Current assumption: yes, standard dropdown keyboard behavior)
