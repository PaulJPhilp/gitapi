import { client } from "."

const seedProviders = [
    {
        id: "openai",
        name: "OpenAI",
        description: "Leading AI research company",
        website: "https://openai.com",
        apiKeyRequired: true,
        baseUrl: "https://api.openai.com/v1",
        isEnabled: true,
        supportedFeatures: JSON.stringify({
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: true,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        })
    }
]

const seedModels = [
    {
        id: "gpt-4",
        name: "GPT-4",
        description: "Most capable GPT-4 model",
        providerId: "openai",
        isEnabled: true,
        modelFamily: "gpt-4",
        contextWindow: 8192,
        maxTokens: 4096,
        inputPricePerToken: "0.00003",
        outputPricePerToken: "0.00006",
        supportedFeatures: JSON.stringify({
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        })
    }
]

async function seed() {
    const now = new Date().toISOString()

    console.log("Seeding providers...")
    for (const provider of seedProviders) {
        await client.execute({
            sql: `INSERT OR IGNORE INTO providers (
                id, name, description, website, api_key_required, base_url,
                is_enabled, supported_features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                provider.id,
                provider.name,
                provider.description,
                provider.website,
                provider.apiKeyRequired ? 1 : 0,
                provider.baseUrl,
                provider.isEnabled ? 1 : 0,
                provider.supportedFeatures,
                now,
                now
            ]
        })
    }

    console.log("Seeding models...")
    for (const model of seedModels) {
        await client.execute({
            sql: `INSERT OR IGNORE INTO models (
                id, name, description, provider_id, is_enabled, model_family,
                context_window, max_tokens, input_price_per_token, output_price_per_token,
                supported_features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                model.id,
                model.name,
                model.description,
                model.providerId,
                model.isEnabled ? 1 : 0,
                model.modelFamily,
                model.contextWindow,
                model.maxTokens,
                model.inputPricePerToken,
                model.outputPricePerToken,
                model.supportedFeatures,
                now,
                now
            ]
        })
    }

    console.log("Seeding completed successfully")
}

seed().catch(error => {
    console.error("Error seeding database:", error)
    process.exit(1)
}) 