# PRD: GitchaCars Bug Fix & Resilience — Phase 5

## 1. Introduction/Overview

GitchaCars has two critical bugs affecting core functionality:

1. **AI Chat is completely broken** — The Anthropic API returns a "credit balance too low" error, but the app has no graceful degradation. Users see cryptic errors or silent failures across all AI features (listing creation chat, sidebar "Find a Buyer" chat, sidebar "Post a Want Listing" chat). The backend throws raw SDK errors, and the frontend doesn't extract or display meaningful error messages.

2. **Want Listings Feed has filter and resilience issues** — The vehicle type filter checkboxes do nothing (state is never sent to the API), stale keyword references remain from Phase 4 removal, and there's no error boundary or retry mechanism when the feed fails to load.

This PRD addresses both bugs plus adds graceful AI degradation so the app remains fully usable when AI services are unavailable.

## 2. Goals

- Fix all AI error handling so users see clear, actionable messages instead of silent failures or raw JSON
- Add graceful degradation so the app remains usable when the Anthropic API is unavailable (credits, key, network)
- Fix the vehicle type filter end-to-end (frontend → API → database query)
- Clean up stale keyword filter references from Phase 4
- Add error boundary and retry UI for feed loading failures
- Add database connection retry logic for Neon cold starts
- Maintain all 215 existing E2E tests passing
- Add new E2E tests covering all bug fixes

## 3. User Stories

### US-001: Parse Anthropic SDK Errors in Backend AI Service
**Description:** As a developer, I want the AI service to parse Anthropic SDK errors into clean, typed error objects so that controllers can return appropriate HTTP status codes and user-friendly messages.

**Acceptance Criteria:**
- [ ] In `backend/src/services/aiService.js`, wrap each AI function's catch block to parse Anthropic SDK errors
- [ ] Extract the human-readable `message` from the Anthropic error response (which comes as `err.status` + `err.error.message` or `err.message` containing embedded JSON)
- [ ] Create a custom `AIServiceError` class with properties: `message` (clean string), `statusCode` (HTTP status), `type` (one of: `billing`, `rate_limit`, `auth`, `unavailable`, `unknown`)
- [ ] Map Anthropic error types: `invalid_request_error` with "credit balance" → `billing` (402), `rate_limit_error` → `rate_limit` (429), `authentication_error` → `auth` (401), all others → `unavailable` (503)
- [ ] Throw `AIServiceError` instead of raw SDK errors
- [ ] `chatForListing`, `extractListingFromChat`, and `extractFiltersFromVehicle` all use the new error parsing
- [ ] Existing successful AI calls still work identically (no change to success path)

---

### US-002: AI Controller Returns Proper Status Codes and Messages
**Description:** As a frontend developer, I want the AI API endpoints to return proper HTTP status codes and clean error messages so that the frontend can display appropriate feedback.

**Acceptance Criteria:**
- [ ] In `backend/src/controllers/aiController.js`, catch `AIServiceError` specifically in each handler (`chat`, `extract`, `extractFilters`)
- [ ] Return the `AIServiceError.statusCode` as the HTTP status (402, 429, 401, or 503)
- [ ] Return `{ error: { message: <user-friendly string>, type: <error type> } }` in the response body
- [ ] User-friendly messages: billing → "AI features are temporarily unavailable. Please try again later.", rate_limit → "Too many requests. Please wait a moment.", auth → "AI service is not configured.", unavailable → "AI service is temporarily unavailable."
- [ ] Non-AI errors (validation, rate limit from in-app limiter) still work as before
- [ ] Unknown errors still fall through to `next(err)` for the global error handler

---

### US-003: Fix Global Error Handler for SDK Error Objects
**Description:** As a developer, I want the global error handler to correctly extract status codes from all error types so that no error returns a misleading status.

