# PRD: GitchaCars E2E Testing & Polish

## 1. Introduction/Overview

After the UI framework redesign (PRD 1), this PRD covers comprehensive end-to-end testing using Playwright to verify every page, user flow, and interaction works correctly. It also covers final visual polish — transitions, animations, hover states, empty states, and edge cases. This ensures the redesigned app is production-ready and regression-free.

**Prerequisite**: All user stories from `prd-gitchacars-ui-framework.md` must be complete before starting this PRD.

## 2. Goals

- Achieve comprehensive Playwright E2E test coverage for every page and user flow
- Verify all new features (favorites, filters, sort, feature tags, share) work end-to-end
- Test role-based access (buyer, seller, admin) thoroughly
- Polish animations, transitions, and micro-interactions
- Handle all edge cases and error states gracefully
- Ensure responsive design works on mobile viewports

## 3. User Stories

---

### US-E01: Playwright Test Infrastructure Setup

**Description:** As a developer, I want a Playwright test setup configured for the GitchaCars app so that I can write and run E2E tests.

**Acceptance Criteria:**
- [ ] Install Playwright as a dev dependency in the frontend: `npm install -D @playwright/test`
- [ ] Create `playwright.config.js` with:
  - Base URL: `http://localhost:3001`
  - Browser: Chromium only (for speed)
  - Screenshot on failure
  - Timeout: 30 seconds per test
  - Test directory: `e2e/`
- [ ] Create `e2e/helpers.js` with shared utilities:
  - `login(page, email, password)` — fills login form, submits, waits for redirect
  - `loginAsBuyer(page)` — logs in as buyer1@example.com
  - `loginAsSeller(page)` — logs in as seller1@example.com
  - `loginAsAdmin(page)` — logs in as jhokinson@gmail.com
  - `logout(page)` — clicks logout
  - `waitForApi(page)` — waits for network idle
- [ ] Create a test seed script or document the required test data state
- [ ] Verify: `npx playwright test --reporter=list` runs and at least one placeholder test passes

---

### US-E02: Authentication Flow Tests

**Description:** As a developer, I want E2E tests covering login, registration, and logout flows.

**Acceptance Criteria:**
- [ ] Create `e2e/auth.spec.js` with tests:
  - **Login — success**: Navigate to /login, enter buyer1@example.com / password123, submit, verify redirect to /buyer/dashboard
  - **Login — wrong password**: Enter wrong password, verify error message appears
  - **Login — empty fields**: Submit empty form, verify validation
  - **Register — success**: Navigate to /register, fill all fields with new unique email, select buyer role, submit, verify redirect to dashboard
  - **Register — duplicate email**: Try registering with existing email, verify error
  - **Register — password mismatch**: Enter different passwords, verify validation
  - **Logout**: Log in, click logout (or avatar dropdown > logout), verify redirect to /login
  - **Protected route redirect**: Navigate to /buyer/dashboard while logged out, verify redirect to /login
  - **Role guard**: Log in as buyer, navigate to /seller/dashboard, verify redirect to /
- [ ] All tests pass

---

### US-E03: Homepage & Feed Tests

**Description:** As a developer, I want E2E tests covering the homepage listing feed, filters, sort, and pagination.

**Acceptance Criteria:**
- [ ] Create `e2e/homepage.spec.js` with tests:
  - **Page loads**: Navigate to /, verify "What Buyers Are Looking For" heading or equivalent
  - **Listings render**: Verify at least 1 listing card is visible with title, price, location
  - **Listing card click**: Click a listing card, verify navigation to /want-listings/:id
  - **Sort dropdown**: Change sort to "Oldest", verify listings reorder
  - **Filter by make**: Enter "Toyota" in make filter, verify only Toyota listings shown (or empty state)
  - **Filter by price range**: Set min $20,000, verify listings update
  - **Clear filters**: Click "Clear All", verify all listings return
  - **Pagination / Load More**: If more than 10 listings, verify load more works
  - **Empty state**: Apply filters that match nothing, verify empty state message
  - **Unauthenticated view**: Verify nav shows Login/Register (no dashboard links)
  - **Authenticated view**: Log in, verify nav shows dashboard link and CTA button
- [ ] All tests pass

---

### US-E04: Sidebar Filter Tests

**Description:** As a developer, I want E2E tests verifying each sidebar filter control works correctly.

