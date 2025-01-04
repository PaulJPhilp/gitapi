import { writeFileSync } from "node:fs"
import modelsData from "../../src/data/models.json"
import { client } from "../../src/db/client"

// Deduplicate models by ID
const uniqueModels = Object.values(
    modelsData.models.reduce((acc, model) => {
        // Ensure all required fields are present
        if (!model.id || !model.name || !model.providerId || !model.modelFamily ||
            !model.contextWindow || !model.inputPricePerToken || !model.outputPricePerToken) {
            console.warn(`Skipping model with missing required fields: ${model.id || 'unknown'}`)
            return acc
        }
        acc[model.id] = model
        return acc
    }, {} as Record<string, typeof modelsData.models[0]>)
)

// Define providers data since it's not in models.json
const providers = [
    {
        id: "openai",
        name: "OpenAI",
        description: "Leading AI research company",
        website: "https://openai.com",
        apiKeyRequired: true,
        baseUrl: "https://api.openai.com/v1",
        isEnabled: true,
        releaseDate: "2015-12-11",
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: true,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "AI research company focused on safe and ethical AI",
        website: "https://anthropic.com",
        apiKeyRequired: true,
        baseUrl: "https://api.anthropic.com/v1",
        isEnabled: true,
        releaseDate: "2021-05-01",
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: false,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "meta",
        name: "Meta",
        description: "Meta's AI research division, creators of Llama models",
        website: "https://ai.meta.com",
        apiKeyRequired: false,
        baseUrl: null,
        isEnabled: true,
        releaseDate: "2023-07-18",
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "google",
        name: "Google AI",
        description: "Google's AI research division",
        website: "https://ai.google.dev",
        apiKeyRequired: true,
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        isEnabled: true,
        releaseDate: "2023-12-06",
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: true,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    }
]

async function rebuildDatabase() {
    console.log("🔄 Starting database rebuild...")

    // Initialize empty database
    console.log("Initializing database...")
    writeFileSync("local.db", "")

    // Drop existing tables
    console.log("Dropping existing tables...")
    await client.execute("DROP TABLE IF EXISTS models;")
    await client.execute("DROP TABLE IF EXISTS provider_api_keys;")
    await client.execute("DROP TABLE IF EXISTS providers;")

    // Create providers table
    console.log("Creating providers table...")
    await client.execute(`
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
    `)

    // Create models table
    console.log("Creating models table...")
    await client.execute(`
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
    `)

    // Create provider_api_keys table
    console.log("Creating provider_api_keys table...")
    await client.execute(`
        CREATE TABLE provider_api_keys (
            provider_id TEXT NOT NULL,
            api_key TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (provider_id),
            FOREIGN KEY (provider_id) REFERENCES providers(id)
        );
    `)

    const now = new Date().toISOString()

    // Insert providers
    console.log("Seeding providers...")
    for (const provider of providers) {
        await client.execute({
            sql: `INSERT INTO providers (
                id, name, description, website, api_key_required, base_url,
                is_enabled, release_date, supported_features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                provider.id,
                provider.name,
                provider.description,
                provider.website,
                provider.apiKeyRequired ? 1 : 0,
                provider.baseUrl,
                provider.isEnabled ? 1 : 0,
                provider.releaseDate,
                JSON.stringify(provider.supportedFeatures),
                now,
                now
            ]
        })
    }

    // Insert models
    console.log("Seeding models...")
    for (const model of uniqueModels) {
        await client.execute({
            sql: `INSERT INTO models (
                id, name, description, provider_id, model_family,
                context_window, max_tokens, input_price_per_token,
                output_price_per_token, release_date, type, reasoning,
                is_enabled, supported_features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                model.id,
                model.name,
                null, // description
                model.providerId,
                model.modelFamily,
                model.contextWindow,
                model.maxTokens || null,
                model.inputPricePerToken.toString(),
                model.outputPricePerToken.toString(),
                model.releaseDate,
                model.type || "proprietary",
                model.reasoning ? 1 : 0,
                model.isEnabled ? 1 : 0,
                JSON.stringify(model.supportedFeatures),
                now,
                now
            ]
        })
    }

    console.log("✅ Database rebuild complete!")

    // Verify the data
    const providerCount = await client.execute("SELECT COUNT(*) as count FROM providers")
    const modelCount = await client.execute("SELECT COUNT(*) as count FROM models")

    console.log(`Providers seeded: ${providerCount.rows[0].count}`)
    console.log(`Models seeded: ${modelCount.rows[0].count}`)
}

rebuildDatabase().catch(console.error) 