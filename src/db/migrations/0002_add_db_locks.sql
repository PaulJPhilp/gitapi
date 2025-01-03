CREATE TABLE IF NOT EXISTS db_locks (
    id TEXT PRIMARY KEY,
    locked_at TEXT NOT NULL,
    lock_timeout INTEGER NOT NULL DEFAULT 30000
);

CREATE INDEX idx_db_locks_locked_at ON db_locks(locked_at); 