#!/bin/bash
set -e  # Exit on any error

# Load seed data for validation
SEED_DATA=$(bun run --bun - << 'EOF'
const providers = require("./scripts/seed-data/providers.json").providers;
const models = require("./scripts/seed-data/models.json").models;
console.log(JSON.stringify({
    providerCount: providers.length,
    providerIds: providers.map(p => p.id),
    modelCount: models.length,
    modelIds: models.map(m => m.id),
    modelsByProvider: Object.fromEntries(
        providers.map(p => [
            p.id, 
            models.filter(m => m.providerId === p.id).length
        ])
    )
}));
EOF
)

# Parse seed data into variables
EXPECTED_PROVIDER_COUNT=$(echo $SEED_DATA | jq -r '.providerCount')
EXPECTED_MODEL_COUNT=$(echo $SEED_DATA | jq -r '.modelCount')
PROVIDER_IDS=$(echo $SEED_DATA | jq -r '.providerIds[]')
MODEL_IDS=$(echo $SEED_DATA | jq -r '.modelIds[]')

echo "🔄 Starting magic-init sequence..."

# 1. Stop the database server
echo "⏹️  Stopping database server..."
if [ -f "local.db-shm" ] || [ -f "local.db-wal" ]; then
    rm -f local.db-shm local.db-wal
    echo "   Cleaned up database lock files"
fi

# 2. Clear all tables
echo "🧹 Clearing all tables..."
sqlite3 local.db << 'END_SQL'
DELETE FROM prompt_runs;
DELETE FROM prompts;
DELETE FROM models;
DELETE FROM provider_api_keys;
DELETE FROM providers;
END_SQL

# 3. Verify empty tables
echo "🔍 Verifying empty tables..."
COUNTS=$(sqlite3 local.db << 'END_SQL'
SELECT 'Prompt Runs: ' || COUNT(*) FROM prompt_runs
UNION ALL
SELECT 'Prompts: ' || COUNT(*) FROM prompts
UNION ALL
SELECT 'Models: ' || COUNT(*) FROM models
UNION ALL
SELECT 'Provider API Keys: ' || COUNT(*) FROM provider_api_keys
UNION ALL
SELECT 'Providers: ' || COUNT(*) FROM providers;
END_SQL
)

echo "$COUNTS"

# Check if any table has rows
if echo "$COUNTS" | grep -q '[1-9]'; then
    echo "❌ Error: Some tables still have data"
    exit 1
fi

# 4. Seed providers
echo "🌱 Seeding providers..."
bun run --bun - << 'EOF'
const { Database } = require("bun:sqlite");
const providers = require("./scripts/seed-data/providers.json").providers;

const db = new Database("local.db");
const stmt = db.prepare(`
    INSERT INTO providers (
        id, name, description, website, api_key_required, base_url,
        is_enabled, release_date, supported_features, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`);

for (const p of providers) {
    stmt.run(
        p.id,
        p.name,
        p.description,
        p.website,
        p.apiKeyRequired ? 1 : 0,
        p.baseUrl,
        p.isEnabled ? 1 : 0,
        p.releaseDate,
        JSON.stringify(p.supportedFeatures)
    );
}
EOF

# 5. Verify providers
echo "🔍 Verifying providers..."
PROVIDER_COUNT=$(sqlite3 local.db "SELECT COUNT(*) FROM providers;")
if [ "$PROVIDER_COUNT" -ne "$EXPECTED_PROVIDER_COUNT" ]; then
    echo "❌ Error: Expected $EXPECTED_PROVIDER_COUNT providers, found $PROVIDER_COUNT"
    exit 1
fi

# Verify each provider exists
for PROVIDER in $PROVIDER_IDS; do
    if ! sqlite3 local.db "SELECT 1 FROM providers WHERE id='$PROVIDER';" | grep -q 1; then
        echo "❌ Error: Provider $PROVIDER not found"
        exit 1
    fi
done

echo "✅ Providers verified successfully"
sqlite3 local.db "SELECT id, name, description FROM providers;"

# 6. Seed models
echo "🌱 Seeding models..."
bun run --bun - << 'EOF'
const { Database } = require("bun:sqlite");
const models = require("./scripts/seed-data/models.json").models;

const db = new Database("local.db");
const stmt = db.prepare(`
    INSERT INTO models (
        id, name, description, provider_id, model_family, context_window,
        max_tokens, input_price_per_token, output_price_per_token,
        supported_features, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`);

for (const m of models) {
    stmt.run(
        m.id,
        m.name,
        null,
        m.providerId,
        m.name.split(" ")[0],
        m.contextWindow,
        m.maxOutputTokens,
        m.costPer1kInput || 0,
        m.costPer1kOutput || 0,
        JSON.stringify({
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: false,
            streaming: true
        })
    );
}
EOF

# 7. Verify models
echo "🔍 Verifying models..."
MODEL_COUNT=$(sqlite3 local.db "SELECT COUNT(*) FROM models;")
if [ "$MODEL_COUNT" -ne "$EXPECTED_MODEL_COUNT" ]; then
    echo "❌ Error: Expected $EXPECTED_MODEL_COUNT models, found $MODEL_COUNT"
    exit 1
fi

# Verify each model exists
for MODEL in $MODEL_IDS; do
    if ! sqlite3 local.db "SELECT 1 FROM models WHERE id='$MODEL';" | grep -q 1; then
        echo "❌ Error: Model $MODEL not found"
        exit 1
    fi
done

# Verify model counts per provider
echo $SEED_DATA | jq -r '.modelsByProvider | to_entries[] | "\(.key) \(.value)"' | while read -r PROVIDER_ID EXPECTED_COUNT; do
    ACTUAL_COUNT=$(sqlite3 local.db "SELECT COUNT(*) FROM models WHERE provider_id='$PROVIDER_ID';")
    if [ "$ACTUAL_COUNT" -ne "$EXPECTED_COUNT" ]; then
        echo "❌ Error: Provider $PROVIDER_ID has $ACTUAL_COUNT models (expected $EXPECTED_COUNT)"
        exit 1
    fi
done

echo "✅ Models verified successfully"
sqlite3 local.db "SELECT id, name, provider_id, context_window FROM models;"

echo "✨ Magic init complete!" 