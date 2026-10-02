CREATE TABLE IF NOT EXISTS cloud_account (
  id TEXT PRIMARY KEY,
  recovery_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cloud_account_session (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES cloud_account(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS cloud_account_session_account ON cloud_account_session(account_id, expires_at);

CREATE TABLE IF NOT EXISTS cloud_state (
  account_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by_device TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES cloud_account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cloud_state_backup (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  state_json TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES cloud_account(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS cloud_state_backup_account ON cloud_state_backup(account_id, created_at DESC);
