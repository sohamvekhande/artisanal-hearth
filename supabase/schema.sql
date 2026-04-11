-- ============================================================
--  The Artisanal Hearth — Supabase Schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name        TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 80),
  phone                TEXT NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
  address              TEXT NOT NULL CHECK (char_length(address) BETWEEN 5 AND 300),
  items                JSONB NOT NULL,
  total_amount         NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  special_instructions TEXT DEFAULT '',
  status               TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','preparing','ready','delivered','cancelled')),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
--  RESERVATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name   TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 2 AND 50),
  last_name    TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 50),
  email        TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  phone        TEXT NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
  date         DATE NOT NULL,
  time         TIME NOT NULL,
  guests       INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 20),
  occasion     TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'confirmed'
                 CHECK (status IN ('confirmed','cancelled','completed')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  CONTACT MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  email      TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1000),
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  ROW-LEVEL SECURITY (RLS)
--  Public: INSERT only on orders, reservations, contact_messages
--  Admin:  full access via service key (bypasses RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anonymous users submitting forms)
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_insert_reservations"
  ON reservations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_insert_contact"
  ON contact_messages FOR INSERT TO anon WITH CHECK (true);

-- No public SELECT/UPDATE/DELETE — admin only via service key
-- The service key on the backend bypasses RLS by design.

-- ─────────────────────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created     ON orders(created_at DESC);
CREATE INDEX idx_reservations_date  ON reservations(date);
CREATE INDEX idx_messages_read      ON contact_messages(read);
