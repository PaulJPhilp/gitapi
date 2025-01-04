import { client } from "../../db/client"
import type { Model } from "../../domain/models"
import { DatabaseError, EntityNotFoundError } from "../errors"
import type { Repository } from "../interfaces/repository"
import { mapRowToModel } from "../mappers/model"
import { validateModel } from "../validation"

export interface ModelRepository extends Repository<Model, Omit<Model, "id" | "createdAt" | "updatedAt">> {
    findByProvider(providerId: string): Promise<Model[]>
    findEnabled(): Promise<Model[]>
}

export const modelRepository: ModelRepository = {
    async list(): Promise<Model[]> {
        const result = await client.execute({
            sql: "SELECT * FROM models",
            args: []
        })
        return result.rows.map(rowToModel)
    },

    async findById(id: string): Promise<Model | null> {
        const result = await client.execute({
            sql: "SELECT * FROM models WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? rowToModel(result.rows[0]) : null
    },

    async create(data: Omit<Model, "id" | "createdAt" | "updatedAt">): Promise<Model> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            const model: Model = {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }

            validateModel(model)

            await client.execute({
                sql: `INSERT INTO models (
                    id, name, description, provider_id, is_enabled, 
                    model_family, context_window, max_tokens,
                    input_price_per_token, output_price_per_token,
                    release_date, type, reasoning,
                    supported_features, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id, data.name, data.description, data.providerId, data.isEnabled,
                    data.modelFamily, data.contextWindow, data.maxTokens,
                    data.inputPricePerToken, data.outputPricePerToken,
                    data.releaseDate, data.type, data.reasoning,
                    JSON.stringify(data.supportedFeatures), now, now
                ]
            })

            return model
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<Model, "id" | "createdAt" | "updatedAt">>): Promise<Model | null> {
        try {
            // First get the existing model to validate the complete updated entity
            const existing = await this.findById(id)
            if (!existing) {
                throw new EntityNotFoundError('Model', id)
            }

            const sets: string[] = []
            const values: (string | number | boolean | null)[] = []
            const now = new Date().toISOString()

            if (data.name !== undefined) {
                sets.push("name = ?")
                values.push(data.name)
            }

            if (data.description !== undefined) {
                sets.push("description = ?")
                values.push(data.description)
            }

            if (data.providerId !== undefined) {
                sets.push("provider_id = ?")
                values.push(data.providerId)
            }

            if (data.isEnabled !== undefined) {
                sets.push("is_enabled = ?")
                values.push(data.isEnabled)
            }

            if (data.modelFamily !== undefined) {
                sets.push("model_family = ?")
                values.push(data.modelFamily)
            }

            if (data.contextWindow !== undefined) {
                sets.push("context_window = ?")
                values.push(data.contextWindow)
            }

            if (data.maxTokens !== undefined) {
                sets.push("max_tokens = ?")
                values.push(data.maxTokens)
            }

            if (data.inputPricePerToken !== undefined) {
                sets.push("input_price_per_token = ?")
                values.push(data.inputPricePerToken)
            }

            if (data.outputPricePerToken !== undefined) {
                sets.push("output_price_per_token = ?")
                values.push(data.outputPricePerToken)
            }

            if (data.releaseDate !== undefined) {
                sets.push("release_date = ?")
                values.push(data.releaseDate)
            }

            if (data.type !== undefined) {
                sets.push("type = ?")
                values.push(data.type)
            }

            if (data.reasoning !== undefined) {
                sets.push("reasoning = ?")
                values.push(data.reasoning)
            }

            if (data.supportedFeatures !== undefined) {
                sets.push("supported_features = ?")
                values.push(JSON.stringify(data.supportedFeatures))
            }

            if (sets.length > 0) {
                // Validate the complete updated model before saving
                const updatedModel: Model = {
                    ...existing,
                    ...data,
                    updatedAt: now
                }
                validateModel(updatedModel)

                sets.push("updated_at = ?")
                values.push(now)
                values.push(id)
                await client.execute({
                    sql: `UPDATE models SET ${sets.join(", ")} WHERE id = ?`,
                    args: values
                })
            }

            const result = await client.execute({
                sql: "SELECT * FROM models WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new EntityNotFoundError('Model', id)
            }

            return mapRowToModel(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM models WHERE id = ?",
            args: [id]
        })
    },

    async findByProvider(providerId: string): Promise<Model[]> {
        const result = await client.execute({
            sql: "SELECT * FROM models WHERE provider_id = ?",
            args: [providerId]
        })
        return result.rows.map(rowToModel)
    },

    async findEnabled(): Promise<Model[]> {
        const result = await client.execute({
            sql: "SELECT * FROM models WHERE is_enabled = true",
            args: []
        })
        return result.rows.map(rowToModel)
    }
} 