**Acceptance Criteria:**
- [ ] In `backend/src/middleware/errorHandler.js`, check `err.statusCode || err.status || 500` (Anthropic SDK uses `.status`, Express uses `.statusCode`)
- [ ] This is a one-line change: `const statusCode = err.statusCode || err.status || 500;`
- [ ] Existing error responses are unchanged for non-SDK errors

---

### US-004: Add AI Status Health Check Endpoint
**Description:** As a frontend developer, I want a lightweight endpoint to check if AI features are available so that the UI can proactively show appropriate states.

**Acceptance Criteria:**
- [ ] Add `GET /api/ai/status` route in `backend/src/routes/ai.js` (NO auth required — public endpoint)
- [ ] Controller function checks: (a) `ANTHROPIC_API_KEY` environment variable is set and non-empty, (b) returns `{ available: true }` or `{ available: false, reason: "not_configured" }`
- [ ] Does NOT make an actual API call to Anthropic (lightweight check only)
- [ ] Add `apiService.ai.status()` method in frontend `apiService.js`
- [ ] Response format: `{ data: { available: boolean, reason?: string } }`

---

### US-005: Frontend AIChatBox Graceful Error Handling
**Description:** As a buyer creating a listing, I want to see clear error messages when AI chat fails so that I know what's wrong and can switch to the manual form.

**Acceptance Criteria:**
- [ ] In `frontend/src/components/AIChatBox.jsx`, update the catch block (line 54) to extract the error message from `err.response?.data?.error?.message`
- [ ] Display the extracted error message (or a sensible default) in the error chat bubble instead of the generic "Our AI assistant is temporarily unavailable"
- [ ] For billing/auth errors (402, 401), show: "AI features are currently unavailable. Please use the manual form to create your listing." with the existing "Switch to Manual Form" button
- [ ] For rate limit errors (429), show: "Too many requests. Please wait a moment and try again."
- [ ] For network errors (no response), show: "Unable to connect. Check your connection and try again."
- [ ] The "Switch to Manual Form" button remains visible on all error types
- [ ] **Verify in browser:** Error bubble shows specific message, not generic text

---

### US-006: Frontend SidebarChat Fix Error Message Path
**Description:** As a user using the sidebar chat, I want to see actual error messages when AI fails so that I understand what happened.

**Acceptance Criteria:**
- [ ] In `frontend/src/components/SidebarChat.jsx` line 65, change `err.response?.data?.message` to `err.response?.data?.error?.message`
- [ ] For billing/unavailable errors, the chat shows: "AI features are currently unavailable. Try again later."
- [ ] For rate limit errors, show: "Too many requests. Please wait a moment."
- [ ] The chat input remains visible so users can see the error context
- [ ] **Verify in browser:** SidebarChat shows meaningful error messages

---

### US-007: CreateListingPage Auto-Switch to Manual on AI Failure
**Description:** As a buyer, I want the create listing page to automatically offer manual mode when AI is unavailable so that I can still create listings.

**Acceptance Criteria:**
- [ ] In `frontend/src/pages/CreateListingPage.jsx`, on component mount, call `apiService.ai.status()`
- [ ] If AI is unavailable (`available: false`), auto-switch to manual mode and show an info banner: "AI assistant is currently unavailable. You can create your listing using the form below."
- [ ] The info banner is a simple div with class `ai-unavailable-banner` styled with `var(--color-warning-bg)` background and `var(--color-warning)` text (or closest existing CSS variables)
- [ ] Users can still manually switch to AI mode (toggle remains), but they'll see the error immediately if they try
- [ ] If the status check itself fails (network error), default to showing AI mode (optimistic) — errors will be caught when they actually send a message
- [ ] **Verify in browser:** When AI is down, page loads in manual mode with info banner

---

### US-008: Smart Action Box Disabled State When AI Unavailable
**Description:** As a user on the homepage, I want the Smart Action Box to indicate when AI features are unavailable so I don't try to use a broken feature.

