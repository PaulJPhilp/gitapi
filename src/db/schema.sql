CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT NOT NULL,
    api_key_required INTEGER NOT NULL,
    base_url TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    release_date TEXT,
    supported_features TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    provider_id TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    model_family TEXT,
    context_window INTEGER NOT NULL,
    max_tokens INTEGER,
    input_price_per_token TEXT NOT NULL,
    output_price_per_token TEXT NOT NULL,
    supported_features TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    model_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompt_runs (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    content TEXT NOT NULL,
    completion TEXT NOT NULL,
    usage TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_api_keys (
    provider_id TEXT PRIMARY KEY,
    api_key TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
); 