**Acceptance Criteria:**
- [ ] Create `e2e/filters.spec.js` with tests:
  - **Keyword search**: Type "Tesla" in keyword input, verify filtered results
  - **Price range slider**: Set price range via inputs (not slider drag — hard to test), verify results
  - **Year range filter**: Select year min 2020, verify results
  - **Mileage filter**: Select max 100k miles, verify results
  - **Transmission filter**: Select "Automatic", verify results
  - **Drivetrain filter**: Select "AWD/4WD", verify results
  - **Multiple filters combined**: Apply make + year + price filters simultaneously, verify compound filtering
  - **Clear all resets**: Apply multiple filters, click Clear All, verify all controls reset and full results return
  - **Filter persistence**: Apply filter, click a listing, go back, verify filter is still applied
- [ ] All tests pass

---

### US-E05: Favorites Flow Tests

**Description:** As a developer, I want E2E tests verifying the favorites (heart) feature works end-to-end.

**Acceptance Criteria:**
- [ ] Create `e2e/favorites.spec.js` with tests:
  - **Favorite a listing**: Log in as buyer, click heart on a listing, verify it fills red
  - **Unfavorite a listing**: Click the filled heart, verify it returns to outline
  - **Favorites persist on reload**: Favorite a listing, reload page, verify heart is still filled
  - **Unauthenticated — no hearts**: Visit homepage without login, verify no heart buttons visible
  - **Favorite from detail page**: Navigate to listing detail, click favorite button, verify state
- [ ] All tests pass

---

### US-E06: Buyer Dashboard Tests

**Description:** As a developer, I want E2E tests covering the buyer dashboard with listings and introductions.

**Acceptance Criteria:**
- [ ] Create `e2e/buyer-dashboard.spec.js` with tests:
  - **Page loads**: Log in as buyer, navigate to /buyer/dashboard, verify page renders
  - **My listings display**: Verify at least one want listing is shown with title and status
  - **Create listing link**: Click "Create New Listing", verify navigation to /buyer/create-listing
  - **Edit listing**: Click edit on a listing, verify navigation to edit page
  - **Introductions section**: Verify introductions section is visible
  - **Filter introductions**: Click "Pending" tab, verify only pending intros shown
  - **Accept introduction**: If pending intro exists, click Accept, verify status changes to Accepted
  - **Reject introduction**: If pending intro exists, click Reject, verify status changes to Rejected
- [ ] All tests pass

---

### US-E07: Seller Dashboard Tests

**Description:** As a developer, I want E2E tests covering the seller dashboard with vehicles and introductions.

**Acceptance Criteria:**
- [ ] Create `e2e/seller-dashboard.spec.js` with tests:
  - **Page loads**: Log in as seller, navigate to /seller/dashboard, verify page renders
  - **My vehicles display**: Verify at least one vehicle is shown with year/make/model/price
  - **Add vehicle link**: Click "Add Vehicle", verify navigation to /seller/add-vehicle
  - **Edit vehicle**: Click edit on a vehicle, verify navigation to edit page
  - **View matches**: Click "View Matches" on a vehicle, verify navigation to matches page
  - **Sent introductions**: Verify sent introductions section with status badges
- [ ] All tests pass

---

### US-E08: Want Listing CRUD Tests

**Description:** As a developer, I want E2E tests covering the full create-read-update-archive lifecycle of want listings.

**Acceptance Criteria:**
- [ ] Create `e2e/want-listings.spec.js` with tests:
  - **Create listing**: Log in as buyer, navigate to create listing form, fill all fields (title, make, model, year range, budget range, zip code, radius, features), submit, verify redirect to dashboard and new listing appears
  - **View listing detail**: Click on listing, verify all data renders correctly on detail page
  - **Edit listing**: Click edit, change the title, submit, verify title updated
  - **Archive listing**: On detail page, click Archive, verify status changes to "archived"
  - **Feature tags in form**: During create, select 3 feature tags, verify they appear on the created listing
  - **Validation**: Try submitting create form with empty required fields, verify error messages
- [ ] All tests pass

---

### US-E09: Vehicle CRUD Tests

**Description:** As a developer, I want E2E tests covering the full create-read-update lifecycle of vehicles.

**Acceptance Criteria:**
- [ ] Create `e2e/vehicles.spec.js` with tests:
  - **Create vehicle**: Log in as seller, navigate to add vehicle form, fill all fields (make, model, year, mileage, price, zip, transmission, drivetrain, description), submit (skip image upload in test unless Firebase is configured), verify redirect to dashboard
  - **Edit vehicle**: Click edit on a vehicle, change the price, submit, verify price updated
  - **Validation**: Try submitting with empty required fields, verify error messages
- [ ] All tests pass

---

### US-E10: Introduction & Matching Flow Tests