**Acceptance Criteria:**
- [ ] In `frontend/src/components/SmartActionBox.jsx`, accept a new prop `aiAvailable` (boolean, defaults to `true`)
- [ ] In `frontend/src/components/FilterSidebar.jsx`, call `apiService.ai.status()` on mount and pass the result to SmartActionBox
- [ ] When `aiAvailable` is `false`, the dropdown options show a subtle "(unavailable)" suffix and clicking them shows an inline message: "AI features are currently unavailable" instead of opening the chat
- [ ] The prompt button still renders normally (not hidden) but options are visually dimmed with `opacity: 0.6`
- [ ] Add CSS class `.smart-action-option--disabled` in `SmartActionBox.css` with `opacity: 0.6; cursor: not-allowed`
- [ ] When AI becomes available again (page refresh), the disabled state goes away
- [ ] **Verify in browser:** Options show "(unavailable)" text and don't open chat when AI is down

---

### US-009: Add vehicleType Filter to Backend API
**Description:** As a buyer browsing the feed, I want the vehicle type checkboxes to actually filter results so that I only see listings matching my selected types.

**Acceptance Criteria:**
- [ ] In `backend/src/models/wantListingModel.js` `listActive()`, add a `vehicleTypes` parameter (array of strings)
- [ ] When `vehicleTypes` is a non-empty array, add SQL condition: `wl.vehicle_type = ANY($N)` where `$N` is the array parameter
- [ ] In `backend/src/controllers/wantListingController.js` `listListings()`, extract `vehicleTypes` from `req.query` — accept comma-separated string and split into array (e.g., `?vehicleTypes=Sedan,SUV`)
- [ ] Pass `vehicleTypes` array to `listActive()`
- [ ] Existing queries without vehicleTypes param are unchanged

---

### US-010: Send vehicleTypes Filter from Frontend
**Description:** As a buyer, I want the vehicle type checkboxes in the filter sidebar to actually filter the listing feed.

**Acceptance Criteria:**
- [ ] In `frontend/src/pages/HomePage.jsx` `fetchListings()`, add after the drivetrain check: `if (currentFilters.vehicleTypes && currentFilters.vehicleTypes.length > 0) params.vehicleTypes = currentFilters.vehicleTypes.join(',')`
- [ ] Checking/unchecking vehicle type checkboxes in the sidebar now causes the feed to refresh with filtered results
- [ ] Selecting "SUV" shows only SUV listings; selecting "SUV" and "Truck" shows both
- [ ] Clearing all vehicle types shows all listings
- [ ] **Verify in browser:** Checking "SUV" checkbox filters feed to show only SUV-type listings

---

### US-011: Clean Up Stale Keyword Filter References
**Description:** As a developer, I want dead keyword filter code removed so the codebase is clean and doesn't confuse future work.

**Acceptance Criteria:**
- [ ] In `frontend/src/pages/HomePage.jsx`, remove `keyword: ''` from `INITIAL_FILTERS` (line 14)
- [ ] Remove `if (currentFilters.keyword) params.keyword = currentFilters.keyword` (line 43)
- [ ] No other files reference `filters.keyword` in the frontend (verify with grep)
- [ ] All 215+ existing E2E tests still pass

---

