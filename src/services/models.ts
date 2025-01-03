import type { Model } from "../domain/models"
import { newModelSchema } from "../domain/schemas/model"
import { modelRepository } from "../infrastructure/repositories"

export const modelsService = {
    async list() {
        return modelRepository.list()
    },

    async getById(id: string) {
        return modelRepository.findById(id)
    },

    async create(data: Omit<Model, "id" | "createdAt">) {
        const validatedData = newModelSchema.parse(data)
        return modelRepository.create(validatedData)
    },

    async update(id: string, data: Partial<Omit<Model, "id" | "createdAt">>) {
        const model = await modelRepository.findById(id)
        if (!model) {
            throw new Error(`Model not found: ${id}`)
        }
        const validatedData = newModelSchema.partial().parse(data)
        return modelRepository.update(id, validatedData)
    },

    async delete(id: string) {
        return modelRepository.delete(id)
    }
} 