**Description:** As a developer, I want E2E tests covering the full introduction flow from matching to messaging.

**Acceptance Criteria:**
- [ ] Create `e2e/introductions.spec.js` with tests:
  - **View matches**: Log in as seller, navigate to a vehicle's matches page, verify matching want listings appear
  - **Send introduction**: Click "Introduce Vehicle" on a match, type a message, submit, verify success feedback and "Already Introduced" state
  - **Buyer receives intro**: Log in as buyer, navigate to introductions, verify the new introduction appears as pending
  - **Accept introduction**: Click Accept, verify status changes to Accepted and Message button appears
  - **Navigate to messages**: Click Message button, verify navigation to chat page
  - **Duplicate prevention**: As seller, try to introduce same vehicle to same listing again, verify prevented
- [ ] All tests pass

---

### US-E11: Navigation & Routing Tests

**Description:** As a developer, I want E2E tests verifying all navigation paths and route guards.

**Acceptance Criteria:**
- [ ] Create `e2e/navigation.spec.js` with tests:
  - **Nav links — unauthenticated**: Verify Home, Login, Register links visible
  - **Nav links — buyer**: Log in as buyer, verify correct nav links (Home, Dashboard, Introductions, Messages)
  - **Nav links — seller**: Log in as seller, verify correct nav links
  - **Nav links — admin**: Log in as admin, verify Admin link visible
  - **CTA button**: Buyer sees "Post Want-Listing", Seller sees "Add Vehicle"
  - **Avatar dropdown**: Click avatar, verify dropdown with Dashboard, Introductions, Messages, Logout
  - **Deep linking**: Navigate directly to /buyer/dashboard, verify page loads after login
  - **404 / unknown route**: Navigate to /nonexistent, verify index.html loads (SPA fallback)
  - **Breadcrumb**: On listing detail, verify breadcrumb navigation works
- [ ] All tests pass

---

### US-E12: Share Functionality Tests

**Description:** As a developer, I want E2E tests verifying the share button works.

**Acceptance Criteria:**
- [ ] Create `e2e/share.spec.js` with tests:
  - **Share from listing card**: Log in, click share icon on a listing, verify clipboard contains correct URL
  - **Share from detail page**: Navigate to listing detail, click share, verify clipboard URL
  - **Toast confirmation**: Verify "Link copied!" toast appears after sharing
- [ ] All tests pass

---

### US-E13: Notification Bell Tests

**Description:** As a developer, I want E2E tests verifying the notification bell dropdown.

**Acceptance Criteria:**
- [ ] Create `e2e/notifications.spec.js` with tests:
  - **Bell renders**: Log in, verify bell icon is visible in nav
  - **Unread count badge**: If unread notifications exist, verify red badge with count
  - **Open dropdown**: Click bell, verify dropdown panel opens with notifications
  - **Mark read**: Click a notification, verify it's marked as read (styling change)
  - **Mark all read**: Click "Mark all as read", verify all notifications styled as read and badge disappears
  - **Close on outside click**: Open dropdown, click outside, verify it closes
- [ ] All tests pass

---

### US-E14: Admin Page Tests

**Description:** As a developer, I want E2E tests verifying the admin interface.

**Acceptance Criteria:**
- [ ] Create `e2e/admin.spec.js` with tests:
  - **Access control**: Log in as buyer, navigate to /admin, verify redirected away
  - **Page loads**: Log in as admin, navigate to /admin, verify tabs render
  - **Users tab**: Verify user table renders with data
  - **Search users**: Type in search, verify results filter
  - **Listings tab**: Click Want Listings tab, verify table renders
  - **Vehicles tab**: Click Vehicles tab, verify table renders
  - **Pagination**: If enough records, verify next page works
- [ ] All tests pass

---

### US-E15: Responsive Design Tests

**Description:** As a developer, I want E2E tests verifying the app works on mobile viewports.

**Acceptance Criteria:**
- [ ] Create `e2e/responsive.spec.js` with tests at viewport 375x667 (iPhone SE):
  - **Homepage**: Sidebar is hidden, filter button visible, listing cards stack vertically
  - **Filter toggle**: Click filter button, verify sidebar panel opens, close it
  - **NavBar**: Hamburger menu or compact nav on mobile
  - **Login page**: Form fits within viewport, no horizontal scroll
  - **Listing detail**: Content stacks vertically, readable on mobile
  - **Dashboard**: Sections stack vertically, cards are full-width
  - **Chat page**: Messages readable, input bar at bottom
- [ ] All tests pass with screenshots captured

---

### US-E16: CSS Transition & Animation Polish

