# PRD: GitchaCars UX Phase 6 — Filters, Model Dropdown, Chat Sizing & Guidance

## 1. Introduction/Overview

The GitchaCars homepage has several usability friction points that hurt conversion: the filter sidebar has its own scroll container (non-standard — users expect one page scroll), filters are ordered illogically compared to industry norms (AutoTrader, CarGurus, Cars.com all lead with Make/Model then Price), there is no Model dropdown despite the data existing, the sidebar AI chat input is too small to see what you're typing, and there is zero guidance for visitors about what GitchaCars is or what actions to take. This phase fixes all five issues to bring the homepage UX to industry-standard quality.

**No backend changes required** — the backend already supports `model` as a query parameter with ILIKE filtering.

## 2. Goals

- **Fix sidebar scroll**: Remove sticky positioning and internal scroll so the filter panel expands naturally with the page's single scroll
- **Reorder filters**: Match industry-standard filter ordering (Make/Model first, then Price, Year, Mileage, Location, etc.)
- **Add Model filter**: Wire up the existing `getModelsByMake()` function as a dependent dropdown after Make
- **Enlarge sidebar chat**: Make the chat input a multi-line textarea, increase message area height and font sizes so users can actually read/write
- **Add guidance banners**: Show dismissible contextual guidance for unauthenticated visitors, new buyers, and sellers
- **E2E coverage**: Every feature has dedicated Playwright tests

## 3. User Stories

---

### US-001: Remove Filter Sidebar Sticky Positioning & Internal Scroll
**Description:** As a user, I want the filter sidebar to scroll with the page naturally so that I don't have two competing scrollbars and can reach all filters by scrolling the main page.

**Acceptance Criteria:**
- [ ] Remove `position: sticky`, `top: 80px`, `max-height: calc(100vh - 100px)`, and `overflow-y: auto` from `.filter-sidebar` in `FilterSidebar.css`
- [ ] Keep `overflow: hidden` for border-radius clipping
- [ ] Sidebar content expands fully — all filter sections visible by scrolling the main page
- [ ] No horizontal layout shift when sidebar content is taller than viewport
- [ ] Mobile slide-up sheet behavior is unchanged (position: fixed overlay in `@media` block stays untouched)
- [ ] Typecheck passes
- [ ] **Verify in browser**: open all filter sections on desktop — page scrollbar handles everything, no sidebar scrollbar appears

---

### US-002: Reorder Filters to Industry Standard
**Description:** As a user, I want filters ordered by importance (Make/Model, Price, Year, Mileage) so I can quickly narrow results the way I do on AutoTrader or CarGurus.

**Acceptance Criteria:**
- [ ] Filter section order in `FilterSidebar.jsx` JSX is: Make/Model → Price Range → Year Range → Max Mileage → Location → Vehicle Type → Transmission → Drivetrain
- [ ] Section label for Make changes from "Make" to "Make / Model"
- [ ] Default open sections updated: `make: true`, `price: true`, `location: true` — all others `false` (close `type` which was previously open)
- [ ] All filter functionality (inputs, selects, checkboxes, radios, range slider) works identically in new positions
- [ ] SmartActionBox + SidebarChat remain above all filter sections (unchanged)
- [ ] Typecheck passes
- [ ] **Verify in browser**: filter sections appear in the new order, collapsed/expanded states match spec

---

### US-003: Add Model Dropdown to Filter Sidebar
**Description:** As a user, I want to filter by both Make and Model so I can find exactly the vehicle I'm looking for, not just the brand.

**Acceptance Criteria:**
- [ ] Import `getModelsByMake` from `../data/carMakesModels.js` in `FilterSidebar.jsx`
- [ ] When a Make is selected, a Model `<select>` dropdown appears below the Make dropdown inside the same section body
- [ ] Model dropdown has "Any" as the first option (empty string value)
- [ ] When Make changes, Model automatically resets to "Any" (empty string)
- [ ] When Make is "Any" (empty), the Model dropdown is hidden
- [ ] `handleClearAll` resets `model` to `''`
- [ ] `handleFiltersExtracted` handles `filterData.model` to auto-populate from AI chat
- [ ] Model select has `margin-top: var(--space-2)` spacing below the Make select
- [ ] In `HomePage.jsx`: add `model: ''` to `INITIAL_FILTERS`
- [ ] In `HomePage.jsx` `fetchListings`: add `if (currentFilters.model) params.model = currentFilters.model`
- [ ] Typecheck passes
- [ ] **Verify in browser**: select "Toyota" → Model dropdown appears → select "Camry" → listings filter → change Make → Model resets

---

### US-004: Enlarge Sidebar Chat Input & Messages
**Description:** As a user, I want a larger chat input area so I can see what I'm typing, and taller message history so I can follow the conversation.

**Acceptance Criteria:**
- [ ] In `SidebarChat.jsx`: change `<input type="text">` to `<textarea rows={2}>`
- [ ] Enter key sends message, Shift+Enter creates a newline
- [ ] In `SidebarChat.css`: increase `.sidebar-chat-messages` `max-height` from `200px` to `320px`
- [ ] Chat bubble font-size increases from `var(--font-xs)` to `var(--font-sm)`
- [ ] Input CSS selector changes from `.sidebar-chat-input input` to `.sidebar-chat-input textarea`
- [ ] Textarea styles: `font-size: var(--font-sm)`, `border-radius: var(--radius-md)`, `resize: none`, `min-height: 40px`
- [ ] Input container: `align-items: flex-end`
- [ ] Send button increases from 28px to 34px
- [ ] Typecheck passes
- [ ] **Verify in browser**: open sidebar chat → textarea is multi-line → text wraps visibly

---

### US-005: Dismissible UX Guidance Banners
**Description:** As a visitor or user, I want contextual guidance explaining what GitchaCars is and what I should do next, which I can dismiss once I understand.

**Acceptance Criteria:**
- [ ] Add three conditional guidance banners between the header and the listing feed
- [ ] Each banner has a close (X) button; dismissal persisted in localStorage
- [ ] Unauthenticated: "How GitchaCars Works" with sign-up link
- [ ] Buyer (zero listings): "Post Your First Want Listing" with create link
- [ ] Seller: "Find Matching Buyers" with usage guidance
- [ ] **Verify in browser**: see banner → click X → refresh → banner stays hidden

---

### US-006: E2E Tests — Filter Sidebar Scroll & Reorder
### US-007: E2E Tests — Model Dropdown
### US-008: E2E Tests — Sidebar Chat Sizing
### US-009: E2E Tests — Guidance Banners

(See plan file for full acceptance criteria per test story)
