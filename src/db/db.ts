import { createClient } from "@libsql/client"
import { DATABASE_URL } from "../config/database"

console.log("Initializing database with URL:", DATABASE_URL)

export const client = createClient({
    url: DATABASE_URL
})

export async function initializeDatabase() {
    try {
        console.log("Starting database initialization...")

        // Test connection with timeout and retry
        const connectionTest = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    await client.execute("SELECT 1")
                    console.log("Database connection successful")
                    return true
                } catch (error) {
                    console.error(`Database connection attempt ${i + 1}/${retries} failed:`, error)
                    if (i < retries - 1) {
                        // Wait for 1 second before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }
            }
            return false
        }

        const isConnected = await connectionTest()
        if (!isConnected) {
            throw new Error("Failed to establish database connection after retries")
        }

        // Create tables in sequence to avoid potential race conditions
        console.log("Creating providers table...")
        await client.execute(`
            CREATE TABLE IF NOT EXISTS providers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                website TEXT NOT NULL,
                api_key_required INTEGER DEFAULT 1,
                base_url TEXT,
                is_enabled INTEGER DEFAULT 1,
                release_date TEXT,
                supported_features TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `)

        console.log("Creating models table...")
        await client.execute(`
            CREATE TABLE IF NOT EXISTS models (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                provider_id TEXT NOT NULL,
                model_family TEXT,
                context_window INTEGER NOT NULL,
                max_tokens INTEGER,
                input_price_per_token TEXT NOT NULL,
                output_price_per_token TEXT NOT NULL,
                release_date TEXT,
                is_enabled INTEGER DEFAULT 1,
                supported_features TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (provider_id) REFERENCES providers(id)
            )
        `)

        console.log("Creating prompts table...")
        await client.execute(`
            CREATE TABLE IF NOT EXISTS prompts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                model_id TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (model_id) REFERENCES models(id)
            )
        `)

        console.log("Creating prompt_runs table...")
        await client.execute(`
            CREATE TABLE IF NOT EXISTS prompt_runs (
                id TEXT PRIMARY KEY,
                prompt_id TEXT NOT NULL,
                model_id TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                content TEXT NOT NULL,
                completion TEXT,
                usage TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (prompt_id) REFERENCES prompts(id),
                FOREIGN KEY (model_id) REFERENCES models(id),
                FOREIGN KEY (provider_id) REFERENCES providers(id)
            )
        `)

        console.log("Database schema initialized successfully")
    } catch (error) {
        console.error("Failed to initialize database schema:", error)
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            })
        }
        throw error
    }
} 