**Description:** As a user, I want smooth transitions and hover effects throughout the app so that interactions feel polished.

**Acceptance Criteria:**
- [ ] Add to `base.css`: `transition: all 0.2s ease` on interactive elements
- [ ] Card hover: subtle lift shadow transition (`transform: translateY(-2px)`)
- [ ] Button hover: darken background smoothly
- [ ] Input focus: border color transition to accent blue with subtle glow
- [ ] Sidebar filter sections: smooth expand/collapse animation (max-height transition)
- [ ] Toast enter: slide-up from bottom, exit: fade-out
- [ ] Dropdown open: subtle fade-in with slight scale
- [ ] Skeleton shimmer: smooth left-to-right gradient animation
- [ ] Page transition: no jarring flashes between routes
- [ ] Badge count: subtle scale pulse when count changes
- [ ] **Verify in browser**: All transitions feel smooth and natural, no jank

---

### US-E17: Error States & Edge Cases

**Description:** As a user, I want clear error handling for all failure scenarios so that I'm never stuck on a broken screen.

**Acceptance Criteria:**
- [ ] **Network error**: If API call fails (server down), show "Something went wrong. Please try again." with retry button
- [ ] **404 listing**: Navigate to /want-listings/nonexistent-id, show "Listing not found" with link back to home
- [ ] **Session expired**: If 401 returned mid-session, redirect to login with message "Your session has expired"
- [ ] **Empty dashboard**: New buyer with no listings sees "You haven't created any want listings yet" + CTA button
- [ ] **Empty seller dashboard**: New seller with no vehicles sees "You haven't added any vehicles yet" + CTA button
- [ ] **No matches**: Vehicle matches page with no results shows "No matching want listings found for this vehicle"
- [ ] **Form server errors**: If server returns validation error, display it inline (not just console)
- [ ] **Image upload failure**: If image upload fails, show error toast and keep form state
- [ ] **Verify in browser**: Navigate each error state and verify message renders correctly

---

### US-E18: Visual Regression Screenshots

**Description:** As a developer, I want Playwright to capture screenshots of every page for visual QA.

**Acceptance Criteria:**
- [ ] Create `e2e/visual.spec.js` that captures screenshots of:
  - Homepage (unauthenticated) — full page
  - Homepage (authenticated as buyer) — full page
  - Login page
  - Register page
  - Want listing detail page
  - Buyer dashboard
  - Seller dashboard
  - Vehicle matches page
  - Introductions page
  - Messages page
  - Chat page
  - Admin page (all 3 tabs)
  - Mobile homepage (375px viewport)
  - Mobile listing detail (375px viewport)
- [ ] All screenshots saved to `e2e/screenshots/` directory
- [ ] Screenshots show the final polished design with real data
- [ ] No broken layouts, missing data, or unstyled elements in any screenshot

---

## 4. Functional Requirements

- FR-1: All E2E tests run against the live local server (http://localhost:3001) with real Neon database
- FR-2: Tests use existing seeded test accounts (buyer1, seller1, admin)
- FR-3: Tests must be idempotent — each test cleans up after itself or uses unique data
- FR-4: Test suite completes in under 5 minutes total
- FR-5: Screenshots captured automatically on test failure for debugging
- FR-6: All CSS transitions use `prefers-reduced-motion` media query for accessibility

## 5. Non-Goals (Out of Scope)

- Visual regression testing with pixel-diff comparison tools (just manual screenshots)
- Performance testing (Lighthouse, load testing)
- Cross-browser testing (Chromium only for MVP)
- Unit tests for individual components
- API integration tests (covered by E2E flows)
- Accessibility testing (WCAG audit)

## 6. Technical Considerations

- **Playwright config**: Single browser (Chromium), serial execution to avoid database race conditions
- **Test data**: Tests depend on seeded data in Neon. Create a test setup script if needed that resets data to known state.
- **Firebase chat**: Chat tests may need to be skipped or mocked if Firebase is not configured. Use a flag to conditionally skip.
- **Image uploads**: Vehicle creation tests should skip image upload if Firebase Storage is not configured. Use text-only vehicle creation.
- **Flaky test prevention**: Use `page.waitForSelector()` and `page.waitForResponse()` instead of fixed timeouts where possible.

## 7. Success Metrics

- All 18 user stories pass acceptance criteria
- 100+ individual test assertions across all spec files
- All visual screenshots show polished, consistent design
- Zero regressions from PRD 1 functionality
- Test suite runs in < 5 minutes
- All transitions and animations feel smooth (60fps)

## 8. Open Questions

- None — all decisions resolved.
