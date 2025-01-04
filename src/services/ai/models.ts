import { DatabaseError, EntityNotFoundError } from "../dal/errors"
import { modelRepository } from "../dal/repositories"
import type { Model } from "../domain/models"
import { newModelSchema } from "../domain/schemas/model"

export const modelsService = {
    async list() {
        try {
            return await modelRepository.list()
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to list models: ${error.message}`)
            }
            throw error
        }
    },

    async getById(id: string) {
        try {
            const model = await modelRepository.findById(id)
            if (!model) {
                throw new EntityNotFoundError("Model", id)
            }
            return model
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to get model ${id}: ${error.message}`)
            }
            throw error
        }
    },

    async create(data: Omit<Model, "id" | "createdAt" | "updatedAt">) {
        try {
            const validatedData = newModelSchema.parse(data)
            return await modelRepository.create(validatedData)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to create model: ${error.message}`)
            }
            throw error
        }
    },

    async update(id: string, data: Partial<Omit<Model, "id" | "createdAt" | "updatedAt">>) {
        try {
            const validatedData = newModelSchema.partial().parse(data)
            const model = await modelRepository.update(id, validatedData)
            if (!model) {
                throw new EntityNotFoundError("Model", id)
            }
            return model
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to update model ${id}: ${error.message}`)
            }
            throw error
        }
    },

    async delete(id: string) {
        try {
            await modelRepository.delete(id)
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to delete model ${id}: ${error.message}`)
            }
            throw error
        }
    },

    async findEnabled() {
        try {
            return await modelRepository.findEnabled()
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new Error(`Failed to find enabled models: ${error.message}`)
            }
            throw error
        }
    }
} 