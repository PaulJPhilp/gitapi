import type { SupportedFeatures } from "@/domain"
import { models, providers } from "../data/seeds"
import { client } from "../src/db/client"

interface SeedModel {
    id: string
    name: string
    modelFamily: string
    providerId: string
    releaseDate: string
    isEnabled: boolean
    contextWindow: number
    maxTokens: number
    inputPricePerToken: number
    outputPricePerToken: number
    type: 'proprietary' | 'open source'
    reasoning: boolean
    supportedFeatures: SupportedFeatures
}

interface SeedProvider {
    id: string
    name: string
    description: string
    website: string
    apiKeyRequired: boolean
    baseUrl: string | null
    isEnabled: boolean
    supportedFeatures: SupportedFeatures
}

async function rebuildDatabase() {
    console.log("🔄 Starting database rebuild...")

    // Read and execute the migration file
    console.log("Running migration...")
    const migration = await Bun.file("src/db/migrations/0004_rebuild_providers_models.sql").text()
    await client.execute(migration)

    // Insert providers
    console.log("Seeding providers...")
    for (const provider of providers as SeedProvider[]) {
        await client.execute({
            sql: `INSERT INTO providers (
                id, name, description, website, api_key_required, base_url,
                is_enabled, release_date, supported_features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                provider.id,
                provider.name,
                provider.description,
                provider.website,
                provider.apiKeyRequired ? 1 : 0,
                provider.baseUrl,
                provider.isEnabled ? 1 : 0,
                null, // releaseDate not in seed data
                JSON.stringify(provider.supportedFeatures)
            ]
        })
    }

    // Insert models
    console.log("Seeding models...")
    for (const model of models as SeedModel[]) {
        await client.execute({
            sql: `INSERT INTO models (
                id, name, description, provider_id, model_family,
                context_window, max_tokens, input_price_per_token,
                output_price_per_token, release_date, type, reasoning,
                is_enabled, supported_features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                JSON.stringify(model.supportedFeatures)
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