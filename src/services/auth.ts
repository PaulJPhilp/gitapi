import { client } from "../db/client"
import { NotFoundError } from "../errors"
import { providerRepository } from "../infrastructure/repositories"

export const authService = {
    setApiKey: async (providerId: string, apiKey: string): Promise<void> => {
        try {
            const provider = await providerRepository.findById(providerId)
            if (!provider) {
                throw new NotFoundError("Provider", providerId)
            }

            const now = new Date().toISOString()
            await client.execute({
                sql: `INSERT INTO provider_api_keys (provider_id, api_key, created_at, updated_at) 
                      VALUES (?, ?, ?, ?)
                      ON CONFLICT(provider_id) DO UPDATE SET
                      api_key = ?, updated_at = ?`,
                args: [providerId, apiKey, now, now, apiKey, now]
            })
        } catch (error) {
            console.error(`Failed to set API key for provider ${providerId}:`, error)
            throw error
        }
    },

    validateApiKey: async (providerId: string, apiKey: string): Promise<boolean> => {
        try {
            const provider = await providerRepository.findById(providerId)
            if (!provider) {
                throw new NotFoundError("Provider", providerId)
            }

            const result = await client.execute({
                sql: "SELECT api_key FROM provider_api_keys WHERE provider_id = ? LIMIT 1",
                args: [providerId]
            })

            return result.rows[0]?.api_key === apiKey
        } catch (error) {
            console.error(`Failed to validate API key for provider ${providerId}:`, error)
            throw error
        }
    }
} 