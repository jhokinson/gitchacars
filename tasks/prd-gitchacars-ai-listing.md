# PRD: GitchaCars AI-Assisted Want Listing Creation

## 1. Introduction/Overview

GitchaCars currently requires buyers to manually fill out a 15+ field form to create a want listing. This creates friction — especially for users who aren't sure exactly what specs they want, or who find form-heavy UIs tedious. This PRD introduces three interconnected features:

1. **AI-Assisted Chat Interface** — A conversational AI (powered by Claude API) that guides buyers through want listing creation via natural language. The AI extracts structured data (make, model, year range, budget, mileage, features, etc.) from the conversation and auto-populates the listing fields. Users can toggle to the existing manual form as a fallback.

2. **Persistent "Post Want-Listing" CTA** — The "Post Want-Listing" button is always visible in the NavBar for ALL users, including unauthenticated visitors. Unauthenticated users are redirected to login first, then back to the create listing page.

3. **Vehicle Type Icons** — Each want listing displays an SVG icon representing its vehicle category (sedan, SUV, truck, classic car, exotic, etc.). The AI auto-detects the type from the conversation; the icon appears on listing cards, detail pages, and during creation.

**Tech Stack:** Node.js/Express 4 backend, React 19/Vite 7 frontend, Neon Postgres, Claude API (`@anthropic-ai/sdk`), plain CSS with existing design system.

---

## 2. Goals

- Reduce want listing creation time by 50%+ compared to the manual form
- Make listing creation accessible to users who don't know exact car specifications
- Increase listing creation conversion by removing friction (persistent CTA, guided flow)
- Add visual differentiation to listings through vehicle type iconography
- Maintain the existing UI design language (CSS variables, Inter font, navy/blue palette)
- Ensure all new features have comprehensive E2E test coverage via Playwright

---

## 3. User Stories

---

### US-AL01: Database Schema — Add vehicle_type Column

**Description:** As a developer, I need a `vehicle_type` column on the `want_listings` table so that listings can store their vehicle category for icon display.

