CREATE TABLE IF NOT EXISTS study_session_mirror (
  owner_id TEXT NOT NULL,
  id TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  subject_name_en TEXT,
  chapter_id TEXT,
  chapter_title TEXT,
  chapter_title_en TEXT,
  local_date TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL,
  item_count INTEGER,
  incorrect_count INTEGER,
  updated_at TEXT NOT NULL,
  mirrored_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, id)
);

CREATE INDEX IF NOT EXISTS study_session_mirror_date ON study_session_mirror (owner_id, local_date);
CREATE INDEX IF NOT EXISTS study_session_mirror_subject_date ON study_session_mirror (owner_id, subject_id, local_date);

CREATE TABLE IF NOT EXISTS learning_task_mirror (
  owner_id TEXT NOT NULL,
  id TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  subject_name_en TEXT,
  chapter_id TEXT,
  chapter_title TEXT,
  chapter_title_en TEXT,
  task_date TEXT NOT NULL,
  title TEXT NOT NULL,
  planned_minutes INTEGER NOT NULL,
  actual_minutes INTEGER NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  mirrored_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, id)
);

CREATE INDEX IF NOT EXISTS learning_task_mirror_date ON learning_task_mirror (owner_id, task_date);

CREATE TABLE IF NOT EXISTS learning_mirror_tombstone (
  owner_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('study_session', 'task')),
  entity_id TEXT NOT NULL,
  deleted_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, entity_type, entity_id)
);
