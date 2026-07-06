// db.js — Postgres connection + quote-request storage.
// A NEW database, separate from the investment app. Never touches that app.

const { Pool } = require("pg");

// Connection comes from environment. See .env.example.
// Default database name is intentionally its own: rack_and_reason
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://localhost:5432/rack_and_reason",
});

// Create the table on boot if it isn't there yet.
async function init() {
  await pool.query(`
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
  `);
}

// Save a request, return the new row (including its request number = id).
async function saveRequest(r) {
  const { rows } = await pool.query(
    `INSERT INTO quote_requests
       (customer_name, contact, customer_type, model_name, build_summary, total_price, total_watts)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      r.customer_name,
      r.contact,
      r.customer_type || null,
      r.model_name || null,
      r.build_summary || null,
      r.total_price || null,
      r.total_watts || null,
    ]
  );
  return rows[0];
}

// List all requests, newest first (for /requests).
async function listRequests() {
  const { rows } = await pool.query(
    `SELECT * FROM quote_requests ORDER BY id DESC`
  );
  return rows;
}

module.exports = { pool, init, saveRequest, listRequests };
