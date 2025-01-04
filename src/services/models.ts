import type { Model } from "../domain/models"
import { newModelSchema } from "../domain/schemas/model"
import { NotFoundError } from "../errors"
import { modelRepository } from "../infrastructure/repositories"

export const modelsService = {
    async list() {
        return modelRepository.list()
    },

    async getById(id: string) {
        const model = await modelRepository.findById(id)
        if (!model) {
            throw new NotFoundError(`Model not found: ${id}`)
        }
        return model
    },

    async create(data: Omit<Model, "id" | "createdAt">) {
        const validatedData = newModelSchema.parse(data)
        return modelRepository.create(validatedData)
    },

    async update(id: string, data: Partial<Omit<Model, "id" | "createdAt">>) {
        const model = await modelRepository.findById(id)
        if (!model) {
            throw new NotFoundError(`Model not found: ${id}`)
        }
        const validatedData = newModelSchema.partial().parse(data)
        return modelRepository.update(id, validatedData)
    },

    async delete(id: string) {
        const model = await modelRepository.findById(id)
        if (!model) {
            throw new NotFoundError(`Model not found: ${id}`)
        }
        return modelRepository.delete(id)
    }
} 