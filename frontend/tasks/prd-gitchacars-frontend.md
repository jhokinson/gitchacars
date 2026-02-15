# PRD: GitchaCars MVP — Frontend, Messaging & Deployment

## 1. Introduction/Overview

This PRD covers the React frontend for GitchaCars, Firebase messaging integration, and full-stack deployment to Render. It is designed to be built **concurrently** with the Backend PRD — the frontend can be developed against the API contract defined there, using mocked responses until the backend is live.

**Tech Stack:**
- **Framework:** React (Vite)
- **Routing:** React Router v6
- **HTTP Client:** Axios (via `apiService.js`)
- **Chat:** Firebase Realtime Database
- **Styling:** CSS Modules or plain CSS (no UI library — keep it lean)
- **Hosting:** Render (Static Site)

---

## 2. Goals

- Build all 9 MVP pages with functional UI connected to the backend API.
- Implement Firebase Realtime Database chat for accepted introductions.
- Deploy frontend to Render as a static site.
- Keep the UI functional and clean — no polish, no animations, no branding exercise. Ship fast.

---

## 3. User Stories

### US-F001: Project Setup & API Service
**Description:** As a developer, I need the React project scaffolded with routing and an API service layer so all pages can integrate with the backend.

**Acceptance Criteria:**
- [ ] Vite + React project initialized
- [ ] Project structure:
  ```
  /src
    /pages         — page components
    /components    — shared components
    /services      — apiService.js, firebaseService.js
    /hooks         — custom hooks
    /context       — AuthContext
    App.jsx        — routes
    main.jsx       — entry point
  ```
- [ ] `apiService.js` wraps Axios:
  - Base URL from env var `VITE_API_URL`
  - Automatically attaches JWT token from localStorage to `Authorization` header
  - Interceptor: on 401 response, clear token and redirect to `/login`
- [ ] `firebaseService.js` initializes Firebase app with config from env vars
- [ ] Environment variables: `VITE_API_URL`, `VITE_FIREBASE_*` config keys
- [ ] Verify in browser: app loads without errors, shows a placeholder home page

---

### US-F002: Auth Context & Protected Routes
**Description:** As a developer, I need global auth state so that pages can check if the user is logged in and what their role is.

**Acceptance Criteria:**
- [ ] `AuthContext` provides: `user`, `token`, `login(data)`, `logout()`, `isAuthenticated`, `isRole(role)`
- [ ] On app load, checks localStorage for existing token, validates it (decodes expiry), and restores user state
- [ ] `ProtectedRoute` component redirects to `/login` if not authenticated
- [ ] `RoleRoute` component redirects to home if user lacks required role
- [ ] Verify in browser: unauthenticated user visiting `/buyer/dashboard` is redirected to `/login`

---

### US-F003: Registration Page
**Description:** As a new user, I want to register so I can use the marketplace.

**Acceptance Criteria:**
- [ ] Route: `/register`
- [ ] Form fields: first name, last name, email, password, confirm password, role selector (buyer/seller toggle or radio)
- [ ] Client-side validation: all fields required, email format, password min 8 chars, passwords match
- [ ] On submit: calls `POST /api/auth/register`
- [ ] On success: stores token + user in AuthContext, redirects to role-appropriate dashboard
- [ ] On error: displays server error message (e.g., "Email already registered")
- [ ] Verify in browser: can register a new account and land on dashboard

---

### US-F004: Login Page
**Description:** As a returning user, I want to log in.

**Acceptance Criteria:**
- [ ] Route: `/login`
- [ ] Form fields: email, password
- [ ] On submit: calls `POST /api/auth/login`
- [ ] On success: stores token + user in AuthContext, redirects to role-appropriate dashboard
- [ ] On error: displays "Invalid email or password"
- [ ] Link to `/register` for new users
- [ ] Verify in browser: can log in and reach dashboard

---

### US-F005: Home Page — Want Listing Feed
**Description:** As any visitor, I want to browse the want listing feed to see what buyers are looking for.

