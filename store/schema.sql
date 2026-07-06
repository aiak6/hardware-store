-- schema.sql — run once against a NEW database (rack_and_reason).
-- The app also creates this table automatically on boot; this file is for reference.

CREATE TABLE IF NOT EXISTS quote_requests (
  id            SERIAL PRIMARY KEY,
  customer_name TEXT        NOT NULL,
  contact       TEXT        NOT NULL,
  customer_type TEXT,
  model_name    TEXT,
  build_summary TEXT,
  total_price   BIGINT,
  total_watts   BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
