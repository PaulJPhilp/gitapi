import { models, providers } from "@/src/data/modelSeeds"
import { client } from "@/src/db/client"

console.log("Starting seed script...")

export async function seedModelsAndProviders() {
    try {
        console.log("🧹 Cleaning database...")

        // Check initial state
        const initialProviders = await client.execute({ sql: "SELECT COUNT(*) as count FROM providers", args: [] })
        console.log(`Initial providers count: ${initialProviders.rows[0].count}`)

        // First clean all tables in the correct order due to foreign key constraints
        console.log("Deleting prompt_runs...")
        await client.execute({ sql: "DELETE FROM prompt_runs", args: [] })
        console.log("Deleting prompts...")
        await client.execute({ sql: "DELETE FROM prompts", args: [] })
        console.log("Deleting models...")
        await client.execute({ sql: "DELETE FROM models", args: [] })
        console.log("Deleting provider_api_keys...")
        await client.execute({ sql: "DELETE FROM provider_api_keys", args: [] })
        console.log("Deleting providers...")
        await client.execute({ sql: "DELETE FROM providers", args: [] })

        // Verify clean state
        const afterCleanProviders = await client.execute({ sql: "SELECT COUNT(*) as count FROM providers", args: [] })
        console.log(`Providers count after cleaning: ${afterCleanProviders.rows[0].count}`)

        console.log("🌱 Seeding providers...")
        console.log(`Providers to seed: ${providers.length}`)
        const now = new Date().toISOString()
        // Execute provider insertions in parallel
        await Promise.all(
            providers.map(provider =>
                client.execute({
                    sql: "INSERT INTO providers (id, name, description, website, api_key_required, base_url, is_enabled, release_date, supported_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    args: [provider.id, provider.name, provider.description, provider.website, provider.apiKeyRequired, provider.baseUrl, provider.isEnabled, provider.releaseDate, JSON.stringify(provider.supportedFeatures), now, now]
                })
            )
        )

        // Verify seeded state
        const afterSeedProviders = await client.execute({ sql: "SELECT COUNT(*) as count FROM providers", args: [] })
        console.log(`Final providers count: ${afterSeedProviders.rows[0].count}`)

        console.log("🌱 Seeding models...")
        console.log(`Models to seed: ${models.length}`)
        // Execute model insertions in parallel
        await Promise.all(
            models.map(model => {
                // Extract model family from the name (e.g., "GPT-4 Turbo" -> "GPT-4")
                const modelFamily = model.name.split(' ')[0]
                return client.execute({
                    sql: "INSERT INTO models (id, name, description, provider_id, model_family, context_window, max_tokens, input_price_per_token, output_price_per_token, supported_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    args: [
                        model.id,
                        model.name,
                        null, // description
                        model.providerId,
                        modelFamily,
                        model.contextWindow,
                        model.maxOutputTokens || null,
                        (model.costPer1kInput || 0).toString(),
                        (model.costPer1kOutput || 0).toString(),
                        JSON.stringify({
                            chat: true,
                            completion: true,
                            embedding: false,
                            imageGeneration: false,
                            imageAnalysis: false,
                            functionCalling: false,
                            streaming: true
                        }),
                        now,
                        now
                    ]
                })
            })
        )

        // Verify final state
        const finalModels = await client.execute({ sql: "SELECT COUNT(*) as count FROM models", args: [] })
        console.log(`Final models count: ${finalModels.rows[0].count}`)

        console.log("✅ Database seeded successfully")
    } catch (error) {
        console.error("❌ Error seeding database:", error)
        throw error
    }
}

// Call the function
seedModelsAndProviders().catch(error => {
    console.error("Failed to seed database:", error)
    process.exit(1)
}) 