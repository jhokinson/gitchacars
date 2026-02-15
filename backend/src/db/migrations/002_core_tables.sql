CREATE TABLE IF NOT EXISTS want_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_min INTEGER NOT NULL,
  year_max INTEGER NOT NULL,
  budget_min DECIMAL(12,2) NOT NULL,
  budget_max DECIMAL(12,2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  radius_miles INTEGER NOT NULL,
  mileage_max INTEGER NOT NULL,
  description TEXT NOT NULL,
  transmission VARCHAR(20) CHECK (transmission IN ('automatic', 'manual')),
  drivetrain VARCHAR(10) CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
  condition VARCHAR(10) CHECK (condition IN ('new', 'used')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_want_listings_status ON want_listings(status);
CREATE INDEX IF NOT EXISTS idx_want_listings_make_model ON want_listings(LOWER(make), LOWER(model));
CREATE INDEX IF NOT EXISTS idx_want_listings_user ON want_listings(user_id);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL,
  transmission VARCHAR(20) CHECK (transmission IN ('automatic', 'manual')),
  drivetrain VARCHAR(10) CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(LOWER(make), LOWER(model));

CREATE TABLE IF NOT EXISTS introductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  want_listing_id UUID NOT NULL REFERENCES want_listings(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vehicle_id, want_listing_id)
);

CREATE INDEX IF NOT EXISTS idx_introductions_seller ON introductions(seller_id);
CREATE INDEX IF NOT EXISTS idx_introductions_buyer ON introductions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_introductions_status ON introductions(status);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
