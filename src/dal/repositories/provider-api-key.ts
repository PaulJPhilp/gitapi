import type { ProviderApiKey } from "@/domain"
import { client } from "../db"
import { DatabaseError, EntityNotFoundError } from "../errors"
import { validateProviderApiKey } from "../validation/provider-api-key"
import type { Repository } from "./types"

export interface ProviderApiKeyRepository extends Repository<ProviderApiKey, Omit<ProviderApiKey, "id" | "createdAt" | "updatedAt">> {
    findByProvider(providerId: string): Promise<ProviderApiKey[]>
    findEnabled(): Promise<ProviderApiKey[]>
    updateLastUsed(id: string): Promise<void>
}

export const providerApiKeyRepository: ProviderApiKeyRepository = {
    async findAll(): Promise<ProviderApiKey[]> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys",
            args: []
        })
        return result.rows.map(mapRowToProviderApiKey)
    },

    async findById(id: string): Promise<ProviderApiKey | null> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? mapRowToProviderApiKey(result.rows[0]) : null
    },

    async create(data: Omit<ProviderApiKey, "id" | "createdAt" | "updatedAt">): Promise<ProviderApiKey> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            const apiKey: ProviderApiKey = {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }

            validateProviderApiKey(apiKey)

            await client.execute({
                sql: `INSERT INTO provider_api_keys (
                    id, provider_id, api_key, name,
                    expires_at, last_used_at, is_enabled,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id, data.providerId, data.apiKey, data.name,
                    data.expiresAt, data.lastUsedAt, data.isEnabled,
                    now, now
                ]
            })

            return apiKey
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<ProviderApiKey, "id" | "createdAt" | "updatedAt">>): Promise<ProviderApiKey> {
        try {
            const existing = await this.findById(id)
            if (!existing) {
                throw new EntityNotFoundError('ProviderApiKey', id)
            }

            const sets: string[] = []
            const values: (string | boolean | Date | null)[] = []
            const now = new Date().toISOString()

            if (data.providerId !== undefined) {
                sets.push("provider_id = ?")
                values.push(data.providerId)
            }

            if (data.apiKey !== undefined) {
                sets.push("api_key = ?")
                values.push(data.apiKey)
            }

            if (data.name !== undefined) {
                sets.push("name = ?")
                values.push(data.name)
            }

            if (data.expiresAt !== undefined) {
                sets.push("expires_at = ?")
                values.push(data.expiresAt)
            }

            if (data.lastUsedAt !== undefined) {
                sets.push("last_used_at = ?")
                values.push(data.lastUsedAt)
            }

            if (data.isEnabled !== undefined) {
                sets.push("is_enabled = ?")
                values.push(data.isEnabled)
            }

            if (sets.length > 0) {
                const updatedApiKey: ProviderApiKey = {
                    ...existing,
                    ...data,
                    updatedAt: now
                }
                validateProviderApiKey(updatedApiKey)

                sets.push("updated_at = ?")
                values.push(now)
                values.push(id)

                await client.execute({
                    sql: `UPDATE provider_api_keys SET ${sets.join(", ")} WHERE id = ?`,
                    args: values
                })
            }

            const result = await client.execute({
                sql: "SELECT * FROM provider_api_keys WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new EntityNotFoundError('ProviderApiKey', id)
            }

            return mapRowToProviderApiKey(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM provider_api_keys WHERE id = ?",
            args: [id]
        })
    },

    async findByProvider(providerId: string): Promise<ProviderApiKey[]> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys WHERE provider_id = ?",
            args: [providerId]
        })
        return result.rows.map(mapRowToProviderApiKey)
    },

    async findEnabled(): Promise<ProviderApiKey[]> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys WHERE is_enabled = true",
            args: []
        })
        return result.rows.map(mapRowToProviderApiKey)
    },

    async updateLastUsed(id: string): Promise<void> {
        const now = new Date().toISOString()
        await client.execute({
            sql: "UPDATE provider_api_keys SET last_used_at = ?, updated_at = ? WHERE id = ?",
            args: [now, now, id]
        })
    }
}

function mapRowToProviderApiKey(row: Record<string, unknown>): ProviderApiKey {
    return {
        id: String(row.id),
        providerId: String(row.provider_id),
        apiKey: String(row.api_key),
        name: String(row.name),
        expiresAt: row.expires_at ? new Date(String(row.expires_at)) : undefined,
        lastUsedAt: row.last_used_at ? new Date(String(row.last_used_at)) : undefined,
        isEnabled: Boolean(row.is_enabled),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
} 