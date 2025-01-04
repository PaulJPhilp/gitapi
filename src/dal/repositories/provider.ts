import { client } from "@/db/client"
import type { Provider } from "@/domain/models"
import type { ProviderApiKey } from "@/domain/provider-api-key"
import { DatabaseError, EntityNotFoundError } from "../errors"
import type { Repository } from "../interfaces/repository"
import { mapRowToProvider, mapRowToProviderApiKey } from "../mappers/provider"

export interface ProviderRepository extends Repository<Provider, Omit<Provider, "id" | "createdAt" | "updatedAt">> {
    findApiKey(id: string): Promise<ProviderApiKey | null>
    setApiKey(id: string, apiKey: string): Promise<void>
    findEnabled(): Promise<Provider[]>
}

export const providerRepository: ProviderRepository = {
    async list(): Promise<Provider[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM providers",
                args: []
            })
            return result.rows.map(mapRowToProvider)
        } catch (error) {
            throw new DatabaseError('list', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findById(id: string): Promise<Provider | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM providers WHERE id = ?",
                args: [id]
            })
            return result.rows[0] ? mapRowToProvider(result.rows[0]) : null
        } catch (error) {
            throw new DatabaseError('findById', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findApiKey(id: string): Promise<ProviderApiKey | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM provider_api_keys WHERE provider_id = ?",
                args: [id]
            })
            return result.rows[0] ? mapRowToProviderApiKey(result.rows[0]) : null
        } catch (error) {
            throw new DatabaseError('findApiKey', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async setApiKey(id: string, apiKey: string): Promise<void> {
        try {
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
        } catch (error) {
            throw new DatabaseError('setApiKey', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async create(data: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            await client.execute({
                sql: "INSERT INTO providers (id, name, description, website, api_key_required, base_url, is_enabled, release_date, supported_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                args: [id, data.name, data.description, data.website, data.apiKeyRequired, data.baseUrl, data.isEnabled, data.releaseDate, JSON.stringify(data.supportedFeatures), now, now]
            })

            return {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<Provider, "id" | "createdAt" | "updatedAt">>): Promise<Provider | null> {
        try {
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

            if (!result.rows[0]) {
                throw new EntityNotFoundError('Provider', id)
            }

            return mapRowToProvider(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const result = await client.execute({
                sql: "DELETE FROM providers WHERE id = ?",
                args: [id]
            })

            if (result.rowsAffected === 0) {
                throw new EntityNotFoundError('Provider', id)
            }
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('delete', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findEnabled(): Promise<Provider[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM providers WHERE is_enabled = true",
                args: []
            })
            return result.rows.map(mapRowToProvider)
        } catch (error) {
            throw new DatabaseError('findEnabled', error instanceof Error ? error.message : 'Unknown error')
        }
    }
} 