**Acceptance Criteria:**
- [ ] Route: `/` (home)
- [ ] Fetches `GET /api/want-listings` on load
- [ ] Displays listings as cards: title, make, model, year range, budget range, location, posted time
- [ ] Pagination: "Load More" button or infinite scroll (keep it simple — "Load More" is fine)
- [ ] If user is a logged-in seller, each card shows a "View Matches" or "Introduce" affordance
- [ ] Clicking a card navigates to `/want-listings/:id` (detail view)
- [ ] Verify in browser: feed loads, cards display, pagination works

---

### US-F006: Want Listing Detail Page
**Description:** As a user, I want to view a single want listing's full details.

**Acceptance Criteria:**
- [ ] Route: `/want-listings/:id`
- [ ] Displays all listing fields including description
- [ ] If the viewer is a seller: shows an "Introduce a Vehicle" button that navigates to the introduction flow
- [ ] If the viewer is the listing owner (buyer): shows edit and archive buttons
- [ ] Verify in browser: detail page renders all fields

---

### US-F007: Buyer Dashboard
**Description:** As a buyer, I want a dashboard to manage my want listings and view introductions.

**Acceptance Criteria:**
- [ ] Route: `/buyer/dashboard` (protected, buyer role)
- [ ] Two sections:
  1. **My Want Listings** — fetches `GET /api/want-listings/mine`, displays as list with status badges, link to create new
  2. **My Introductions** — fetches `GET /api/introductions/received`, shows pending intros prominently with accept/reject buttons
- [ ] Each intro card shows: vehicle thumbnail (first image), make/model/year, price, seller message
- [ ] Accept button calls `PATCH /api/introductions/:id/accept`, Reject calls `PATCH /api/introductions/:id/reject`
- [ ] After accepting, a "Message Seller" button appears
- [ ] Notification badge shows unread count (fetches `GET /api/notifications/unread-count`)
- [ ] Verify in browser: dashboard loads, listings and intros display, accept/reject work

---

### US-F008: Create Want Listing Page
**Description:** As a buyer, I want to create a want listing.

**Acceptance Criteria:**
- [ ] Route: `/buyer/create-listing` (protected, buyer role)
- [ ] Form with all required fields: title, make, model, year min/max, budget min/max, zip code, radius, mileage max, description
- [ ] Optional fields: transmission (dropdown), drivetrain (dropdown), condition (dropdown)
- [ ] Client-side validation matching backend rules
- [ ] On submit: calls `POST /api/want-listings`
- [ ] On success: redirects to buyer dashboard
- [ ] On error: shows field-level errors
- [ ] Verify in browser: can create a listing and see it on dashboard

---

### US-F009: Edit Want Listing Page
**Description:** As a buyer, I want to edit an existing want listing.

**Acceptance Criteria:**
- [ ] Route: `/buyer/edit-listing/:id` (protected, buyer role)
- [ ] Pre-fills form with existing data (fetches `GET /api/want-listings/:id`)
- [ ] On submit: calls `PUT /api/want-listings/:id`
- [ ] On success: redirects to buyer dashboard
- [ ] Verify in browser: edits persist after save

---

### US-F010: Seller Dashboard
**Description:** As a seller, I want a dashboard to manage my vehicles and see my introductions.

**Acceptance Criteria:**
- [ ] Route: `/seller/dashboard` (protected, seller role)
- [ ] Two sections:
  1. **My Vehicles** — fetches `GET /api/vehicles/mine`, displays as cards with thumbnail, make/model/year/price, link to add new
  2. **My Introductions** — fetches `GET /api/introductions/sent`, shows status of each (pending, accepted, rejected, expired)
- [ ] For accepted intros, shows "Message Buyer" button
- [ ] Notification badge shows unread count
- [ ] Verify in browser: dashboard loads, vehicles and intros display correctly

---

### US-F011: Add Vehicle Page
**Description:** As a seller, I want to add a vehicle to my inventory.

**Acceptance Criteria:**
- [ ] Route: `/seller/add-vehicle` (protected, seller role)
- [ ] Form fields: make, model, year, mileage, price, zip code, description, transmission (optional dropdown), drivetrain (optional dropdown)
- [ ] Image upload section: allows 3–5 images
  - Each image uploads immediately via `POST /api/vehicles/upload-image`
  - Shows thumbnail preview after upload
  - Shows upload progress indicator
  - Can remove an uploaded image before submit
