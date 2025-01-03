import { client } from "../../db/client"
import type { ProviderApiKey } from "../../domain/models"

export const providerApiKeysRepository = {
    async getByProviderId(providerId: string): Promise<ProviderApiKey | null> {
        const result = await client.execute({
            sql: "SELECT * FROM provider_api_keys WHERE provider_id = ?",
            args: [providerId]
        })

        if (result.rows.length === 0) {
            return null
        }

        const row = result.rows[0]
        return {
            providerId: row[0] as string,
            apiKey: row[1] as string,
            createdAt: row[2] as string,
            updatedAt: row[3] as string
        }
    },

    async upsert(providerApiKey: Omit<ProviderApiKey, "createdAt" | "updatedAt">): Promise<ProviderApiKey> {
        const now = new Date().toISOString()
        const existing = await this.getByProviderId(providerApiKey.providerId)

        if (existing) {
            await client.execute({
                sql: `UPDATE provider_api_keys 
                      SET api_key = ?, updated_at = ? 
                      WHERE provider_id = ?`,
                args: [providerApiKey.apiKey, now, providerApiKey.providerId]
            })

            return {
                ...providerApiKey,
                createdAt: existing.createdAt,
                updatedAt: now
            }
        }

        await client.execute({
            sql: `INSERT INTO provider_api_keys (
                provider_id, api_key, created_at, updated_at
            ) VALUES (?, ?, ?, ?)`,
            args: [
                providerApiKey.providerId,
                providerApiKey.apiKey,
                now,
                now
            ]
        })

        return {
            ...providerApiKey,
            createdAt: now,
            updatedAt: now
        }
    },

    async delete(providerId: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM provider_api_keys WHERE provider_id = ?",
            args: [providerId]
        })
    }
} 