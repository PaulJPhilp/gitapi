import type { Provider } from "../domain/models"
import { newProviderSchema } from "../domain/schemas/provider"
import { providerRepository } from "../infrastructure/repositories"

export const providersService = {
    async list(): Promise<Provider[]> {
        return providerRepository.list()
    },

    async getById(id: string): Promise<Provider | null> {
        return providerRepository.findById(id)
    },

    async getApiKey(id: string): Promise<string | null> {
        // For known providers, use environment variables
        switch (id) {
            case "openai":
                return process.env.OPENAI_API_KEY ?? null
            case "anthropic":
                return process.env.ANTHROPIC_API_KEY ?? null
            default: {
                // For other providers, check the database
                const apiKey = await providerRepository.findApiKey(id)
                return apiKey?.apiKey ?? null
            }
        }
    },

    async setApiKey(id: string, apiKey: string): Promise<void> {
        await providerRepository.setApiKey(id, apiKey)
    },

    async create(data: Omit<Provider, "id" | "createdAt">): Promise<Provider> {
        const validatedData = newProviderSchema.parse(data)
        return providerRepository.create(validatedData)
    },

    async update(id: string, data: Partial<Omit<Provider, "id" | "createdAt">>): Promise<Provider> {
        const validatedData = newProviderSchema.partial().parse(data)
        return providerRepository.update(id, validatedData)
    },

    async delete(id: string): Promise<void> {
        return providerRepository.delete(id)
    }
}
