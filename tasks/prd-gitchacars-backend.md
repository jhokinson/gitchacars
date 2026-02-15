# PRD: GitchaCars MVP — Backend Foundation

## 1. Introduction/Overview

GitchaCars is a demand-first car marketplace where **buyers post want listings** (what they're looking for) and **sellers introduce private vehicles** to matching buyers. This PRD covers the entire backend: auth, database schema, all CRUD APIs, matching logic, introduction system, notifications, email triggers, and admin endpoints.

**Tech Stack:**
- **Runtime:** Node.js + Express
- **Database:** Neon (Serverless Postgres)
- **Image Storage:** Firebase Storage
- **Email:** SendGrid
- **Chat:** Firebase Realtime Database (referenced, not implemented here — see Frontend PRD)
- **Hosting:** Render (Web Service)

This PRD can be built **concurrently** with the Frontend PRD. The API contract defined here serves as the integration interface.

---

## 2. Goals

- Stand up a complete REST API that supports all MVP flows: auth, want listings, vehicles, matching, introductions, notifications, and admin.
- Deploy to Render as a single Node.js service connected to Neon Postgres.
- Keep the codebase minimal — no premature abstractions, no unused middleware, no feature flags.
- Provide clear API responses so the frontend team can integrate without ambiguity.

---

## 3. User Stories

### US-B001: User Registration
**Description:** As a new user, I want to register with my email and password so that I can access the marketplace.

**Acceptance Criteria:**
- [ ] `POST /api/auth/register` accepts `{ email, password, firstName, lastName, role }` where role is `buyer` or `seller`
- [ ] Password is hashed with bcrypt (min 10 rounds)
- [ ] Email must be unique — returns 409 if duplicate
- [ ] Role must be exactly `buyer` or `seller` — returns 400 otherwise
- [ ] Returns `{ user: { id, email, firstName, lastName, role, createdAt }, token }` on success (201)
- [ ] JWT token contains `{ userId, role }` and expires in 7 days
- [ ] A welcome email is sent via SendGrid on successful registration
- [ ] A row is inserted into the `users` table

---

### US-B002: User Login
**Description:** As a registered user, I want to log in so that I can access my dashboard.

**Acceptance Criteria:**
- [ ] `POST /api/auth/login` accepts `{ email, password }`
- [ ] Returns 401 for invalid credentials (generic message, no email/password distinction)
- [ ] Returns `{ user: { id, email, firstName, lastName, role, createdAt }, token }` on success (200)
- [ ] JWT token is identical in structure to registration token

---

### US-B003: Auth Middleware
**Description:** As a developer, I need JWT middleware so that protected routes reject unauthenticated requests.

**Acceptance Criteria:**
- [ ] Middleware reads `Authorization: Bearer <token>` header
- [ ] Returns 401 if token is missing, expired, or invalid
- [ ] Attaches `req.user = { userId, role }` on success
- [ ] A role-check helper function exists: `requireRole('buyer')`, `requireRole('seller')`, `requireRole('admin')`

---

### US-B004: Create Want Listing
**Description:** As a buyer, I want to create a want listing describing the car I'm looking for so that sellers can find me.

**Acceptance Criteria:**
- [ ] `POST /api/want-listings` (auth required, buyer role)
- [ ] Required fields: `title`, `make`, `model`, `yearMin`, `yearMax`, `budgetMin`, `budgetMax`, `zipCode`, `radiusMiles`, `mileageMax`, `description`
- [ ] Optional fields: `transmission` (enum: `automatic`, `manual`), `drivetrain` (enum: `fwd`, `rwd`, `awd`, `4wd`), `condition` (enum: `new`, `used`)
- [ ] Returns 400 with field-level errors if validation fails
- [ ] `yearMin` <= `yearMax`, `budgetMin` <= `budgetMax` — validated server-side
- [ ] Returns the created listing with `id`, `status: 'active'`, `createdAt` (201)
- [ ] Listing is associated with the authenticated buyer's `userId`

---

### US-B005: Edit Want Listing
**Description:** As a buyer, I want to edit my want listing so that I can update my preferences.

**Acceptance Criteria:**
- [ ] `PUT /api/want-listings/:id` (auth required, buyer role)
- [ ] Only the owner can edit — returns 403 otherwise
- [ ] Accepts any subset of the create fields (partial update)
- [ ] Same validation rules as create
- [ ] Returns updated listing (200)

---

### US-B006: Archive Want Listing
**Description:** As a buyer, I want to archive my want listing so that I stop receiving introductions.

**Acceptance Criteria:**
- [ ] `PATCH /api/want-listings/:id/archive` (auth required, buyer role)
- [ ] Only the owner can archive — returns 403 otherwise
- [ ] Sets `status` to `archived`
- [ ] Archived listings do not appear in matching queries
- [ ] Returns updated listing (200)

---

### US-B007: View My Want Listings
**Description:** As a buyer, I want to see all my want listings so that I can manage them.

**Acceptance Criteria:**
- [ ] `GET /api/want-listings/mine` (auth required, buyer role)
- [ ] Returns all listings for the authenticated user, ordered by `createdAt` desc
- [ ] Each listing includes an `introCount` field (number of pending + accepted intros)

---

### US-B008: Public Want Listing Feed
**Description:** As any user, I want to browse active want listings so that sellers can find buyers to introduce to.

**Acceptance Criteria:**
- [ ] `GET /api/want-listings` (public, no auth required)
- [ ] Returns only `status: 'active'` listings, ordered by `createdAt` desc
- [ ] Supports pagination: `?page=1&limit=20` (default limit 20, max 50)
- [ ] Returns `{ listings: [...], total, page, totalPages }`
- [ ] Each listing includes `buyer: { id, firstName }` (no email exposed)

---

### US-B009: Get Single Want Listing
**Description:** As a user, I want to view a single want listing's details.

**Acceptance Criteria:**
- [ ] `GET /api/want-listings/:id` (public)
- [ ] Returns the full listing object including buyer first name
- [ ] Returns 404 if not found or archived (unless requester is the owner)

---

### US-B010: Add Vehicle
**Description:** As a seller, I want to add a vehicle to my inventory so that I can introduce it to buyers.

**Acceptance Criteria:**
- [ ] `POST /api/vehicles` (auth required, seller role)
- [ ] Required fields: `make`, `model`, `year`, `mileage`, `price`, `zipCode`, `description`
- [ ] Required: `images` — array of 3 to 5 image URLs (uploaded separately, see US-B011)
- [ ] Optional fields: `transmission` (enum: `automatic`, `manual`), `drivetrain` (enum: `fwd`, `rwd`, `awd`, `4wd`)
- [ ] Returns 400 with field-level errors if validation fails
- [ ] Returns the created vehicle with `id`, `status: 'active'`, `createdAt` (201)

---

### US-B011: Upload Vehicle Image
**Description:** As a seller, I want to upload images for my vehicle listing.

**Acceptance Criteria:**
- [ ] `POST /api/vehicles/upload-image` (auth required, seller role)
- [ ] Accepts a single image file via `multipart/form-data` (field name: `image`)
- [ ] Validates: JPEG or PNG only, max 5MB
- [ ] Uploads to Firebase Storage under path `vehicles/{userId}/{uuid}.{ext}`
- [ ] Returns `{ url }` — the public download URL (200)
- [ ] The seller collects URLs from this endpoint, then passes them in the `images` array when creating/editing a vehicle

---

### US-B012: Edit Vehicle
**Description:** As a seller, I want to edit my vehicle listing.

**Acceptance Criteria:**
- [ ] `PUT /api/vehicles/:id` (auth required, seller role)
- [ ] Only the owner can edit — returns 403 otherwise
- [ ] Accepts any subset of create fields (partial update)
- [ ] If `images` is provided, it replaces the full array (must still be 3–5)
- [ ] Returns updated vehicle (200)

---

### US-B013: View My Vehicles
**Description:** As a seller, I want to see all my vehicles so that I can manage my inventory.

**Acceptance Criteria:**
- [ ] `GET /api/vehicles/mine` (auth required, seller role)
- [ ] Returns all vehicles for the authenticated user, ordered by `createdAt` desc

---

### US-B014: Get Single Vehicle
**Description:** As a user viewing an introduction, I want to see a vehicle's full details.

**Acceptance Criteria:**
- [ ] `GET /api/vehicles/:id` (auth required)
- [ ] Returns full vehicle object including all images
- [ ] Returns 404 if not found

---

### US-B015: Match Want Listings for a Seller's Vehicle
**Description:** As a seller, I want to see which want listings match my vehicle so that I can introduce it.

**Acceptance Criteria:**
- [ ] `GET /api/vehicles/:id/matches` (auth required, seller role, must own the vehicle)
- [ ] Returns want listings where ALL of the following are true:
  - `want_listing.make` = `vehicle.make` (case-insensitive)
  - `want_listing.model` = `vehicle.model` (case-insensitive)
  - `vehicle.year` BETWEEN `want_listing.yearMin` AND `want_listing.yearMax`
  - `vehicle.price` BETWEEN `want_listing.budgetMin` AND `want_listing.budgetMax`
  - `vehicle.mileage` <= `want_listing.mileageMax`
  - Distance between `vehicle.zipCode` and `want_listing.zipCode` <= `want_listing.radiusMiles`
- [ ] Only returns `status: 'active'` want listings
- [ ] Does NOT return listings where an introduction already exists from this vehicle
- [ ] Location distance is calculated using the Haversine formula on zip code lat/lng (use a static zip-to-lat/lng lookup table or npm package)
- [ ] Returns matches ordered by `createdAt` desc, paginated (default 20)

---

### US-B016: Create Introduction
**Description:** As a seller, I want to introduce my vehicle to a buyer's want listing so that we can connect.

**Acceptance Criteria:**
- [ ] `POST /api/introductions` (auth required, seller role)
- [ ] Accepts `{ vehicleId, wantListingId, message }`
- [ ] `message` is required, max 500 characters
- [ ] Validates: seller owns the vehicle, want listing is active, no existing intro for this vehicle+listing pair
- [ ] Creates introduction with `status: 'pending'`, `expiresAt` = now + 72 hours
- [ ] Creates an in-app notification for the buyer (type: `new_intro`)
- [ ] Sends a SendGrid email to the buyer (template: new introduction received)
- [ ] Returns the created introduction (201)

---

### US-B017: View My Introductions (Buyer)
**Description:** As a buyer, I want to see all introductions sent to my want listings.

**Acceptance Criteria:**
- [ ] `GET /api/introductions/received` (auth required, buyer role)
- [ ] Returns intros where the want listing belongs to the authenticated buyer
- [ ] Each intro includes: seller first name, vehicle summary (make, model, year, price, first image), intro message, status, createdAt
- [ ] Ordered by `createdAt` desc
- [ ] Supports filter: `?status=pending` or `?status=accepted` or `?status=rejected` or `?status=expired`

---

### US-B018: View My Introductions (Seller)
**Description:** As a seller, I want to see all introductions I've sent.

**Acceptance Criteria:**
- [ ] `GET /api/introductions/sent` (auth required, seller role)
- [ ] Returns intros where the vehicle belongs to the authenticated seller
- [ ] Each intro includes: buyer first name, want listing summary, vehicle summary, status, createdAt
- [ ] Ordered by `createdAt` desc

---

### US-B019: Accept Introduction
**Description:** As a buyer, I want to accept an introduction so that I can message the seller.

**Acceptance Criteria:**
- [ ] `PATCH /api/introductions/:id/accept` (auth required, buyer role)
- [ ] Only the buyer who owns the want listing can accept
- [ ] Only `pending` intros can be accepted — returns 400 otherwise
- [ ] Sets `status` to `accepted`
- [ ] Creates an in-app notification for the seller (type: `intro_accepted`)
- [ ] Sends a SendGrid email to the seller (template: your introduction was accepted)
- [ ] Returns updated introduction (200)

---

### US-B020: Reject Introduction
**Description:** As a buyer, I want to reject an introduction I'm not interested in.

**Acceptance Criteria:**
- [ ] `PATCH /api/introductions/:id/reject` (auth required, buyer role)
- [ ] Only the buyer who owns the want listing can reject
- [ ] Only `pending` intros can be rejected
- [ ] Sets `status` to `rejected`
- [ ] No notification sent on rejection
- [ ] Returns updated introduction (200)

---

### US-B021: Expire Stale Introductions
**Description:** As the system, introductions not acted on within 72 hours should auto-expire.

**Acceptance Criteria:**
- [ ] A scheduled task runs every hour (use `node-cron` or a simple `setInterval`)
- [ ] Finds all introductions where `status = 'pending'` AND `expiresAt < NOW()`
- [ ] Updates their status to `expired`
- [ ] No notifications sent on expiry

---

### US-B022: In-App Notifications
**Description:** As a user, I want to see my notifications so I know when something happens.

**Acceptance Criteria:**
- [ ] `GET /api/notifications` (auth required)
- [ ] Returns notifications for the authenticated user, ordered by `createdAt` desc
- [ ] Each notification: `{ id, type, message, read, relatedId, createdAt }`
- [ ] `type` is one of: `new_intro`, `intro_accepted`, `new_message`
- [ ] `PATCH /api/notifications/:id/read` marks a single notification as read
- [ ] `PATCH /api/notifications/read-all` marks all as read
- [ ] `GET /api/notifications/unread-count` returns `{ count }` for badge display

---

### US-B023: SendGrid Email Triggers
**Description:** As the system, I need to send transactional emails at key moments.

**Acceptance Criteria:**
- [ ] Welcome email sent on registration (US-B001)
- [ ] New introduction email sent to buyer when intro is created (US-B016)
- [ ] Introduction accepted email sent to seller when buyer accepts (US-B019)
- [ ] All emails use SendGrid's `send` API with dynamic templates
- [ ] Email sending is fire-and-forget (do not block the API response on email delivery)
- [ ] Failed email sends are logged but do not cause API errors

---

### US-B024: Admin — View Users
**Description:** As an admin, I want to see all registered users.

**Acceptance Criteria:**
- [ ] `GET /api/admin/users` (auth required, admin role)
- [ ] Returns all users with `{ id, email, firstName, lastName, role, createdAt }`
- [ ] Paginated: `?page=1&limit=50`
- [ ] Supports search by email: `?search=jake`

---

### US-B025: Admin — View Listings
**Description:** As an admin, I want to see all want listings and vehicles.

**Acceptance Criteria:**
- [ ] `GET /api/admin/want-listings` (auth required, admin role) — returns all, any status
- [ ] `GET /api/admin/vehicles` (auth required, admin role) — returns all, any status
- [ ] Both paginated with `?page=1&limit=50`

---

### US-B026: Admin — Delete User
**Description:** As an admin, I want to delete a user and their associated data.

**Acceptance Criteria:**
- [ ] `DELETE /api/admin/users/:id` (auth required, admin role)
- [ ] Soft-deletes the user (sets `deletedAt` timestamp, does NOT remove from DB)
- [ ] Deactivates all of the user's want listings and vehicles (status → `deleted`)
- [ ] Returns 200 with `{ message: 'User deleted' }`

---

### US-B027: Admin — Delete Listing/Vehicle
**Description:** As an admin, I want to remove inappropriate listings or vehicles.

**Acceptance Criteria:**
- [ ] `DELETE /api/admin/want-listings/:id` (auth required, admin role)
- [ ] `DELETE /api/admin/vehicles/:id` (auth required, admin role)
- [ ] Both set `status` to `deleted` (soft delete)
- [ ] Returns 200

---

### US-B028: Database Schema Setup
**Description:** As a developer, I need the Neon Postgres schema created so all other stories can work.

**Acceptance Criteria:**
- [ ] Migration file creates all 6 tables (see Section 4 for exact schema)
- [ ] All foreign keys, indexes, and constraints are in place
- [ ] Migration can be run via `npm run migrate`
- [ ] A seed script exists for development: creates 1 admin, 2 buyers, 2 sellers, sample listings and vehicles (`npm run seed`)

---

### US-B029: Project Scaffolding & Deployment
**Description:** As a developer, I need the Express project structure set up and deployable to Render.

**Acceptance Criteria:**
- [ ] Project structure:
  ```
  /src
    /routes       — route files
    /controllers  — request handlers
    /models       — database query functions
    /middleware    — auth, validation, error handler
    /services     — sendgrid, firebase
    /utils        — helpers
    /db
      /migrations
      /seeds
    app.js        — Express app setup
    server.js     — Entry point
  ```
- [ ] Environment variables loaded via `dotenv`: `DATABASE_URL`, `JWT_SECRET`, `SENDGRID_API_KEY`, `FIREBASE_*` config
- [ ] CORS configured to allow frontend origin
- [ ] Global error handling middleware (returns JSON, no stack traces in production)
- [ ] Health check endpoint: `GET /api/health` returns `{ status: 'ok' }`
- [ ] `package.json` scripts: `start`, `dev` (nodemon), `migrate`, `seed`
- [ ] Deployable to Render as a Node.js Web Service (uses `npm start`)

---

## 4. Functional Requirements

### Database Schema

**FR-1:** The `users` table must have:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**FR-2:** The `want_listings` table must have:
```sql
CREATE TABLE want_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_min INTEGER NOT NULL,
  year_max INTEGER NOT NULL,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  radius_miles INTEGER NOT NULL,
  mileage_max INTEGER NOT NULL,
  description TEXT NOT NULL,
  transmission VARCHAR(20),
  drivetrain VARCHAR(10),
  condition VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_want_listings_status ON want_listings(status);
CREATE INDEX idx_want_listings_make_model ON want_listings(LOWER(make), LOWER(model));
CREATE INDEX idx_want_listings_user ON want_listings(user_id);
```

**FR-3:** The `vehicles` table must have:
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price INTEGER NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL,
  transmission VARCHAR(20),
  drivetrain VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_make_model ON vehicles(LOWER(make), LOWER(model));
```

**FR-4:** The `introductions` table must have:
```sql
CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  want_listing_id UUID NOT NULL REFERENCES want_listings(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  message VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  firebase_chat_id VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, want_listing_id)
);
CREATE INDEX idx_introductions_buyer ON introductions(buyer_id, status);
CREATE INDEX idx_introductions_seller ON introductions(seller_id);
CREATE INDEX idx_introductions_expiry ON introductions(status, expires_at);
```

**FR-5:** The `notifications` table must have:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  message VARCHAR(500) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

**FR-6:** A `zip_codes` reference table for location matching:
```sql
CREATE TABLE zip_codes (
  zip VARCHAR(10) PRIMARY KEY,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL
);
```
Seeded with US zip code data (free dataset, ~40k rows).

### API Behavior

**FR-7:** All API responses must use consistent JSON shape:
- Success: `{ data: ... }` or `{ data: ..., total, page, totalPages }` for paginated
- Error: `{ error: { message: '...', fields: { ... } } }` for validation, `{ error: { message: '...' } }` for others

**FR-8:** All timestamps in API responses must be ISO 8601 format.

**FR-9:** The matching query (US-B015) must use a SQL function or query that calculates distance using Haversine formula joining through the `zip_codes` table.

**FR-10:** The introduction expiry job (US-B021) must run within the same Node.js process using `node-cron`, scheduled for every hour.

**FR-11:** Firebase Storage upload (US-B011) must use the Firebase Admin SDK server-side. The client sends the raw image file to the Express API, which uploads it to Firebase Storage and returns the public URL.

**FR-12:** SendGrid integration must use `@sendgrid/mail` with dynamic templates. Template IDs are stored as environment variables.

---

## 5. Non-Goals (Out of Scope)

- Social login (Google, Facebook, Apple)
- Subscription tiers or payment processing
- Stripe integration
- AI/ML-based matching or scoring
- VIN lookup or Carfax integration
- Dealer accounts or bulk upload
- Analytics dashboard or reporting
- Auction mode
- Market reports or pricing intelligence
- Engagement/nurture email campaigns
- Weekly summary emails
- GraphQL API
- WebSocket or SSE for real-time notifications
- Rate limiting (add in Phase 2)
- Firebase chat implementation (handled in Frontend PRD)
- Frontend implementation (handled in Frontend PRD)

---

## 6. Technical Considerations

**Dependencies (npm packages):**
- `express` — web framework
- `pg` — Postgres client (use raw queries, no ORM)
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT generation/verification
- `multer` — multipart file upload handling
- `firebase-admin` — Firebase Storage uploads
- `@sendgrid/mail` — transactional email
- `node-cron` — scheduled tasks
- `dotenv` — environment variables
- `cors` — CORS middleware
- `express-validator` — request validation
- `nodemon` (dev) — auto-restart

**Neon Connection:**
- Use `DATABASE_URL` connection string with SSL enabled
- Use connection pooling (Neon's pooler endpoint)
- No ORM — write raw SQL for clarity and control

**Render Deployment:**
- Deploy as a "Web Service" on Render
- Set environment variables in Render dashboard
- Use Render's auto-deploy from Git (connect repo)
- Node.js build command: `npm install`
- Start command: `npm start`

---

## 7. Success Metrics

- All 29 user stories pass acceptance criteria
- API responds to all endpoints with correct status codes and response shapes
- Matching query returns accurate results based on hard filters
- Introduction flow works end-to-end: create → notify → accept → ready for chat
- Emails are delivered via SendGrid for all 3 trigger events
- Deployed and running on Render with Neon database connected

---

## 8. Resolved Decisions

- **D1: SendGrid emails** — Simple text-based emails. No HTML templates or branding for MVP.
- **D2: Zip code dataset** — Seed all US zip codes (~40k rows). Full coverage from day one.
- **D3: Admin user** — Seed one admin user via `npm run seed` with email `jhokinson@gmail.com`. No self-registration for admin role.
