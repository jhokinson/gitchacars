# PRD: GitchaCars UI Framework & Full Redesign

## 1. Introduction/Overview

GitchaCars currently has a functional but basic UI built with plain React and minimal CSS. This PRD covers a complete visual overhaul inspired by [app.gitcha.com](https://app.gitcha.com) — a polished demand-first marketplace for real estate. We will adapt Gitcha's design language (sidebar + content layout, horizontal listing cards, feature tags, professional navigation) to the automobile domain. This includes new backend endpoints to support favorites, enhanced filtering, sorting, and feature tags.

**Design Philosophy**: Clean, professional SaaS aesthetic with a dark navy primary color, generous white space, subtle shadows, and horizontally-oriented listing cards with structured metadata (year range, mileage, budget, feature tags).

## 2. Goals

- Transform the barebones UI into a polished, professional SaaS interface matching Gitcha's design quality
- Implement a sidebar + main content layout for the homepage feed with functional filters
- Add full Gitcha parity features: favorites, sharing, feature tags, sort, enhanced filters
- Create a reusable design system (CSS variables) for consistent styling across all pages
- Ensure all pages are cohesive and follow the same design language
- Keep plain CSS — no frameworks, no bloat

## 3. User Stories

---

### US-001: Design System — CSS Variables & Base Styles

**Description:** As a developer, I want a centralized design system with CSS custom properties so that all components share consistent colors, typography, spacing, and shadows.

**Acceptance Criteria:**
- [ ] Create `src/styles/variables.css` with CSS custom properties:
  - Colors: `--color-primary: #1B2A4A` (dark navy), `--color-primary-hover: #152240`, `--color-accent: #2563EB` (blue), `--color-accent-hover: #1D4ED8`, `--color-bg: #FFFFFF`, `--color-bg-secondary: #F8F9FA`, `--color-bg-hover: #F1F3F5`, `--color-text: #1B2A4A`, `--color-text-secondary: #6B7280`, `--color-text-muted: #9CA3AF`, `--color-border: #E5E7EB`, `--color-border-light: #F3F4F6`, `--color-success: #059669`, `--color-success-bg: #ECFDF5`, `--color-warning: #D97706`, `--color-warning-bg: #FFFBEB`, `--color-danger: #DC2626`, `--color-danger-bg: #FEF2F2`
  - Typography: `--font-family: 'Inter', system-ui, -apple-system, sans-serif`, sizes from `--font-xs: 0.75rem` to `--font-2xl: 1.5rem`, weights `--font-normal: 400`, `--font-medium: 500`, `--font-semibold: 600`, `--font-bold: 700`
  - Spacing: `--space-1: 4px` through `--space-8: 32px`
  - Border radius: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-full: 9999px`
  - Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- [ ] Create `src/styles/base.css` with reset styles, body defaults, link styles, and utility classes
- [ ] Create `src/styles/components.css` with shared component patterns: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.btn-icon`, `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-neutral`, `.input`, `.select`, `.tag`, `.tag-pill`, `.card`
- [ ] Import Inter font from Google Fonts in `index.html`
- [ ] Update `index.css` to import the new style files in order: variables → base → components
- [ ] Remove duplicate styles from `pages.css` that are now in the shared component styles
- [ ] Verify all existing pages still render correctly after the CSS migration

---

### US-002: NavBar Redesign

**Description:** As a user, I want a polished navigation bar with the GitchaCars brand, icon-based actions, and a prominent CTA button so that the app feels professional and is easy to navigate.

**Acceptance Criteria:**
- [ ] NavBar displays "GitchaCars" logo text (font-weight 700, `--color-primary`) + tagline "The Want Marketplace for Cars™" in `--color-text-secondary`
- [ ] Right side shows icon buttons for: settings/preferences (gear icon), notifications (bell - existing), messages (chat icon)
- [ ] Primary CTA button "Post Want-Listing" (for buyers) or "Add Vehicle" (for sellers) — dark navy background, white text, rounded, prominent
- [ ] User avatar circle on far right (shows first initial if no photo) with dropdown for Dashboard, Introductions, Logout
- [ ] Unauthenticated state: only Login and Register links + brand
- [ ] NavBar height: 64px, white background, subtle bottom border `--color-border`, fixed top
- [ ] Update `NavBar.css` with new styles matching Gitcha's nav pattern
- [ ] **Verify in browser**: NavBar renders correctly for unauthenticated, buyer, seller, and admin roles

---

### US-003: Sidebar Filter Panel Component

**Description:** As a buyer browsing listings, I want a left sidebar with filters so that I can narrow down want listings by make, model, year, price range, mileage, location, and transmission.

**Acceptance Criteria:**
- [ ] Create `src/components/FilterSidebar.jsx` and `FilterSidebar.css`
- [ ] Sidebar is 280px wide, white background, with sections separated by light dividers
- [ ] **Location filter**: Text input with search icon for zip code, radius dropdown (5, 10, 25, 50, 100 miles)
- [ ] **Keyword search**: Text input with magnifying glass icon
- [ ] **Vehicle type filter**: Collapsible section with checkboxes (Sedan, SUV, Truck, Coupe, Convertible, Van, Wagon)
- [ ] **Make filter**: Searchable dropdown/select for car makes (Toyota, Honda, Ford, BMW, etc.)
- [ ] **Price range filter**: Dual-thumb range slider with min/max dollar inputs below
- [ ] **Year range filter**: Min year and max year dropdowns
- [ ] **Mileage filter**: Max mileage dropdown (50k, 75k, 100k, 150k, 200k, No Max)
- [ ] **Transmission filter**: Radio buttons (Any, Automatic, Manual)
- [ ] **Drivetrain filter**: Radio buttons (Any, FWD, RWD, AWD/4WD)
- [ ] All filters call an `onFilterChange(filters)` callback prop when changed
- [ ] Filters have a "Clear All" button at the top
- [ ] Collapsible sections with chevron icons (expanded by default for Price, collapsed for others)
- [ ] **Verify in browser**: All filter controls render, expand/collapse, and fire change events

---

### US-004: Price Range Slider Component

**Description:** As a user, I want a dual-thumb range slider for filtering by price so that I can visually set my budget range.

**Acceptance Criteria:**
- [ ] Create `src/components/RangeSlider.jsx` and `RangeSlider.css`
- [ ] Two draggable thumbs on a track representing min and max values
- [ ] Track filled between thumbs with `--color-accent` blue
- [ ] Min/max input fields below the slider for precise entry ($ 0 — $ No max)
- [ ] Slider and inputs stay in sync — changing one updates the other
- [ ] Thumbs cannot cross each other
- [ ] Props: `min`, `max`, `step`, `valueMin`, `valueMax`, `onChange`
- [ ] Styled to match Gitcha's dark navy thumb with blue fill track
- [ ] **Verify in browser**: Slider is draggable and updates inputs in real-time

---

### US-005: Horizontal Listing Card Redesign

**Description:** As a user, I want want-listing cards displayed in a horizontal layout with a thumbnail on the left and structured details on the right so that I can quickly scan key information.

**Acceptance Criteria:**
- [ ] Redesign `ListingCard.jsx` and `ListingCard.css` to horizontal layout
- [ ] Left side (200px wide): Placeholder image area showing a car silhouette icon or a generic map/location graphic (since we don't have listing images). Dark navy background with car icon.
- [ ] Right side content:
  - **Row 1**: Price range (`$35,000 - $50,000`) in `--font-semibold` + optional badge ("Verified Buyer" in green pill)
  - **Row 2**: Listing title in `--font-bold` `--font-lg` + location text ("Within 25 mi of 90210")
  - **Row 3**: Specs in pipe-separated format: `2021–2024 | Under 50k mi | Automatic | AWD`
  - **Row 4**: Feature tags as pills (e.g., "Leather", "Sunroof", "Low Miles", "Backup Camera") — only if we add feature tags to the data model
  - **Row 5**: Buyer name/avatar (e.g., "Jake H." with initial circle)
- [ ] Action icons in top-right corner: share icon, heart/favorite icon
- [ ] Card has 1px `--color-border` border, `--radius-md` radius, hover shadow transition
- [ ] Cards stack vertically in the feed (not grid) — full width of content area
- [ ] Clicking the card navigates to the listing detail page
- [ ] **Verify in browser**: Cards display correctly with all data from existing API

---

### US-006: Sort Dropdown Component

**Description:** As a user browsing listings, I want a sort dropdown so that I can order results by newest, oldest, price low-to-high, or price high-to-low.

**Acceptance Criteria:**
- [ ] Create `src/components/SortDropdown.jsx` and `SortDropdown.css`
- [ ] Dropdown positioned top-right of the listing feed area
- [ ] Label "Sort By:" followed by the selected option in bold
- [ ] Options: Newest (default), Oldest, Budget: Low to High, Budget: High to Low
- [ ] Clean dropdown styling matching Gitcha (subtle border, shadow, chevron icon)
- [ ] Fires `onSort(sortValue)` callback when changed
- [ ] **Verify in browser**: Dropdown opens, selects, and closes correctly

---

### US-007: Homepage Feed Redesign — Sidebar + Content Layout

**Description:** As a user, I want the homepage to show a sidebar with filters on the left and a scrollable listing feed on the right so that I can browse and filter want listings efficiently.

**Acceptance Criteria:**
- [ ] HomePage uses a two-column layout: 280px FilterSidebar on left, fluid content area on right
- [ ] Content area header: "Real Time Buyers In/Near [location]" heading + SortDropdown on right
- [ ] Listing feed displays horizontal ListingCards (US-005) stacked vertically
- [ ] Infinite scroll or "Load More" button at bottom for pagination
- [ ] When filters change, the listing feed updates (calls API with filter params)
- [ ] When sort changes, listings re-fetch with sort parameter
- [ ] Loading skeleton/spinner while fetching
- [ ] Empty state when no listings match filters: "No listings found. Try adjusting your filters."
- [ ] Total listing count displayed: "Showing X of Y listings"
- [ ] Responsive: sidebar collapses to a filter toggle button on screens < 768px
- [ ] **Verify in browser**: Full sidebar + feed layout renders, filters and sort work end-to-end

---

### US-008: Backend — Enhanced Listing Filters & Sort API

**Description:** As the frontend, I need the want-listings list API to accept filter and sort parameters so that sidebar filters produce real results.

**Acceptance Criteria:**
- [ ] `GET /api/want-listings` accepts new query params: `make`, `model`, `yearMin`, `yearMax`, `budgetMin`, `budgetMax`, `mileageMax`, `transmission`, `drivetrain`, `zipCode`, `radius`, `keyword`, `sort` (newest, oldest, budget_asc, budget_desc)
- [ ] Each filter applies a WHERE clause (ANDed together) to the SQL query
- [ ] `keyword` searches title and description (ILIKE)
- [ ] `zipCode` + `radius` filters listings within radius miles using the `zip_codes` table (haversine or simple bounding box)
- [ ] `sort` maps to ORDER BY clauses: `newest` = `created_at DESC`, `oldest` = `created_at ASC`, `budget_asc` = `budget_min ASC`, `budget_desc` = `budget_max DESC`
- [ ] Default sort is `newest`
- [ ] All existing functionality preserved (pagination, total count)
- [ ] Update `apiService.js` to pass filter/sort params from the frontend

---

### US-009: Backend — Favorites API

**Description:** As a user, I want to save/unsave listings as favorites so that I can quickly access listings I'm interested in.

**Acceptance Criteria:**
- [ ] Create `favorites` table: `id UUID PK`, `user_id UUID FK`, `want_listing_id UUID FK`, `created_at TIMESTAMPTZ`, `UNIQUE(user_id, want_listing_id)`
- [ ] `POST /api/favorites` — body `{ wantListingId }` — add favorite (authenticated)
- [ ] `DELETE /api/favorites/:wantListingId` — remove favorite (authenticated)
- [ ] `GET /api/favorites` — list user's favorite listing IDs (returns array of wantListingId)
- [ ] `GET /api/want-listings` response includes `isFavorited: boolean` for each listing when user is authenticated (LEFT JOIN favorites)
- [ ] Create `favoritesModel.js`, `favoritesController.js`, `routes/favorites.js`
- [ ] Add route to `app.js`: `app.use('/api/favorites', favoritesRoutes)`
- [ ] Add to `apiService.js`: `favorites.add(wantListingId)`, `favorites.remove(wantListingId)`, `favorites.list()`

---

### US-010: Favorite/Heart Button Component

**Description:** As a user, I want a heart icon on each listing card that I can click to save/unsave a listing as a favorite.

**Acceptance Criteria:**
- [ ] Create `src/components/FavoriteButton.jsx` and `FavoriteButton.css`
- [ ] Heart icon: outline when not favorited, filled red when favorited
- [ ] Click toggles favorite state and calls the favorites API
- [ ] Only visible to authenticated users
- [ ] Optimistic UI: toggle immediately, revert on API error
- [ ] Positioned in top-right of listing card alongside share icon
- [ ] **Verify in browser**: Heart toggles between outline and filled on click

---

### US-011: Share Button Component

**Description:** As a user, I want a share icon on listing cards that copies the listing URL to my clipboard or opens a native share dialog.

**Acceptance Criteria:**
- [ ] Create `src/components/ShareButton.jsx` and `ShareButton.css`
- [ ] Share icon (box with arrow) positioned next to the favorite heart
- [ ] Click behavior: if `navigator.share` available (mobile), use native share. Otherwise, copy listing URL to clipboard.
- [ ] Show brief tooltip/toast "Link copied!" after copying
- [ ] **Verify in browser**: Share button copies URL and shows confirmation

---

### US-012: Feature Tags for Want Listings

**Description:** As a buyer creating a want listing, I want to select desired features (Leather, Sunroof, AWD, etc.) so that sellers can see exactly what I'm looking for.

**Acceptance Criteria:**
- [ ] Add `features TEXT[]` column to `want_listings` table (Neon migration)
- [ ] Update `POST /api/want-listings` and `PUT /api/want-listings/:id` to accept `features` array
- [ ] Update `GET` responses to include `features` array
- [ ] Available feature options (hardcoded list): Leather Seats, Sunroof/Moonroof, Backup Camera, Navigation, Bluetooth, Heated Seats, Apple CarPlay, Android Auto, Keyless Entry, Remote Start, Blind Spot Monitor, Lane Assist, Adaptive Cruise, Third Row, Tow Package, Low Miles
- [ ] Update CreateListingPage and EditListingPage forms to include a multi-select tag picker for features
- [ ] Feature tags display as pills with icons on ListingCards and detail page
- [ ] Create `src/components/FeatureTagPicker.jsx` — grid of toggleable tag pills
- [ ] Create `src/components/FeatureTag.jsx` — individual pill with icon + label
- [ ] **Verify in browser**: Features selectable in forms, displayed on cards and detail pages

---

### US-013: Login Page Redesign

**Description:** As a user, I want a polished login page that matches the new design system.

**Acceptance Criteria:**
- [ ] Centered card layout (max-width 420px) with subtle shadow
- [ ] GitchaCars logo/brand at top of card
- [ ] Clean input fields with labels above, rounded borders, focus ring in accent blue
- [ ] Primary "Log In" button full-width, dark navy
- [ ] "Don't have an account? Register" link below
- [ ] Error messages in red with icon
- [ ] **Verify in browser**: Login form renders cleanly, error states work, successful login redirects

---

### US-014: Register Page Redesign

**Description:** As a new user, I want a polished registration page with clear role selection.

**Acceptance Criteria:**
- [ ] Same card layout as login (max-width 480px)
- [ ] Role selector: two large clickable cards ("I'm looking for a car" / "I'm selling a car") with car icons — selected state has blue border + checkmark
- [ ] Form fields: First Name, Last Name, Email, Password, Confirm Password
- [ ] Inline validation with red border + error text below each field
- [ ] Primary "Create Account" button
- [ ] "Already have an account? Log in" link
- [ ] **Verify in browser**: Role selection works, validation works, successful registration redirects

---

### US-015: Want Listing Detail Page Redesign

**Description:** As a user viewing a want listing, I want a polished detail page with clear layout of all listing criteria, feature tags, and buyer info.

**Acceptance Criteria:**
- [ ] Hero section with listing title, location, price range, and badge
- [ ] Two-column layout below: specs on left (year, mileage, transmission, drivetrain, condition), description on right
- [ ] Feature tags displayed as pills below specs
- [ ] Buyer info section with name initial avatar
- [ ] Action buttons: Favorite, Share, "Introduce a Vehicle" (for sellers), "Edit" / "Archive" (for owner)
- [ ] Breadcrumb: Home > Listing Title
- [ ] Clean card-based sections with subtle shadows
- [ ] **Verify in browser**: All listing data renders, action buttons work for appropriate roles

---

### US-016: Buyer Dashboard Redesign

**Description:** As a buyer, I want a polished dashboard showing my want listings and received introductions in a clear, organized layout.

**Acceptance Criteria:**
- [ ] Two-section layout: "My Want Listings" section on top, "Introductions" section below
- [ ] Want listings displayed as compact horizontal cards with status badge, title, key specs, and Edit/Archive actions
- [ ] "Create New Listing" prominent button
- [ ] Introductions section with filter tabs (All / Pending / Accepted / Rejected)
- [ ] IntroCard redesigned with vehicle thumbnail, vehicle details, seller message, status badge, and Accept/Reject or Message buttons
- [ ] Empty states for both sections with helpful messaging
- [ ] **Verify in browser**: Dashboard loads with real data, all actions (edit, archive, accept, reject) work

---

### US-017: Seller Dashboard Redesign

**Description:** As a seller, I want a polished dashboard showing my vehicles and sent introductions.

**Acceptance Criteria:**
- [ ] Two-section layout: "My Vehicles" section on top, "Sent Introductions" section below
- [ ] Vehicle cards with image thumbnail, year/make/model, price, "View Matches" and "Edit" buttons
- [ ] "Add Vehicle" prominent button
- [ ] Sent introductions with IntroCard showing buyer response status
- [ ] Empty states for both sections
- [ ] **Verify in browser**: Dashboard loads with real data, all actions work

---

### US-018: Vehicle Matches Page Redesign

**Description:** As a seller viewing matches for my vehicle, I want matching want listings displayed as horizontal cards with an "Introduce" button.

**Acceptance Criteria:**
- [ ] Page header showing the seller's vehicle info (year, make, model, price)
- [ ] Matching want listings displayed as horizontal ListingCards
- [ ] Each card has an "Introduce Vehicle" button (or "Already Introduced" disabled state)
- [ ] Introduction modal redesigned: clean card with textarea, character count, send button
- [ ] Success feedback after sending introduction
- [ ] **Verify in browser**: Matches load, introduce modal works, state updates correctly

---

### US-019: Create/Edit Listing Form Redesign

**Description:** As a buyer, I want polished forms for creating and editing want listings with the new design system.

**Acceptance Criteria:**
- [ ] Form inside a clean white card with sections: "Vehicle Preferences", "Budget & Location", "Features", "Additional Details"
- [ ] All inputs use the new design system input styles (rounded, focus ring)
- [ ] Feature tag picker (US-012) included in the form
- [ ] Submit button is full-width primary style
- [ ] Validation errors shown inline below each field
- [ ] **Verify in browser**: Form renders cleanly, validation works, submit creates/updates listing

---

### US-020: Add/Edit Vehicle Form Redesign

**Description:** As a seller, I want polished forms for adding and editing vehicles with the new design system.

**Acceptance Criteria:**
- [ ] Form inside a clean white card with sections: "Vehicle Details", "Pricing & Location", "Photos", "Description"
- [ ] Image uploader redesigned: drag-and-drop zone with dashed border, preview thumbnails in a grid, remove button overlay
- [ ] All inputs use new design system styles
- [ ] Submit button is full-width primary style
- [ ] **Verify in browser**: Form renders cleanly, image upload works, submit creates/updates vehicle

---

### US-021: Introductions Page Redesign

**Description:** As a user, I want a polished introductions page with clear status filtering and card layout.

**Acceptance Criteria:**
- [ ] Tab/pill filter bar: All | Pending | Accepted | Rejected | Expired
- [ ] Active tab has `--color-primary` background with white text
- [ ] IntroCards displayed as horizontal cards with vehicle image, details, message preview, status badge
- [ ] Buyer view: Accept/Reject buttons on pending, Message button on accepted
- [ ] Seller view: Status badge, Message button on accepted
- [ ] Empty state per filter: "No [status] introductions"
- [ ] **Verify in browser**: Filters work, actions work, page renders for both roles

---

### US-022: Messages & Chat Page Redesign

**Description:** As a user, I want polished messaging pages that match the new design system.

**Acceptance Criteria:**
- [ ] Messages list page: conversation cards with vehicle thumbnail, other party name, vehicle info, last message preview
- [ ] Chat page: clean message bubbles — user messages in `--color-accent` blue, other in `--color-bg-secondary` gray
- [ ] Timestamps on messages
- [ ] Input bar at bottom: rounded input with send button icon
- [ ] Chat header shows vehicle info and other party name
- [ ] **Verify in browser**: Chat renders, messages send and appear in real-time (or simulated)

---

### US-023: Admin Page Redesign

**Description:** As an admin, I want a clean admin interface with the new design system.

**Acceptance Criteria:**
- [ ] Tab navigation: Users | Want Listings | Vehicles
- [ ] Clean table styling: alternating row colors, hover states, header in `--color-bg-secondary`
- [ ] Search input for users tab
- [ ] Delete buttons styled as danger ghost buttons
- [ ] Pagination with page numbers
- [ ] **Verify in browser**: All tabs render, search works, delete works, pagination works

---

### US-024: Notification Bell Redesign

**Description:** As a user, I want a polished notification dropdown matching the new nav design.

**Acceptance Criteria:**
- [ ] Bell icon in the new nav style (icon button)
- [ ] Unread count badge: red circle with white number
- [ ] Dropdown panel: clean card with shadow, notification items with read/unread styling
- [ ] "Mark all as read" link at top
- [ ] Click notification marks it read and navigates appropriately
- [ ] **Verify in browser**: Bell shows count, dropdown opens, notifications render and interact correctly

---

### US-025: User Avatar Dropdown

**Description:** As an authenticated user, I want an avatar with a dropdown menu in the navbar for quick navigation to dashboard, settings, and logout.

**Acceptance Criteria:**
- [ ] Create `src/components/AvatarDropdown.jsx` and `AvatarDropdown.css`
- [ ] Circle avatar showing user's first initial with `--color-primary` background and white text
- [ ] Click opens dropdown with: user name + email, divider, Dashboard link, Introductions link, Messages link, divider, Logout
- [ ] Dropdown closes when clicking outside
- [ ] **Verify in browser**: Avatar renders, dropdown opens/closes, all links navigate correctly

---

### US-026: Toast/Notification Component

**Description:** As a user, I want brief toast notifications for actions like "Link copied", "Listing saved", "Introduction sent" so that I get confirmation of my actions.

**Acceptance Criteria:**
- [ ] Create `src/components/Toast.jsx` and `Toast.css`
- [ ] Create `src/context/ToastContext.jsx` with `useToast()` hook
- [ ] Toast appears at bottom-center, auto-dismisses after 3 seconds
- [ ] Variants: success (green), error (red), info (blue)
- [ ] Slide-up animation on enter, fade-out on exit
- [ ] Multiple toasts stack
- [ ] **Verify in browser**: Toasts appear for share, favorite, and form actions

---

### US-027: Loading Skeleton Components

**Description:** As a user, I want skeleton loading states instead of spinners so that the page feels faster while data loads.

**Acceptance Criteria:**
- [ ] Create `src/components/Skeleton.jsx` and `Skeleton.css`
- [ ] Skeleton variants: `SkeletonCard` (horizontal card shape), `SkeletonText` (line), `SkeletonAvatar` (circle)
- [ ] Animated shimmer effect (CSS keyframe: left-to-right gradient sweep)
- [ ] Use skeleton cards on HomePage while listings load
- [ ] Use skeleton cards on dashboard pages while data loads
- [ ] **Verify in browser**: Skeleton cards display during loading and are replaced by real content

---

### US-028: Responsive Design — Mobile Sidebar Collapse

**Description:** As a mobile user, I want the sidebar to collapse into a filter toggle button so that the listing feed takes full width on small screens.

**Acceptance Criteria:**
- [ ] On screens < 768px: sidebar is hidden, a "Filters" button appears above the feed
- [ ] Clicking "Filters" opens the sidebar as a slide-over panel from the left (or full-screen modal)
- [ ] "Apply Filters" button at bottom of mobile sidebar closes it and applies
- [ ] Listing cards adapt: image area shrinks or stacks above details
- [ ] NavBar adapts: hamburger menu for links on mobile
- [ ] **Verify in browser** (at 375px width): All pages are usable on mobile

---

## 4. Functional Requirements

- FR-1: All CSS uses custom properties from `variables.css` — no hardcoded colors or sizes
- FR-2: Design system supports light mode only (no dark mode for MVP)
- FR-3: Sidebar filters produce real API calls that return filtered results
- FR-4: Favorites persist across sessions (stored in database, not localStorage)
- FR-5: Share generates the full URL path `/want-listings/:id`
- FR-6: Feature tags use a predefined list of 16 options (see US-012)
- FR-7: All new backend endpoints require authentication except public listing views
- FR-8: The favorites table has a unique constraint preventing duplicate saves
- FR-9: Sort is reflected in the URL query string for shareability
- FR-10: All existing functionality (CRUD, auth, introductions, messaging, admin) continues to work after the redesign

## 5. Non-Goals (Out of Scope)

- Dark mode
- User profile photos/avatars (using initials only)
- Map integration (Google Maps, Mapbox) — using static placeholders
- Real vehicle images on listing cards (listings are buyer wishlists, not inventory)
- Payment/subscription features
- SEO optimization
- Internationalization / multi-language
- Browser push notifications
- Accessibility audit (basic accessibility via semantic HTML only)

## 6. Design Considerations

**Color Palette** (adapted from Gitcha):
- Primary: `#1B2A4A` (dark navy) — nav, headings, CTAs
- Accent: `#2563EB` (blue) — links, active states, sliders
- Background: `#FFFFFF` main, `#F8F9FA` secondary
- Text: `#1B2A4A` primary, `#6B7280` secondary, `#9CA3AF` muted
- Borders: `#E5E7EB` primary, `#F3F4F6` light
- Status: green (success), amber (warning), red (danger)

**Typography**:
- Font: Inter (Google Fonts)
- Heading sizes: 1.5rem (page), 1.125rem (card), 0.875rem (small)
- Body: 0.9375rem (15px)

**Layout**:
- Max content width: 1200px, centered
- NavBar: 64px fixed top
- Sidebar: 280px fixed width
- Content area: fluid, fills remaining space
- Cards: full-width horizontal layout with 200px image area

**Reusable Existing Code**:
- `src/services/apiService.js` — extend with new methods (favorites, enhanced filters)
- `src/context/AuthContext.jsx` — reuse for auth state
- `src/components/ProtectedRoute.jsx` and `RoleRoute.jsx` — keep as-is
- `src/services/mockData.js` — update mocks if needed
- Backend `src/utils/response.js` — reuse `success()` and `error()` helpers
- Backend `src/db/pool.js` — reuse for new models
- Backend `src/middleware/auth.js` — reuse `authenticate` and `requireRole`

## 7. Technical Considerations

- **CSS Architecture**: `src/styles/` directory with variables.css, base.css, components.css imported in order. Page-specific CSS stays in component files but uses CSS variables only.
- **No CSS framework**: Plain CSS with custom properties. No Tailwind, no CSS modules.
- **Font loading**: Inter from Google Fonts CDN via `<link>` in index.html for simplicity
- **Icon approach**: Use inline SVGs or a simple icon component — no icon library to avoid bloat
- **Migration path**: Existing CSS files are replaced incrementally. Each story can be built and tested independently.
- **Database migration**: Only two schema changes: `features TEXT[]` on want_listings, new `favorites` table
- **API backward compatibility**: Enhanced filters are additive query params — existing calls without params work the same

## 8. Success Metrics

- All 28 user stories pass acceptance criteria
- Every page matches the Gitcha-inspired design language (consistent colors, typography, spacing)
- Sidebar filters produce real filtered results from the API
- Favorites toggle correctly and persist across page reloads
- Feature tags are selectable in forms and displayed on cards
- No regressions in existing functionality (auth, CRUD, introductions, messaging)

## 9. Open Questions

- ~~None — all decisions resolved~~ All design decisions have been made based on Gitcha analysis and user answers.
