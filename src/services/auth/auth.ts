import { DatabaseError, EntityNotFoundError } from "../../dal/errors"
import { authRepository, providerRepository } from "../../dal/repositories"

export const authService = {
    async setApiKey(providerId: string, apiKey: string) {
        try {
            // Verify provider exists
            const provider = await providerRepository.findById(providerId)
            if (!provider) {
                throw new EntityNotFoundError("Provider", providerId)
            }

            await authRepository.setApiKey(providerId, apiKey)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to set API key for provider ${providerId}: ${error.message}`)
            }
            throw error
        }
    },

    async validateApiKey(providerId: string, apiKey: string) {
        try {
            // Verify provider exists
            const provider = await providerRepository.findById(providerId)
            if (!provider) {
                throw new EntityNotFoundError("Provider", providerId)
            }

            return await authRepository.validateApiKey(providerId, apiKey)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to validate API key for provider ${providerId}: ${error.message}`)
            }
            throw error
        }
    }
} 