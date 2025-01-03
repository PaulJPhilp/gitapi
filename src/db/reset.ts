import { nanoid } from "nanoid"
import { client } from "./index"

async function resetDatabase() {
    // Clear all tables in correct order due to foreign key constraints
    await client.execute({ sql: "DELETE FROM prompt_runs", args: [] })
    await client.execute({ sql: "DELETE FROM prompts", args: [] })
    await client.execute({ sql: "DELETE FROM models", args: [] })
    await client.execute({ sql: "DELETE FROM providers", args: [] })

    const now = new Date().toISOString()

    // Seed with standard data
    const providers = [
        {
            name: "openai",
            description: "OpenAI API Provider",
            website: "https://openai.com"
        },
        {
            name: "github",
            description: "GitHub API Provider",
            website: "https://github.com"
        }
    ]

    for (const provider of providers) {
        await client.execute({
            sql: `INSERT INTO providers (id, name, description, website, api_key_required, is_enabled, release_date, supported_features, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                nanoid(),
                provider.name,
                provider.description,
                provider.website,
                1,
                1,
                now,
                JSON.stringify(["chat", "completion"]),
                now,
                now
            ]
        })
    }

    console.log("Database reset and seeded successfully")
}

// Run if this file is executed directly
if (process.argv[1] === import.meta.url) {
    resetDatabase()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("Error:", err)
            process.exit(1)
        })
} 