**Acceptance Criteria:**
- [ ] Create a migration that adds `vehicle_type VARCHAR(30) DEFAULT NULL` to the `want_listings` table
- [ ] Valid values: `sedan`, `suv`, `truck`, `classic`, `exotic`, `van`, `coupe`, `convertible`, `wagon`, `electric`, `other`
- [ ] Run the migration against the Neon database successfully
- [ ] Existing listings are unaffected (column defaults to `NULL`)
- [ ] Update `wantListingModel.js` — add `vehicle_type` to the `create()` INSERT columns and the `update()` columnMap
- [ ] Update `wantListingController.js` — include `vehicleType` in the `formatListing()` response and accept it in `createListing()` and `updateListing()` request body
- [ ] Update the want listings API routes to accept `vehicleType` — no validation error if omitted (it's optional)
- [ ] Verify with curl: `POST /api/want-listings` with `vehicleType: "suv"` stores and returns the value correctly
- [ ] Verify with curl: `GET /api/want-listings/:id` returns `vehicleType` in the response

---

### US-AL02: Backend — Claude AI Chat Endpoint

**Description:** As a developer, I need a backend API endpoint that proxies chat messages to the Claude API and returns structured want listing data extracted from the conversation.

**Acceptance Criteria:**
- [ ] Install `@anthropic-ai/sdk` in the backend: `npm install @anthropic-ai/sdk`
- [ ] Add `ANTHROPIC_API_KEY` to `backend/.env` (use the project's Anthropic API key)
- [ ] Create `backend/src/services/aiService.js` that:
  - Initializes the Anthropic client with the API key from env
  - Exports a `chatForListing(messages)` function that sends the conversation to Claude
  - Uses a system prompt that instructs Claude to act as a car-buying assistant, ask clarifying questions about what the user wants (make, model, year range, budget, mileage, location, features, transmission, drivetrain, condition), and when enough info is gathered, return a JSON object with the extracted listing fields
  - The system prompt should instruct Claude to also infer `vehicleType` from the make/model/description (e.g., "Honda CR-V" → `suv`, "Ford F-150" → `truck`, "1967 Mustang" → `classic`, "Lamborghini Huracan" → `exotic`)
  - Uses `claude-sonnet-4-5-20250929` model for cost efficiency
  - Max tokens: 1024
  - Returns the raw assistant message text to the frontend
- [ ] Create `backend/src/routes/ai.js` with:
  - `POST /api/ai/chat` — accepts `{ messages: [{ role, content }] }`, requires authentication, calls `chatForListing()`, returns `{ data: { reply: string } }`
  - Rate limiting: maximum 30 requests per user per minute (simple in-memory counter, not production-grade)
- [ ] Create `backend/src/controllers/aiController.js` with the route handler
- [ ] Register the route in `backend/src/app.js`: `app.use('/api/ai', aiRoutes)`
- [ ] Verify with curl: authenticated POST to `/api/ai/chat` with `{ messages: [{ role: "user", content: "I'm looking for an SUV" }] }` returns a helpful assistant reply
- [ ] Verify: unauthenticated request returns 401

---

### US-AL03: Backend — AI Listing Extraction Endpoint

**Description:** As a developer, I need an endpoint that takes a completed AI conversation and extracts structured listing data from it, so the frontend can auto-populate the form.

**Acceptance Criteria:**
- [ ] Add a `extractListingFromChat(messages)` function to `aiService.js` that:
  - Sends the full conversation to Claude with a system prompt instructing it to extract structured data
  - The extraction prompt asks Claude to return a JSON object with these fields (all optional): `title`, `make`, `model`, `yearMin`, `yearMax`, `budgetMin`, `budgetMax`, `zipCode`, `radius`, `mileageMax`, `description`, `transmission`, `drivetrain`, `condition`, `features` (array), `vehicleType`
  - Claude should generate a sensible `title` if none was explicitly stated (e.g., "Looking for a 2020-2024 Honda CR-V")
  - Claude should generate a `description` summarizing what the user wants if they didn't provide one explicitly
  - Returns the parsed JSON object (with fallback to empty object if parsing fails)
- [ ] Add `POST /api/ai/extract` route — accepts `{ messages: [{ role, content }] }`, requires authentication, calls `extractListingFromChat()`, returns `{ data: { listing: { ... } } }`
- [ ] Verify with curl: send a multi-turn conversation and confirm the response contains properly structured listing data
- [ ] Verify: the extracted `vehicleType` is one of the valid enum values

---

### US-AL04: Frontend — API Service Update for AI Endpoints

**Description:** As a developer, I need the frontend API service to include methods for the new AI chat endpoints so that components can call them.

**Acceptance Criteria:**
- [ ] Add to `apiService.js`:
  ```js
  ai: {
    chat: (messages) => api.post('/ai/chat', { messages }),
    extract: (messages) => api.post('/ai/extract', { messages }),
  }
  ```
- [ ] Both methods use the existing axios instance with JWT auth interceptor
- [ ] Verify: importing and calling `apiService.ai.chat` compiles without error

---

### US-AL05: Frontend — Vehicle Type SVG Icon Component

**Description:** As a user, I want to see a recognizable icon representing each vehicle category so I can quickly visually identify the type of car a buyer is looking for.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/VehicleTypeIcon.jsx` that accepts a `type` prop (string) and an optional `size` prop (default 48)
- [ ] Render an inline SVG for each vehicle type. Each icon must be a simple, clean, single-color line drawing that works at 24px–64px. Supported types and their visual representations:
  - `sedan` — side-profile sedan silhouette
  - `suv` — taller SUV/crossover silhouette
  - `truck` — pickup truck silhouette with bed
  - `classic` — vintage/classic car silhouette (rounded fenders)
  - `exotic` — low-slung sports car silhouette
  - `van` — minivan/van silhouette
  - `coupe` — 2-door coupe silhouette
  - `convertible` — open-top car silhouette
  - `wagon` — station wagon/hatchback silhouette
  - `electric` — car silhouette with a lightning bolt accent
  - `other` / `null` / undefined — generic car icon (reuse the existing placeholder SVG from `ListingCard.jsx`)
- [ ] Icons use `currentColor` for stroke so they inherit the parent's text color
- [ ] Create `frontend/src/components/VehicleTypeIcon.css` — no styles needed beyond basic sizing (the SVG should be purely inline)
- [ ] Verify in browser: render a test page showing all 11 icons at size 48 to confirm they look clean and consistent

---

### US-AL06: Frontend — Update ListingCard with Vehicle Type Icon

**Description:** As a user browsing listings, I want to see a vehicle type icon on each listing card instead of the generic car placeholder so I can quickly tell what type of vehicle the buyer wants.

**Acceptance Criteria:**
- [ ] Import `VehicleTypeIcon` into `ListingCard.jsx`
- [ ] Replace the hardcoded car SVG in `.listing-card-image` with `<VehicleTypeIcon type={listing.vehicleType} size={48} />`
- [ ] If `listing.vehicleType` is null/undefined, the component falls back to the generic car icon (same as current behavior)
- [ ] The icon is centered in the navy-colored image area (same styling as current placeholder)
- [ ] Verify in browser: listing cards on the homepage show the correct icon for listings that have a `vehicleType`, and the generic icon for those that don't

---

### US-AL07: Frontend — Update WantListingDetailPage with Vehicle Type Icon

**Description:** As a user viewing a listing detail page, I want to see the vehicle type icon and label so I know the category of vehicle the buyer is looking for.

**Acceptance Criteria:**
- [ ] Import `VehicleTypeIcon` into `WantListingDetailPage.jsx`
- [ ] Display the vehicle type icon (size 32) and capitalized label (e.g., "SUV", "Pickup Truck", "Classic Car") in the detail hero section, near the make/model info
- [ ] If `vehicleType` is null, don't display the icon or label (graceful degradation)
- [ ] Add a display-name mapping: `sedan` → "Sedan", `suv` → "SUV", `truck` → "Pickup Truck", `classic` → "Classic Car", `exotic` → "Exotic / Sports", `van` → "Van / Minivan", `coupe` → "Coupe", `convertible` → "Convertible", `wagon` → "Wagon / Hatchback", `electric` → "Electric", `other` → "Other"
- [ ] Verify in browser: a listing with `vehicleType: "suv"` shows the SUV icon and "SUV" label on the detail page

---

### US-AL08: Frontend — NavBar Persistent CTA for All Users

**Description:** As any visitor (including unauthenticated users), I want to see a "Post Want-Listing" button in the navigation bar so I can easily start creating a listing from any page.

**Acceptance Criteria:**
- [ ] In `NavBar.jsx`, move the "Post Want-Listing" button OUTSIDE the `isAuthenticated` conditional block
- [ ] The button is ALWAYS visible, regardless of auth state or role
- [ ] For authenticated buyers: clicking navigates to `/buyer/create-listing` (existing behavior)
- [ ] For authenticated sellers: clicking still navigates to `/buyer/create-listing` (sellers may also want to understand buyer demand)
- [ ] For unauthenticated users: clicking navigates to `/login?redirect=/buyer/create-listing`
- [ ] The button uses the same styling as the current `.navbar-cta` (rounded pill, primary color, plus icon)
- [ ] On the login page, after successful login, check for a `redirect` query parameter and navigate there instead of the default dashboard
- [ ] Update `LoginPage.jsx` to read `redirect` from `useSearchParams()` and navigate to it on successful login
- [ ] The button text remains "Post Want-Listing" with the plus icon
- [ ] Verify in browser (unauthenticated): clicking "Post Want-Listing" redirects to login, after logging in as buyer, user lands on /buyer/create-listing
- [ ] Verify in browser (authenticated buyer): clicking navigates directly to /buyer/create-listing
- [ ] Verify in browser (authenticated seller): clicking navigates to /buyer/create-listing

---

### US-AL09: Frontend — AI Chat Interface Component

**Description:** As a buyer, I want a conversational chat interface where I can describe what car I'm looking for in plain English, and an AI assistant helps me specify the details and creates my listing.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/AIChatBox.jsx` and `AIChatBox.css`
- [ ] The component renders a chat-style UI with:
  - A message history area showing user messages (right-aligned, blue bubble) and assistant messages (left-aligned, light gray bubble)
  - A text input at the bottom with a send button
  - A typing indicator when waiting for the AI response
  - Auto-scroll to the latest message
- [ ] On mount, the component sends an initial system-primed message to `/api/ai/chat` that triggers the AI to greet the user and ask what kind of car they're looking for
- [ ] Each user message appends to a local `messages` array (with `role: "user"`) and sends the full conversation history to `/api/ai/chat`
- [ ] The AI's reply is appended to the messages array (with `role: "assistant"`) and displayed
- [ ] The AI response is parsed for a special JSON marker: if the AI's reply contains a fenced code block with JSON (```json ... ```), the component extracts it and calls an `onListingData(data)` callback prop with the parsed listing fields
- [ ] The chat input is disabled while the AI is responding (loading state)
- [ ] Error handling: if the API call fails, display an error message in the chat ("Sorry, something went wrong. Please try again.")
- [ ] Styling matches the existing design system:
  - Message bubbles use `var(--color-accent)` for user, `var(--color-bg-secondary)` for assistant
  - User message text is white, assistant message text is `var(--color-text)`
  - Font: `var(--font-family)`, size `var(--font-sm)`
  - Border radius: `var(--radius-lg)` for bubbles
  - Chat container has a `var(--color-border)` border and `var(--radius-md)` corners
- [ ] The chat area takes up available height with the input fixed at the bottom
- [ ] Verify in browser: can have a multi-turn conversation with the AI, messages display correctly

---

### US-AL10: Frontend — Redesigned Create Listing Page with Chat + Manual Toggle

**Description:** As a buyer, I want the create listing page to default to the AI chat interface, with an option to switch to the manual form, so I can choose the method that works best for me.

**Acceptance Criteria:**
- [ ] Refactor `CreateListingPage.jsx` to include two modes: `"chat"` (default) and `"manual"`
- [ ] Add a toggle/tab control at the top of the page with two options:
  - "AI Assistant" (default, with a sparkle/magic wand icon) — shows the `AIChatBox` component
  - "Manual Form" (with a form/pencil icon) — shows the existing `ListingForm` component
- [ ] The toggle uses pill-style buttons matching the existing design system (similar to filter pills or tab styles in components.css)
- [ ] When in chat mode:
  - Display `AIChatBox` as the main content
  - Below or beside the chat, show a "Listing Preview" card that displays the extracted fields in real-time as the AI populates them
  - The preview card shows: title, make, model, year range, budget range, vehicle type icon, zip code, mileage, transmission, drivetrain, condition, features tags
  - Empty/missing fields show a placeholder dash or "Not set yet"
  - A "Create Listing" button appears below the preview, enabled only when the required fields (title, make, model, yearMin, yearMax, budgetMin, budgetMax, zipCode, radius, mileageMax, description) are populated
  - Clicking "Create Listing" calls `apiService.wantListings.create()` with the extracted data and navigates to `/buyer/dashboard`
- [ ] When in manual mode:
  - Show the existing `ListingForm` component with a new `vehicleType` select dropdown added (values: Sedan, SUV, Truck, Classic Car, Exotic, Van, Coupe, Convertible, Wagon, Electric, Other)
  - Form behavior remains identical to current implementation
- [ ] Switching from chat to manual preserves any already-extracted data (pre-populate the manual form with chat-extracted fields)
- [ ] Switching from manual to chat does NOT erase the chat history
- [ ] Page title: "Create Want Listing"
- [ ] Page layout: max-width 900px, centered (wider than the current 640px to accommodate chat + preview side-by-side on desktop)
- [ ] On mobile (< 768px): stack chat and preview vertically
- [ ] Verify in browser: can create a listing via chat mode end-to-end
- [ ] Verify in browser: can create a listing via manual mode
- [ ] Verify in browser: switching modes preserves data

---

### US-AL11: Frontend — Vehicle Type Selector for Manual Form

**Description:** As a buyer using the manual form, I want to select a vehicle type so my listing displays the correct icon.

**Acceptance Criteria:**
- [ ] Add a `vehicleType` field to the `ListingForm` component in `CreateListingPage.jsx`
- [ ] Render it as a visual grid of clickable cards (not a plain dropdown) — each card shows the `VehicleTypeIcon` (size 32) and the display name below it
- [ ] The grid is 4 columns on desktop, 3 on tablet, 2 on mobile
- [ ] Selected card has `var(--color-accent)` border and light blue background (`#EEF2FF`)
- [ ] Vehicle type is optional — user can skip it (default null)
- [ ] The selected `vehicleType` is included in the form data sent to `onSubmit`
- [ ] Style the cards to match the existing `.role-card` pattern used on the register page
- [ ] Verify in browser: selecting a vehicle type highlights the card, and the value is submitted with the listing

---

### US-AL12: Frontend — Edit Listing Page Vehicle Type Support

**Description:** As a buyer editing an existing listing, I want to see and change the vehicle type.

**Acceptance Criteria:**
- [ ] Update `EditListingPage.jsx` to pass the existing `vehicleType` from the fetched listing into the `ListingForm` initial values
- [ ] The vehicle type selector (from US-AL11) shows the current type pre-selected
- [ ] Changing the vehicle type and saving updates the listing correctly
- [ ] Verify in browser: edit a listing that has a vehicleType, change it, save, verify it persists on reload

---

### US-AL13: Frontend — Listing Preview Component

**Description:** As a buyer using the AI chat, I want to see a real-time preview of my listing as the AI fills in the details so I can confirm everything looks right before submitting.

**Acceptance Criteria:**
- [ ] Create `frontend/src/components/ListingPreview.jsx` and `ListingPreview.css`
- [ ] The preview displays in a `.card` styled container with the following sections:
  - **Header**: Vehicle type icon (size 40) + listing title (or "Untitled Listing" placeholder)
  - **Vehicle Info**: Make, Model, Year range — displayed as a single line (e.g., "Honda CR-V, 2020–2024")
  - **Budget**: displayed as "$XX,XXX – $XX,XXX" in green (`var(--color-success)`)
  - **Location**: zip code + radius (e.g., "Within 50mi of 90210")
  - **Specs**: mileage, transmission, drivetrain, condition — displayed as pill tags
  - **Features**: feature tags displayed using the existing `.tag-pill` style
  - **Description**: truncated to 3 lines with "..." overflow
- [ ] Each field shows a light gray placeholder (e.g., "—") when not yet populated
- [ ] Fields animate in with a subtle fade when they get populated (CSS transition, opacity 0→1)
- [ ] A progress indicator at the top shows how many of the 7 required fields are filled (e.g., "4 of 7 fields complete") with a thin progress bar using `var(--color-accent)`
- [ ] Verify in browser: preview updates in real-time as data is passed via props

---

### US-AL14: E2E Test — NavBar CTA for Unauthenticated Users

**Description:** As a developer, I want E2E tests verifying the persistent NavBar CTA behavior for unauthenticated users.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ai-listing-nav.spec.js`
- [ ] **Test: CTA visible when logged out** — Navigate to `/`, verify "Post Want-Listing" button is visible in the navbar
- [ ] **Test: CTA redirects to login** — Click "Post Want-Listing" while logged out, verify redirect to `/login` with `?redirect=/buyer/create-listing` in the URL
- [ ] **Test: Login redirect flow** — Click "Post Want-Listing" while logged out, log in as buyer on the login page, verify redirect to `/buyer/create-listing` (not the default dashboard)
- [ ] **Test: CTA visible for sellers** — Log in as seller, verify "Post Want-Listing" button is visible
- [ ] **Test: CTA visible for buyers** — Log in as buyer, verify "Post Want-Listing" button is visible and navigates to `/buyer/create-listing`
- [ ] All tests pass: `npx playwright test e2e/ai-listing-nav.spec.js --reporter=list`

---

### US-AL15: E2E Test — AI Chat Listing Creation Flow

**Description:** As a developer, I want E2E tests covering the full AI chat listing creation flow.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ai-listing-chat.spec.js`
- [ ] **Test: Chat loads with AI greeting** — Navigate to `/buyer/create-listing` (as buyer), verify the AI chat mode is active by default and an initial AI message is displayed
- [ ] **Test: User can send a message** — Type a message ("I'm looking for a Honda CR-V") and click send, verify the message appears in the chat, verify an AI response appears after a few seconds
- [ ] **Test: Listing preview updates** — After a conversation where the user provides make, model, year, and budget, verify the listing preview section shows the extracted data
- [ ] **Test: Can submit listing from chat** — After the AI has extracted enough data, verify the "Create Listing" button becomes enabled, click it, verify redirect to `/buyer/dashboard`, verify the new listing appears in the dashboard
- [ ] **Test: Toggle to manual mode** — Click the "Manual Form" toggle, verify the manual form is displayed with any already-extracted data pre-populated
- [ ] **Test: Toggle back to chat preserves history** — Switch to manual, then back to chat, verify chat messages are still visible
- [ ] **Test: Error handling** — (Optional/mock) If the AI endpoint returns an error, verify an error message is displayed in the chat
- [ ] All tests pass: `npx playwright test e2e/ai-listing-chat.spec.js --reporter=list`

---

### US-AL16: E2E Test — Manual Form with Vehicle Type

**Description:** As a developer, I want E2E tests verifying the manual form still works correctly with the new vehicle type field.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ai-listing-manual.spec.js`
- [ ] **Test: Manual form works end-to-end** — Switch to manual mode, fill out all fields including selecting a vehicle type (e.g., "SUV"), submit, verify redirect to dashboard, verify listing was created
- [ ] **Test: Vehicle type is optional** — Submit a listing without selecting a vehicle type, verify it succeeds
- [ ] **Test: Vehicle type displays on listing card** — Create a listing with vehicle type "truck", navigate to homepage, find the listing, verify the truck icon is displayed instead of the generic car icon
- [ ] **Test: Vehicle type displays on detail page** — Navigate to the listing detail page, verify the vehicle type icon and label ("Pickup Truck") are displayed
- [ ] **Test: Edit listing preserves vehicle type** — Edit the listing, verify the vehicle type selector shows "Truck" pre-selected, change it to "SUV", save, verify it updated
- [ ] All tests pass: `npx playwright test e2e/ai-listing-manual.spec.js --reporter=list`

---

### US-AL17: E2E Test — Vehicle Type Icons Display

**Description:** As a developer, I want E2E tests verifying vehicle type icons render correctly across the app.

**Acceptance Criteria:**
- [ ] Create `frontend/e2e/ai-listing-icons.spec.js`
- [ ] **Test: Icons on homepage listing cards** — Ensure at least one listing with a `vehicleType` exists, navigate to homepage, verify an SVG icon is rendered in the listing card image area
- [ ] **Test: Null vehicle type shows generic icon** — Ensure a listing without `vehicleType` exists, verify it shows the generic car icon (not blank)
- [ ] **Test: Icon on detail page** — Navigate to a listing with `vehicleType: "exotic"`, verify the exotic car icon and "Exotic / Sports" label are displayed
- [ ] **Test: Icons are responsive** — Check that listing card icons render at mobile viewport (375px width) without overflow
- [ ] All tests pass: `npx playwright test e2e/ai-listing-icons.spec.js --reporter=list`

---

## 4. Functional Requirements

- **FR-1:** The system must provide a `POST /api/ai/chat` endpoint that accepts a conversation history and returns an AI-generated reply from Claude, requiring JWT authentication.
- **FR-2:** The system must provide a `POST /api/ai/extract` endpoint that accepts a conversation history and returns a structured JSON object with want listing fields extracted from the conversation.
- **FR-3:** The AI system prompt must instruct Claude to act as a car-buying assistant that asks about make, model, year range, budget, mileage, location, features, transmission, drivetrain, condition, and vehicle type.
- **FR-4:** The AI must auto-detect `vehicleType` from the make/model/description discussed in the conversation (e.g., "Ford F-150" → `truck`, "Tesla Model 3" → `electric`, "1965 Corvette" → `classic`).
- **FR-5:** The `want_listings` table must support a `vehicle_type` column with valid values: `sedan`, `suv`, `truck`, `classic`, `exotic`, `van`, `coupe`, `convertible`, `wagon`, `electric`, `other`.
- **FR-6:** The "Post Want-Listing" button must be visible in the NavBar at all times, for all users, regardless of authentication state.
- **FR-7:** Unauthenticated users clicking "Post Want-Listing" must be redirected to `/login?redirect=/buyer/create-listing`, and upon successful login, must be redirected to `/buyer/create-listing`.
- **FR-8:** The create listing page must default to the AI chat mode and provide a toggle to switch to the manual form.
- **FR-9:** Switching between chat and manual modes must preserve any already-entered/extracted data.
- **FR-10:** The listing preview component must show real-time updates as the AI extracts listing fields, with a progress indicator showing required fields completion.
- **FR-11:** The system must render the correct SVG vehicle type icon on listing cards, detail pages, and the create listing preview.
- **FR-12:** The AI chat endpoint must be rate-limited to 30 requests per user per minute.
- **FR-13:** The manual form must include a visual vehicle type selector grid that matches the existing role-card design pattern.
- **FR-14:** All new features must have comprehensive Playwright E2E tests.

---

## 5. Non-Goals (Out of Scope)

- **No voice input** — Text chat only, no speech-to-text
- **No image recognition** — The AI will not analyze uploaded car photos
- **No real-time market pricing** — The AI will not look up actual market values; it relies on user-stated budgets
- **No multi-language support** — English only for the AI assistant
- **No chat history persistence** — The AI chat conversation is session-only; it's not saved to the database. If the user refreshes, the chat starts over
- **No AI-assisted vehicle listing creation for sellers** — This is buyer-side only
- **No custom vehicle type icons** — Only the predefined 11 types are supported
- **No chat widget on other pages** — The AI chat only appears on the create listing page
- **No WebSocket streaming** — The AI responses use standard request/response, not streaming

---

## 6. Design Considerations

### UI Layout — Create Listing Page (Chat Mode)
```
┌─────────────────────────────────────────────────┐
│  NavBar  [GitchaCars]     [Post Want-Listing ✚] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Create Want Listing                            │
│  [✨ AI Assistant]  [📝 Manual Form]            │
│                                                 │
│  ┌──────────────────┐ ┌──────────────────────┐  │
│  │ AI Chat           │ │ Listing Preview      │  │
│  │                   │ │                      │  │
│  │ 🤖 Hi! What kind │ │ ── Title ──          │  │
│  │ of car are you    │ │ Make: Honda          │  │
│  │ looking for?      │ │ Model: CR-V          │  │
│  │                   │ │ Year: 2020–2024      │  │
│  │     I want a      │ │ Budget: $25k–$35k    │  │
│  │     Honda CR-V 👤 │ │ [🚙 SUV]            │  │
│  │                   │ │                      │  │
│  │ [Type message...] │ │ 5/7 fields complete  │  │
│  │            [Send] │ │ ████████░░           │  │
│  └──────────────────┘ │ [Create Listing]      │  │
│                       └──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Existing Components to Reuse
- `.card` class from `components.css`
- `.tag-pill` for feature tags
- `.btn`, `.btn-primary`, `.btn-secondary` button styles
- `.form-group`, `.form-row`, `.form-section-title` for manual form
- `.role-card` pattern for vehicle type selector grid
- `.navbar-cta` for the CTA button styling
- CSS variables from `variables.css` for all colors, spacing, typography

### Vehicle Type Icon Style
- Single-color stroke icons using `currentColor`
- Stroke width: 1.5–2px
- ViewBox: 24x24 (scalable via size prop)
- Style: minimal line-art, similar to the existing car SVG in ListingCard

---

## 7. Technical Considerations

### Claude API Integration
- **Package:** `@anthropic-ai/sdk` (official Anthropic Node.js SDK)
- **Model:** `claude-sonnet-4-5-20250929` (balance of quality and cost)
- **API Key:** Stored in `backend/.env` as `ANTHROPIC_API_KEY`
- **System Prompt Strategy:** Two separate system prompts:
  1. **Chat prompt** — Conversational, asks questions, friendly tone
  2. **Extract prompt** — Structured extraction, returns JSON only
- **Cost Management:** Rate limiting (30 req/min/user), max_tokens capped at 1024

### Database Migration
- Simple `ALTER TABLE` — no downtime, no data migration needed
- Column is nullable with no default constraint issues

### Security
- AI endpoints require JWT authentication — no anonymous access to Claude API
- User input is passed to Claude but responses are text-only (no code execution)
- Rate limiting prevents abuse of the AI endpoint
- ANTHROPIC_API_KEY must never be exposed to the frontend

### Compatibility
- This PRD does NOT modify any existing API endpoints, database tables (beyond adding a column), or component contracts
- Existing listings without `vehicleType` continue to work with graceful null handling
- The manual form continues to work identically to before
- No interference with other PRDs — new files are created, existing files have additive-only changes

---

## 8. Success Metrics

- **Listing creation conversion rate** — Track how many users who land on the create listing page successfully submit a listing (target: >60% via chat vs. current baseline)
- **Time to create listing** — Average time from page load to submission (target: <3 minutes via chat)
- **AI chat engagement** — Percentage of users who use chat mode vs. manual mode (target: >70% chat)
- **Vehicle type adoption** — Percentage of new listings created with a vehicle type set (target: >80%)
- **E2E test pass rate** — All 4 Playwright test files pass on every build

---

## 9. Open Questions

1. **AI API costs** — Should we implement a daily spending cap or alert threshold for Claude API usage?
2. **Chat context window** — Should there be a maximum conversation length (e.g., 20 messages) before the AI suggests submitting?
3. **Vehicle type for existing listings** — Should we backfill existing listings with AI-inferred vehicle types in a one-time migration, or leave them as null?
4. **Seller access** — The CTA is visible to sellers, but should sellers be able to create want listings (dual role), or should clicking redirect them to a different flow?