- [ ] On submit: calls `POST /api/vehicles` with collected image URLs
- [ ] On success: redirects to seller dashboard
- [ ] Verify in browser: can upload images and create a vehicle

---

### US-F012: Edit Vehicle Page
**Description:** As a seller, I want to edit my vehicle listing.

**Acceptance Criteria:**
- [ ] Route: `/seller/edit-vehicle/:id` (protected, seller role)
- [ ] Pre-fills form with existing data including image previews
- [ ] Can remove existing images and upload new ones (must maintain 3–5 total)
- [ ] On submit: calls `PUT /api/vehicles/:id`
- [ ] On success: redirects to seller dashboard
- [ ] Verify in browser: edits persist after save

---

### US-F013: Vehicle Matches Page (Seller)
**Description:** As a seller, I want to see which want listings match my vehicle so I can introduce it.

**Acceptance Criteria:**
- [ ] Route: `/seller/vehicles/:id/matches` (protected, seller role)
- [ ] Fetches `GET /api/vehicles/:id/matches`
- [ ] Displays matching want listings as cards
- [ ] Each card has an "Introduce Vehicle" button
- [ ] Clicking "Introduce Vehicle" opens a modal/form to write the intro message (max 500 chars)
- [ ] On submit: calls `POST /api/introductions`
- [ ] On success: card updates to show "Introduced" state, button disabled
- [ ] Verify in browser: matches display, can send introduction

---

### US-F014: Introductions Page
**Description:** As a user, I want a dedicated page to manage all my introductions.

**Acceptance Criteria:**
- [ ] Route: `/introductions` (protected, any role)
- [ ] Buyers see received intros (same as dashboard section but full page, with filtering by status)
- [ ] Sellers see sent intros (same as dashboard section but full page, with filtering by status)
- [ ] Tab or toggle to filter: All, Pending, Accepted, Rejected, Expired
- [ ] Verify in browser: introductions list with filters works

---

### US-F015: Messaging Page (Firebase Integration)
**Description:** As a user with an accepted introduction, I want to message the other party.

**Acceptance Criteria:**
- [ ] Route: `/messages` (protected) — shows list of active conversations
- [ ] Route: `/messages/:introductionId` (protected) — shows a single conversation
- [ ] On first message in a conversation:
  - Frontend creates a Firebase Realtime Database chat room at path `chats/{introductionId}`
  - Stores the `firebase_chat_id` by calling the backend (or uses `introductionId` directly as the chat key)
- [ ] Message structure in Firebase:
  ```json
  {
    "senderId": "uuid",
    "text": "message content",
    "imageUrl": null,
    "timestamp": 1234567890
  }
  ```
- [ ] Chat UI:
  - Message list with sender alignment (own messages right, theirs left)
  - Text input + send button
  - Optional image attachment: uploads to Firebase Storage, sends URL as `imageUrl`
  - Messages load in real-time via Firebase `onValue` listener
  - Auto-scroll to bottom on new messages
