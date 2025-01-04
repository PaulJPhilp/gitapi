-- Drop existing tables if they exist
DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS provider_api_keys;

-- Create providers table
CREATE TABLE providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT NOT NULL,
    api_key_required INTEGER NOT NULL DEFAULT 1,
    base_url TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    release_date TEXT,
    supported_features TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create models table
CREATE TABLE models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    provider_id TEXT NOT NULL,
    model_family TEXT NOT NULL,
    context_window INTEGER NOT NULL,
    max_tokens INTEGER,
    input_price_per_token TEXT NOT NULL,
    output_price_per_token TEXT NOT NULL,
    release_date TEXT,
    type TEXT NOT NULL DEFAULT 'proprietary',
    reasoning INTEGER NOT NULL DEFAULT 0,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    supported_features TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Create provider_api_keys table
CREATE TABLE provider_api_keys (
    provider_id TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
); 