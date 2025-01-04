import { z } from "zod"
import type { Provider } from "../../domain/provider"
import { providerRepository } from "../dal/repositories/provider"

const providerSchema = z.object({
    name: z.string(),
    description: z.string(),
    website: z.string().url(),
    apiKeyRequired: z.boolean(),
    baseUrl: z.string().url().nullable(),
    isEnabled: z.boolean(),
    releaseDate: z.string().nullable(),
    supportedFeatures: z.record(z.boolean())
})

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
        const validatedData = providerSchema.parse(data)
        return providerRepository.create(validatedData)
    },

    async update(id: string, data: Partial<Omit<Provider, "id" | "createdAt">>): Promise<Provider> {
        const validatedData = providerSchema.partial().parse(data)
        return providerRepository.update(id, validatedData)
    },

    async delete(id: string): Promise<void> {
        return providerRepository.delete(id)
    }
}
