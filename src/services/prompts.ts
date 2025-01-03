import type { Prompt } from "../domain/models"
import { newPromptSchema } from "../domain/schemas/prompt"
import { ValidationError } from "../errors"
import { promptRepository } from "../infrastructure/repositories"

export const promptsService = {
    async list() {
        return promptRepository.list()
    },

    async getById(id: string) {
        return promptRepository.findById(id)
    },

    async create(data: Omit<Prompt, "id" | "createdAt">) {
        const result = newPromptSchema.safeParse(data)
        if (!result.success) {
            throw new ValidationError(result.error.message)
        }
        return promptRepository.create(result.data)
    },

    async update(id: string, data: Partial<Omit<Prompt, "id" | "createdAt">>) {
        const prompt = await promptRepository.findById(id)
        if (!prompt) {
            throw new Error(`Prompt not found: ${id}`)
        }
        return promptRepository.update(id, data)
    },

    async delete(id: string) {
        return promptRepository.delete(id)
    }
} 