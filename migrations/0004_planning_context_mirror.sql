CREATE TABLE IF NOT EXISTS planning_context_mirror (
  owner_id TEXT PRIMARY KEY,
  context_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
