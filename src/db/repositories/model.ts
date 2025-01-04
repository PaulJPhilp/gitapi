import { client } from "@/src/db/db"
import type { Row } from "@libsql/client"
import { nanoid } from "nanoid/non-secure"
import type { Model } from "../../domain/models"
import type { ModelRepository } from "./types"

const generateId = () => nanoid(10)

function rowToModel(row: Row): Model {
    return {
        id: String(row.id),
        name: String(row.name),
        description: row.description ? String(row.description) : null,
        providerId: String(row.provider_id),
        isEnabled: Boolean(row.is_enabled),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
        modelFamily: row.model_family ? String(row.model_family) : null,
        contextWindow: Number(row.context_window),
        maxTokens: row.max_tokens ? Number(row.max_tokens) : null,
        inputPricePerToken: String(row.input_price_per_token),
        outputPricePerToken: String(row.output_price_per_token),
        releaseDate: row.release_date ? String(row.release_date) : null,
        type: row.type as 'proprietary' | 'open source',
        reasoning: Boolean(row.reasoning),
        supportedFeatures: typeof row.supported_features === 'string'
            ? JSON.parse(String(row.supported_features))
            : {
                chat: false,
                completion: false,
                embedding: false,
                imageGeneration: false,
                imageAnalysis: false,
                functionCalling: false,
                streaming: false
            }
    }
}

export class DefaultModelRepository implements ModelRepository {
    async findById(id: string): Promise<Model | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM models WHERE id = ?",
                args: [id]
            })
            return result.rows[0] ? rowToModel(result.rows[0]) : null
        } catch (error) {
            throw new Error(`Failed to find model: ${error}`)
        }
    }

    async findAll(): Promise<Model[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM models",
                args: []
            })
            return result.rows.map(rowToModel)
        } catch (error) {
            throw new Error(`Failed to find models: ${error}`)
        }
    }

    async create(model: Omit<Model, "id" | "createdAt" | "updatedAt">): Promise<Model> {
        try {
            const id = generateId()
            const now = new Date().toISOString()

            await client.execute({
                sql: "INSERT INTO models (id, name, description, provider_id, is_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                args: [id, model.name, model.description, model.providerId, model.isEnabled, now, now]
            })

            const result = await client.execute({
                sql: "SELECT * FROM models WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new Error("Failed to find created model")
            }

            return rowToModel(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to create model: ${error}`)
        }
    }

    async update(id: string, data: Partial<Model>): Promise<Model> {
        try {
            const now = new Date().toISOString()
            const sets: string[] = []
            const values: (string | boolean | null)[] = []

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

            if (sets.length > 0) {
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
                throw new Error("Failed to find updated model")
            }

            return rowToModel(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to update model: ${error}`)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await client.execute({
                sql: "DELETE FROM models WHERE id = ?",
                args: [id]
            })
        } catch (error) {
            throw new Error(`Failed to delete model: ${error}`)
        }
    }

    async findByProvider(providerId: string): Promise<Model[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM models WHERE provider_id = ?",
                args: [providerId]
            })
            return result.rows.map(rowToModel)
        } catch (error) {
            throw new Error(`Failed to find models by provider: ${error}`)
        }
    }

    async findEnabled(): Promise<Model[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM models WHERE is_enabled = ?",
                args: [true]
            })
            return result.rows.map(rowToModel)
        } catch (error) {
            throw new Error(`Failed to find enabled models: ${error}`)
        }
    }
}
