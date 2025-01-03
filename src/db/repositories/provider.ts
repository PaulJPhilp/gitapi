import type { Row } from "@libsql/client"
import { nanoid } from "nanoid/non-secure"
import { client } from "../db"
import type { Provider } from "../schema/types"
import type { ProviderRepository } from "./types"

function generateId(): string {
    return nanoid(10)
}

function toProvider(row: Row): Provider {
    return {
        id: String(row.id),
        name: String(row.name),
        description: String(row.description),
        website: String(row.website),
        apiKeyRequired: Boolean(row.api_key_required),
        baseUrl: row.base_url ? String(row.base_url) : null,
        isEnabled: Boolean(row.is_enabled),
        releaseDate: row.release_date ? String(row.release_date) : null,
        supportedFeatures: JSON.parse(String(row.supported_features)),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

export class DefaultProviderRepository implements ProviderRepository {
    async findById(id: string): Promise<Provider | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM providers WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                return null
            }

            return toProvider(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to find provider: ${error}`)
        }
    }

    async findAll(): Promise<Provider[]> {
        try {
            const results = await client.execute({
                sql: "SELECT * FROM providers",
                args: []
            })
            return results.rows.map(row => toProvider(row))
        } catch (error) {
            throw new Error(`Failed to find providers: ${error}`)
        }
    }

    async create(provider: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider> {
        try {
            const id = generateId()
            const now = new Date().toISOString()
            const dbProvider = {
                ...provider,
                id,
                createdAt: now,
                updatedAt: now,
                supportedFeatures: JSON.stringify(provider.supportedFeatures)
            }

            await client.execute({
                sql: "INSERT INTO providers (id, name, description, website, api_key_required, base_url, is_enabled, release_date, supported_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                args: [id, dbProvider.name, dbProvider.description, dbProvider.website, dbProvider.apiKeyRequired, dbProvider.baseUrl, dbProvider.isEnabled, dbProvider.releaseDate, dbProvider.supportedFeatures, dbProvider.createdAt, dbProvider.updatedAt]
            })
            const created = await client.execute({
                sql: "SELECT * FROM providers WHERE id = ?",
                args: [id]
            })

            if (!created.rows[0]) {
                throw new Error("Failed to find created provider")
            }

            return toProvider(created.rows[0])
        } catch (error) {
            throw new Error(`Failed to create provider: ${error}`)
        }
    }

    async update(id: string, data: Partial<Provider>): Promise<Provider> {
        try {
            const dbData = {
                ...data,
                supportedFeatures: data.supportedFeatures ? JSON.stringify(data.supportedFeatures) : undefined
            }

            await client.execute({
                sql: "UPDATE providers SET name = ?, description = ?, website = ?, api_key_required = ?, base_url = ?, is_enabled = ?, release_date = ?, supported_features = ?, updated_at = ? WHERE id = ?",
                args: [
                    dbData.name ?? null,
                    dbData.description ?? null,
                    dbData.website ?? null,
                    dbData.apiKeyRequired ?? null,
                    dbData.baseUrl ?? null,
                    dbData.isEnabled ?? null,
                    dbData.releaseDate ?? null,
                    dbData.supportedFeatures ?? null,
                    new Date().toISOString(),
                    id
                ]
            })

            const updated = await client.execute({
                sql: "SELECT * FROM providers WHERE id = ?",
                args: [id]
            })

            if (!updated.rows[0]) {
                throw new Error("Failed to find updated provider")
            }

            return toProvider(updated.rows[0])
        } catch (error) {
            throw new Error(`Failed to update provider: ${error}`)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await client.execute({
                sql: "DELETE FROM providers WHERE id = ?",
                args: [id]
            })
        } catch (error) {
            throw new Error(`Failed to delete provider: ${error}`)
        }
    }

    async findEnabled(): Promise<Provider[]> {
        try {
            const results = await client.execute({
                sql: "SELECT * FROM providers WHERE is_enabled = ?",
                args: [true]
            })
            return results.rows.map(row => toProvider(row))
        } catch (error) {
            throw new Error(`Failed to find enabled providers: ${error}`)
        }
    }
}