### US-012: Add React Error Boundary for Feed
**Description:** As a user, I want the app to show a helpful error message instead of a white screen when the feed crashes.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/ErrorBoundary.jsx` — a class component implementing `componentDidCatch` and `getDerivedStateFromError`
- [ ] Create `frontend/src/components/ErrorBoundary.css` with styles for the error UI
- [ ] Error state renders a card with: heading "Something went wrong", message "There was a problem loading this section.", and a "Try Again" button that calls `window.location.reload()`
- [ ] Wrap the listing feed in `HomePage.jsx` with `<ErrorBoundary>` (around the `.home-listing-feed` div)
- [ ] Also wrap the main content of `WantListingDetailPage.jsx` with `<ErrorBoundary>`
- [ ] Normal rendering is completely unaffected (error boundary is transparent when no error)
- [ ] **Verify in browser:** Page renders normally; error boundary is invisible during normal operation

---

### US-013: Feed Error State with Retry Button
**Description:** As a user, I want to see a clear error message with a retry option when the listing feed fails to load.

**Acceptance Criteria:**
- [ ] In `frontend/src/pages/HomePage.jsx`, add an `error` state (boolean, default `false`)
- [ ] In the `fetchListings` catch block, set `setError(true)` and `setLoading(false)`
- [ ] When `error` is true and `listings.length === 0`, render an error card: icon (warning SVG), heading "Failed to load listings", message "There was a problem connecting to the server.", and a "Retry" button that calls `fetchListings(1, filters, sort)` and resets `setError(false)`
- [ ] Add CSS class `.home-error` in `HomePage.css` styled similarly to `.home-empty`
- [ ] After a successful fetch, `error` is reset to `false`
- [ ] **Verify in browser:** Temporarily breaking the API URL shows the error card; clicking Retry recovers

---

### US-014: Database Connection Retry for Neon Cold Starts
**Description:** As a developer, I want database queries to retry on connection timeout so that Neon Postgres cold starts don't break the app.

**Acceptance Criteria:**
- [ ] In `backend/src/db/pool.js`, wrap the pool query method (or create a query wrapper) that retries on connection errors
- [ ] Retry up to 2 times with 1-second delay between retries
- [ ] Only retry on connection-related errors (error codes: `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`, `57P01`, `08006`, `08001`)
- [ ] Non-connection errors (syntax errors, constraint violations) are NOT retried
- [ ] Log retry attempts with `console.warn('[DB] Retrying query after connection error...')`
- [ ] Normal queries that succeed on first attempt have zero overhead (just a try/catch wrapper)

---

### US-015: E2E Tests — AI Error Handling & Graceful Degradation
**Description:** As a developer, I want E2E tests verifying that AI errors are handled gracefully.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase5-ai-errors.spec.js`
- [ ] Test: AI status endpoint returns a response (GET /api/ai/status returns 200 with `available` boolean)
- [ ] Test: AIChatBox shows "Switch to Manual Form" button when AI error occurs (mock via intercepting the request and returning 503)
- [ ] Test: SidebarChat shows error message (not empty) when chat fails
- [ ] Test: CreateListingPage has both AI and manual mode toggle
- [ ] Test: Smart Action Box renders with "What would you like to do?" prompt
- [ ] All existing 215 tests continue to pass

---

