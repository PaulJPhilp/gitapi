import type { PromptRun } from "../domain/models"
import { promptRunRepository } from "../infrastructure/repositories"

export const promptRunsService = {
    async list() {
        return promptRunRepository.list()
    },

    async getById(id: string) {
        return promptRunRepository.findById(id)
    },

    async create(data: Omit<PromptRun, "id" | "createdAt">) {
        return promptRunRepository.create(data)
    },

    async update(id: string, data: Partial<Omit<PromptRun, "id" | "createdAt">>) {
        const promptRun = await promptRunRepository.findById(id)
        if (!promptRun) {
            throw new Error(`Prompt run not found: ${id}`)
        }
        return promptRunRepository.update(id, data)
    },

    async delete(id: string) {
        return promptRunRepository.delete(id)
    }
} 