- [ ] Conversation list (`/messages`) shows: other party's name, last message preview, unread indicator
- [ ] When a new message is received, calls `POST /api/notifications` to create an in-app notification for the recipient (or handle this via Firebase Cloud Functions in a future iteration — for MVP, the sender's frontend can trigger it)
- [ ] Verify in browser: can send and receive messages in real-time between two users

---

### US-F016: Notifications Dropdown
**Description:** As a user, I want to see my notifications so I don't miss introductions or messages.

**Acceptance Criteria:**
- [ ] Notification bell icon in the top nav bar, visible on all authenticated pages
- [ ] Badge shows unread count (fetches `GET /api/notifications/unread-count` on interval, every 30 seconds)
- [ ] Clicking bell opens a dropdown listing recent notifications
- [ ] Each notification is clickable and navigates to the relevant page (intro page, messages page)
- [ ] "Mark all as read" button calls `PATCH /api/notifications/read-all`
- [ ] Verify in browser: notifications appear after intros are created/accepted

---

### US-F017: Admin Panel
**Description:** As an admin, I want to view and manage users and listings.

**Acceptance Criteria:**
- [ ] Route: `/admin` (protected, admin role)
- [ ] Three tabs: Users, Want Listings, Vehicles
- [ ] **Users tab:** table with id, name, email, role, created date. Search box filters by email. Delete button per row (with confirmation dialog).
- [ ] **Want Listings tab:** table with id, title, make/model, buyer name, status, created date. Delete button per row.
- [ ] **Vehicles tab:** table with id, make/model/year, seller name, price, status, created date. Delete button per row.
- [ ] Delete calls the corresponding `DELETE /api/admin/*` endpoint
- [ ] Paginated tables (50 per page)
- [ ] Verify in browser: admin can view users, listings, vehicles and delete them

---

### US-F018: Navigation & Layout
**Description:** As a user, I need consistent navigation across all pages.

**Acceptance Criteria:**
- [ ] Top nav bar on all pages with:
  - Logo/site name (links to home)
  - If not logged in: Login, Register links
  - If buyer: Home, My Dashboard, Introductions, Messages, notification bell, Logout
  - If seller: Home, My Dashboard, Introductions, Messages, notification bell, Logout
  - If admin: Home, Admin, Logout
- [ ] Responsive: works on desktop (1024px+) and tablet (768px+). Mobile is not a priority but should not be broken.
- [ ] Verify in browser: navigation renders correctly for each role

---

### US-F019: Frontend Deployment to Render
**Description:** As a developer, I need the frontend deployed to Render.

**Acceptance Criteria:**
- [ ] Frontend deployed as a Render "Static Site"
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set in Render: `VITE_API_URL` pointing to the backend Render URL
- [ ] Render rewrite rule: `/*` → `/index.html` (for client-side routing)
- [ ] CORS on the backend is configured to allow the frontend's Render URL
- [ ] Verify in browser: frontend loads from Render URL, can register/login, full flow works

---

## 4. Functional Requirements

### Routing Table

| Route | Page | Auth | Role |
|---|---|---|---|
| `/` | Home (Want Listing Feed) | No | Any |
| `/login` | Login | No | Any |
| `/register` | Register | No | Any |
| `/want-listings/:id` | Want Listing Detail | No | Any |
| `/buyer/dashboard` | Buyer Dashboard | Yes | Buyer |
| `/buyer/create-listing` | Create Want Listing | Yes | Buyer |
| `/buyer/edit-listing/:id` | Edit Want Listing | Yes | Buyer |
| `/seller/dashboard` | Seller Dashboard | Yes | Seller |
| `/seller/add-vehicle` | Add Vehicle | Yes | Seller |
| `/seller/edit-vehicle/:id` | Edit Vehicle | Yes | Seller |
| `/seller/vehicles/:id/matches` | Vehicle Matches | Yes | Seller |
| `/introductions` | Introductions List | Yes | Buyer/Seller |
| `/messages` | Conversations List | Yes | Buyer/Seller |
| `/messages/:introductionId` | Single Conversation | Yes | Buyer/Seller |
| `/admin` | Admin Panel | Yes | Admin |

**FR-F1:** All protected routes redirect to `/login` if unauthenticated.

**FR-F2:** Role-gated routes redirect to `/` if the user has the wrong role.

**FR-F3:** After login/register, users are redirected to their role-specific dashboard: `/buyer/dashboard` for buyers, `/seller/dashboard` for sellers, `/admin` for admins.

### Firebase Chat Rules

**FR-F4:** Firebase Realtime Database security rules must ensure only the two participants of an accepted introduction can read/write to their chat room:
```json
{
  "rules": {
    "chats": {
      "$introductionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
Note: For MVP, basic auth rules are acceptable. Tighter per-user rules can be added in Phase 2.

**FR-F5:** Firebase Authentication is used only for chat room access. The primary auth system is JWT via the backend. On login, the frontend also calls `signInWithCustomToken` using a Firebase custom token generated by the backend (or uses anonymous Firebase auth for simplicity in MVP).

### API Integration

**FR-F6:** The `apiService.js` module must expose functions matching every backend endpoint, e.g.:
- `apiService.auth.register(data)`
- `apiService.auth.login(data)`
- `apiService.wantListings.list(params)`
- `apiService.wantListings.getMine()`
- `apiService.wantListings.create(data)`
- `apiService.wantListings.update(id, data)`
- `apiService.wantListings.archive(id)`
- `apiService.vehicles.create(data)`
- `apiService.vehicles.uploadImage(file)`
- `apiService.vehicles.getMatches(vehicleId)`
- `apiService.introductions.create(data)`
- `apiService.introductions.getReceived(params)`
- `apiService.introductions.getSent(params)`
- `apiService.introductions.accept(id)`
- `apiService.introductions.reject(id)`
- `apiService.notifications.getAll()`
- `apiService.notifications.getUnreadCount()`
- `apiService.notifications.markRead(id)`
- `apiService.notifications.markAllRead()`
- `apiService.admin.getUsers(params)`
- `apiService.admin.deleteUser(id)`
- (etc.)

---

## 5. Non-Goals (Out of Scope)

- Mobile-responsive design beyond "not broken" at small screens
- Mobile app or PWA
- Read receipts or typing indicators in chat
- Social login
- Dark mode or theme customization
- SEO optimization
- Performance optimization (code splitting, lazy loading) — keep it simple
- Automated testing (unit/integration) — manual testing for MVP
- CI/CD pipeline for frontend — use Render's auto-deploy from Git
- Chat notification via Firebase Cloud Functions
- Rich text or markdown in messages
- File attachments other than images in chat
- Offline support

---

## 6. Design Considerations

**UI Approach:** Functional, clean, minimal. No UI component library. Use plain CSS or CSS Modules. The goal is speed of development, not visual polish.

**Layout Pattern:**
- Fixed top nav bar (60px height)
- Content area below, max-width 1200px, centered
- Cards for listings/vehicles: white background, subtle border, consistent padding
- Forms: standard labels above inputs, full width, clear error states

**Key Components to Build:**
- `NavBar` — handles all role-based navigation
- `ListingCard` — reused on home feed, buyer dashboard, matches page
- `VehicleCard` — reused on seller dashboard
- `IntroCard` — reused on buyer dashboard, introductions page
- `NotificationBell` — nav bar dropdown
- `ImageUploader` — handles multi-image upload with preview
- `ProtectedRoute` / `RoleRoute` — route guards
- `Pagination` — "Load More" button component

---

## 7. Technical Considerations

**Dependencies (npm packages):**
- `react`, `react-dom` — core
- `react-router-dom` — routing
- `axios` — HTTP client
- `firebase` — Firebase client SDK (Realtime DB + Storage + Auth)
- `jwt-decode` — decode JWT for expiry check (no verification on frontend)

**Firebase Setup:**
- Create a Firebase project with Realtime Database and Storage enabled
- Configure Firebase security rules for chat
- Frontend initializes Firebase with config from env vars

**Render Deployment (Static Site):**
- Connect GitHub repo to Render
- Build command: `npm run build`
- Publish directory: `dist`
- Add rewrite rule: `/*` → `/index.html` (200)
- Set environment variables in Render dashboard

**Concurrent Development Strategy:**
- Frontend can be built before the backend is ready
- Create a `/src/services/mockData.js` with fake responses for all endpoints
- `apiService.js` can conditionally use mock data when `VITE_USE_MOCKS=true`
- Remove mocks when backend is live

---

## 8. Success Metrics

- All 19 user stories pass acceptance criteria
- A user can register as a buyer, create a want listing, and see it in the feed
- A user can register as a seller, add a vehicle, see matching listings, and send an introduction
- A buyer can accept an intro and exchange messages with the seller via Firebase
- An admin can log in and view/delete users and listings
- The full app is deployed to Render (frontend + backend) and accessible via URL

---

## 9. Resolved Decisions

- **D1: Firebase auth for chat** — Use Firebase anonymous auth for MVP. No custom tokens. Upgrade to custom tokens in Phase 2 if needed.
- **D2: No "How It Works" page** — Skip it. The feed is the home page. No pages that don't validate the core thesis.
- **D3: Image upload UX** — Spinner only. No percentage-based progress bar.
