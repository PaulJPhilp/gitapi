import { DatabaseError, EntityNotFoundError } from "../../dal/errors"
import { promptRepository } from "../../dal/repositories"
import type { Prompt } from "../../domain/models"
import { newPromptSchema } from "../../domain/schemas/prompt"

export const promptsService = {
    async list() {
        try {
            return await promptRepository.list()
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to list prompts: ${error.message}`)
            }
            throw error
        }
    },

    async getById(id: string) {
        try {
            const prompt = await promptRepository.findById(id)
            if (!prompt) {
                throw new EntityNotFoundError("Prompt", id)
            }
            return prompt
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to get prompt ${id}: ${error.message}`)
            }
            throw error
        }
    },

    async create(data: Omit<Prompt, "id" | "createdAt" | "updatedAt">) {
        try {
            const validatedData = newPromptSchema.parse(data)
            return await promptRepository.create(validatedData)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to create prompt: ${error.message}`)
            }
            throw error
        }
    },

    async update(id: string, data: Partial<Omit<Prompt, "id" | "createdAt" | "updatedAt">>) {
        try {
            const validatedData = newPromptSchema.partial().parse(data)
            const prompt = await promptRepository.update(id, validatedData)
            if (!prompt) {
                throw new EntityNotFoundError("Prompt", id)
            }
            return prompt
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to update prompt ${id}: ${error.message}`)
            }
            throw error
        }
    },

    async delete(id: string) {
        try {
            await promptRepository.delete(id)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to delete prompt ${id}: ${error.message}`)
            }
            throw error
        }
    }
} 