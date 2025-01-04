-- Initial Schema Migration
-- Matches domain models from domain/README.md

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
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_enabled BOOLEAN DEFAULT true,
    supported_features TEXT NOT NULL -- JSON string of SupportedFeatures
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_enabled BOOLEAN DEFAULT true,
    model_family TEXT NOT NULL,
    context_window INTEGER NOT NULL,
    max_tokens INTEGER NOT NULL,
    input_price_per_token TEXT NOT NULL,
    output_price_per_token TEXT NOT NULL,
    type TEXT NOT NULL,
    reasoning BOOLEAN DEFAULT false,
    supported_features TEXT NOT NULL, -- JSON string of SupportedFeatures
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    parameters TEXT, -- JSON string of parameters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template versions table
CREATE TABLE IF NOT EXISTS template_versions (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    parameters TEXT, -- JSON string of parameters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    parameters TEXT, -- JSON string of parameters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id),
    FOREIGN KEY (model_id) REFERENCES models(id)
);

-- Prompt runs table
CREATE TABLE IF NOT EXISTS prompt_runs (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    status TEXT NOT NULL,
    result TEXT,
    error TEXT,
    usage TEXT, -- JSON string of Usage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

-- Provider API keys table
CREATE TABLE IF NOT EXISTS provider_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Insert initial schema version
INSERT INTO schema_versions (version, description) VALUES (1, 'Initial schema');

-- Create indexes
CREATE INDEX idx_models_provider_id ON models(provider_id);
CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX idx_prompts_template_id ON prompts(template_id);
CREATE INDEX idx_prompts_model_id ON prompts(model_id);
CREATE INDEX idx_prompt_runs_prompt_id ON prompt_runs(prompt_id);
CREATE INDEX idx_provider_api_keys_provider_id ON provider_api_keys(provider_id); 