import type { NewPromptRun, PromptRun } from "@/src/domain/models"
import { newPromptRunSchema } from "@/src/domain/schemas"
import { NotFoundError, ValidationError } from "@/src/errors"
import { modelRepository, promptRepository, promptRunRepository, providerRepository } from "@/src/infrastructure/repositories"

export const promptRunsService = {
    list: async (): Promise<PromptRun[]> => {
        try {
            return await promptRunRepository.list()
        } catch (error) {
            console.error("Failed to list prompt runs:", error)
            throw error
        }
    },

    getById: async (id: string): Promise<PromptRun> => {
        try {
            const promptRun = await promptRunRepository.findById(id)
            if (!promptRun) {
                throw new NotFoundError(
                    "PromptRun",
                    id
                )
            }
            return promptRun
        } catch (error) {
            console.error(`Failed to get prompt run ${id}:`, error)
            throw error
        }
    },

    create: async (data: NewPromptRun): Promise<PromptRun> => {
        try {
            const result = newPromptRunSchema.safeParse(data)
            if (!result.success) {
                throw new ValidationError(result.error.message)
            }

            // Verify prompt exists
            const prompt = await promptRepository.findById(data.promptId)
            if (!prompt) {
                throw new ValidationError(
                    `Prompt with ID ${data.promptId} not found`,
                    "promptId"
                )
            }

            // Verify model exists
            const model = await modelRepository.findById(data.modelId)
            if (!model) {
                throw new ValidationError(
                    `Model with ID ${data.modelId} not found`,
                    "modelId"
                )
            }

            // Verify provider exists
            const provider = await providerRepository.findById(data.providerId)
            if (!provider) {
                throw new ValidationError(
                    `Provider with ID ${data.providerId} not found`,
                    "providerId"
                )
            }

            return await promptRunRepository.create(result.data as NewPromptRun)
        } catch (error) {
            console.error("Failed to create prompt run:", error)
            throw error
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            const promptRun = await promptRunRepository.findById(id)
            if (!promptRun) {
                throw new NotFoundError(
                    "PromptRun",
                    id
                )
            }
            await promptRunRepository.delete(id)
        } catch (error) {
            console.error(`Failed to delete prompt run ${id}:`, error)
            throw error
        }
    },

    findByPrompt: async (promptId: string): Promise<PromptRun[]> => {
        try {
            // Verify prompt exists
            const prompt = await promptRepository.findById(promptId)
            if (!prompt) {
                throw new ValidationError(
                    `Prompt with ID ${promptId} not found`,
                    "promptId"
                )
            }

            return await promptRunRepository.findByPrompt(promptId)
        } catch (error) {
            console.error(`Failed to find prompt runs for prompt ${promptId}:`, error)
            throw error
        }
    },

    findByModel: async (modelId: string): Promise<PromptRun[]> => {
        try {
            // Verify model exists
            const model = await modelRepository.findById(modelId)
            if (!model) {
                throw new ValidationError(
                    `Model with ID ${modelId} not found`,
                    "modelId"
                )
            }

            return await promptRunRepository.findByModel(modelId)
        } catch (error) {
            console.error(`Failed to find prompt runs for model ${modelId}:`, error)
            throw error
        }
    },

    findByProvider: async (providerId: string): Promise<PromptRun[]> => {
        try {
            // Verify provider exists
            const provider = await providerRepository.findById(providerId)
            if (!provider) {
                throw new ValidationError(
                    `Provider with ID ${providerId} not found`,
                    "providerId"
                )
            }

            return await promptRunRepository.findByProvider(providerId)
        } catch (error) {
            console.error(`Failed to find prompt runs for provider ${providerId}:`, error)
            throw error
        }
    }
} 