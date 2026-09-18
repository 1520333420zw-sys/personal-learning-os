CREATE TABLE IF NOT EXISTS external_writes (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'revoke_requested', 'reverted', 'cancelled')),
  command_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  UNIQUE (owner_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS external_writes_inbox ON external_writes (owner_id, status, seq);
