-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_versions (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT NOT NULL,
    api_key_required INTEGER NOT NULL DEFAULT 1,
    base_url TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    release_date TEXT,
    supported_features TEXT NOT NULL, -- JSON string of SupportedFeatures
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    provider_id TEXT NOT NULL,
    model_family TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    context_window INTEGER NOT NULL,
    max_tokens INTEGER,
    input_price_per_token TEXT NOT NULL,
    output_price_per_token TEXT NOT NULL,
    max_concurrent_requests INTEGER,
    supported_features TEXT NOT NULL, -- JSON string of SupportedFeatures
    version TEXT,
    training_cutoff TEXT,
    release_date TEXT,
    default_temperature REAL,
    min_temperature REAL,
    max_temperature REAL,
    default_top_p REAL,
    default_top_k REAL,
    type TEXT NOT NULL DEFAULT 'proprietary',
    reasoning INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    parameters TEXT, -- JSON string of parameters
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Template versions table
CREATE TABLE IF NOT EXISTS template_versions (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    parameters TEXT, -- JSON string of parameters
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    model_id TEXT NOT NULL,
    template_id TEXT,
    last_migration_check TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Prompt runs table
CREATE TABLE IF NOT EXISTS prompt_runs (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    content TEXT NOT NULL,
    completion TEXT NOT NULL,
    usage TEXT NOT NULL, -- JSON string of Usage
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id),
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Provider API keys table
CREATE TABLE IF NOT EXISTS provider_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_provider_id ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_prompts_template_id ON prompts(template_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model_id ON prompts(model_id);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_prompt_id ON prompt_runs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_model_id ON prompt_runs(model_id);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_provider_id ON prompt_runs(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_api_keys_provider_id ON provider_api_keys(provider_id); 