### US-016: E2E Tests — Feed Filters & Error States
**Description:** As a developer, I want E2E tests verifying feed filters and error handling work correctly.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ux-phase5-feed.spec.js`
- [ ] Test: Vehicle type checkbox changes feed results (select SUV, verify cards update)
- [ ] Test: Multiple vehicle types can be selected simultaneously
- [ ] Test: Clear All resets vehicle type checkboxes
- [ ] Test: ErrorBoundary component exists on the page (`.error-boundary` wrapper or verify normal rendering works)
- [ ] Test: Feed shows listings when API is healthy (existing smoke test)
- [ ] Test: No keyword search input exists (confirms Phase 4 cleanup)
- [ ] All existing 215 tests continue to pass

---

## 4. Functional Requirements

- **FR-1:** The backend AI service must parse Anthropic SDK errors into structured `AIServiceError` objects with `message`, `statusCode`, and `type` fields
- **FR-2:** AI API endpoints (`/api/ai/chat`, `/api/ai/extract`, `/api/ai/extract-filters`) must return HTTP 402 for billing errors, 429 for rate limits, 401 for auth errors, and 503 for other AI failures
- **FR-3:** AI error responses must follow the format `{ error: { message: string, type: string } }`
- **FR-4:** `GET /api/ai/status` must return `{ data: { available: boolean, reason?: string } }` without requiring authentication
- **FR-5:** The global error handler must check `err.statusCode || err.status || 500` to handle both Express and SDK error formats
- **FR-6:** Frontend AI components must extract error messages from `err.response.data.error.message` (not `err.response.data.message`)
- **FR-7:** When AI is unavailable, CreateListingPage must default to manual form mode with an info banner
- **FR-8:** Smart Action Box options must show "(unavailable)" and prevent chat opening when AI status is `false`
- **FR-9:** `GET /api/want-listings` must accept `vehicleTypes` query parameter (comma-separated) and filter by `vehicle_type` column
- **FR-10:** Frontend must send `vehicleTypes` filter to the API when vehicle type checkboxes are checked
- **FR-11:** Dead `keyword` filter code must be removed from `HomePage.jsx`
- **FR-12:** An `ErrorBoundary` component must wrap the listing feed to prevent full-page crashes
- **FR-13:** The feed must show an error card with "Retry" button when the API call fails
- **FR-14:** Database queries must retry up to 2 times on connection-related errors

## 5. Non-Goals (Out of Scope)

- **Not** implementing automatic Anthropic API key rotation or billing management
- **Not** adding a different AI provider as fallback (e.g., OpenAI)
- **Not** adding full-text search to replace the removed keyword filter
- **Not** implementing WebSocket-based real-time AI status monitoring
- **Not** changing the response wrapper format in `utils/response.js` (the existing `{ data }` single-wrap works correctly with the frontend's `res.data.data` pattern via axios)
- **Not** adding Tailwind CSS, TypeScript, or antd

## 6. Design Considerations

- Error states should use existing CSS variables and match the current design system
- Error cards should look like `.home-empty` (existing empty state) but with warning icon and retry button
- AI unavailable banners should be subtle info bars (not blocking modals)
- Disabled Smart Action options use `opacity: 0.6` to indicate unavailability without hiding them
- ErrorBoundary should be visually consistent with existing card components

## 7. Technical Considerations

- **Anthropic SDK Error Format:** The `@anthropic-ai/sdk` package throws errors with `err.status` (number) and `err.error` (object with `type` and `message`). Sometimes `err.message` contains the full JSON response as a string — need to handle both formats.
- **Neon Cold Starts:** Neon serverless Postgres can take 1-3 seconds to wake up on cold start. The retry logic should handle this transparently.
- **CSS Variables:** Use existing `variables.css` system. Likely variables: `--color-danger` for errors, `--color-warning` for info banners, `--color-text-secondary` for dimmed text.
- **Error Boundary Limitation:** React error boundaries only catch errors during rendering, not in event handlers or async code. The feed error state (US-013) handles async fetch errors separately.
- **vehicleTypes SQL:** Use Postgres `= ANY($1::text[])` syntax for array parameter matching. The `vehicle_type` column stores lowercase strings like 'sedan', 'suv', 'truck'. FilterSidebar sends capitalized values ('Sedan', 'SUV') — need case-insensitive matching with `LOWER(wl.vehicle_type) = ANY($N)` or normalize in the controller.

## 8. Success Metrics

- All AI error scenarios show user-friendly messages (no raw JSON, no silent failures)
- AI unavailability does not prevent users from creating listings (manual mode works)
- Vehicle type filter actually filters the feed (previously non-functional)
- Zero white-screen crashes on feed errors
- Neon cold starts don't cause visible errors to users
- All existing 215 E2E tests pass + new tests for Phase 5 changes
- Total E2E test count: ~230+

## 9. Open Questions

- Should the AI status check be cached on the frontend (e.g., check once per session, not on every page load)?
- Should the vehicleType filter match be exact (case-sensitive) or case-insensitive? (Recommendation: case-insensitive via `LOWER()` in SQL)
- Should the retry button in the feed error state have a cooldown to prevent rapid re-requests?
