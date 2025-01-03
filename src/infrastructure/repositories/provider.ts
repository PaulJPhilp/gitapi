import type { Row } from "@libsql/client"
import { client } from "../../db/client"
import type { Provider, SupportedFeatures } from "../../domain/models"
import type { ProviderApiKey } from "../../domain/provider-api-key"

function rowToProvider(row: Row): Provider {
    return {
        id: String(row.id),
        name: String(row.name),
        description: String(row.description),
        website: String(row.website),
        apiKeyRequired: Boolean(row.api_key_required),
        baseUrl: row.base_url ? String(row.base_url) : null,
        isEnabled: Boolean(row.is_enabled),
        releaseDate: row.release_date ? String(row.release_date) : null,
        supportedFeatures: JSON.parse(String(row.supported_features)) as SupportedFeatures,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

function rowToApiKey(row: Row): ProviderApiKey {
    return {
        providerId: String(row.provider_id),
        apiKey: String(row.api_key),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

export const providerRepository = {
    async list(): Promise<Provider[]> {
        const result = await client.execute({
            sql: "SELECT * FROM providers",
            args: []
        })
        return result.rows.map(rowToProvider)
    },

    async findById(id: string): Promise<Provider | null> {
        const result = await client.execute({
            sql: "SELECT * FROM providers WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? rowToProvider(result.rows[0]) : null
    },

    async findApiKey(id: string): Promise<ProviderApiKey | null> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys WHERE provider_id = ?",
            args: [id]
        })
        return result.rows[0] ? rowToApiKey(result.rows[0]) : null
    },

    async setApiKey(id: string, apiKey: string): Promise<void> {
        const now = new Date().toISOString()
        const existing = await this.findApiKey(id)

        if (existing) {
            await client.execute({
                sql: "UPDATE provider_api_keys SET api_key = ?, updated_at = ? WHERE provider_id = ?",
                args: [apiKey, now, id]
            })
        } else {
            await client.execute({
                sql: "INSERT INTO provider_api_keys (provider_id, api_key, created_at, updated_at) VALUES (?, ?, ?, ?)",
                args: [id, apiKey, now, now]
            })
        }
    },

    async create(data: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider> {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        await client.execute({
            sql: "INSERT INTO providers (id, name, description, website, api_key_required, base_url, is_enabled, release_date, supported_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [id, data.name, data.description, data.website, data.apiKeyRequired, data.baseUrl, data.isEnabled, data.releaseDate, JSON.stringify(data.supportedFeatures), now, now]
        })

        return {
            id,
            name: data.name,
            description: data.description,
            website: data.website,
            apiKeyRequired: data.apiKeyRequired,
            baseUrl: data.baseUrl,
            isEnabled: data.isEnabled,
            releaseDate: data.releaseDate,
            supportedFeatures: data.supportedFeatures,
            createdAt: now,
            updatedAt: now
        }
    },

    async update(id: string, data: Partial<Omit<Provider, "id" | "createdAt" | "updatedAt">>): Promise<Provider> {
        const sets: string[] = []
        const values: (string | boolean | null)[] = []
        const now = new Date().toISOString()

        if (data.name !== undefined) {
            sets.push("name = ?")
            values.push(data.name)
        }

        if (data.description !== undefined) {
            sets.push("description = ?")
            values.push(data.description)
        }

        if (data.website !== undefined) {
            sets.push("website = ?")
            values.push(data.website)
        }

        if (data.apiKeyRequired !== undefined) {
            sets.push("api_key_required = ?")
            values.push(data.apiKeyRequired)
        }

        if (data.baseUrl !== undefined) {
            sets.push("base_url = ?")
            values.push(data.baseUrl)
        }

        if (data.isEnabled !== undefined) {
            sets.push("is_enabled = ?")
            values.push(data.isEnabled)
        }

        if (data.releaseDate !== undefined) {
            sets.push("release_date = ?")
            values.push(data.releaseDate)
        }

        if (data.supportedFeatures !== undefined) {
            sets.push("supported_features = ?")
            values.push(JSON.stringify(data.supportedFeatures))
        }

        if (sets.length > 0) {
            sets.push("updated_at = ?")
            values.push(now)
            values.push(id)
            await client.execute({
                sql: `UPDATE providers SET ${sets.join(", ")} WHERE id = ?`,
                args: values
            })
        }

        const result = await client.execute({
            sql: "SELECT * FROM providers WHERE id = ?",
            args: [id]
        })
        return rowToProvider(result.rows[0])
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM providers WHERE id = ?",
            args: [id]
        })
    }
} 