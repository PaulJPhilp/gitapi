import type { Row } from "@libsql/client"
import { client } from "../../db/client"
import type { Model } from "../../domain/models"

function rowToModel(row: Row): Model {
    return {
        id: String(row.id),
        name: String(row.name),
        description: row.description === null ? null : String(row.description),
        providerId: String(row.provider_id),
        isEnabled: Boolean(row.is_enabled),
        modelFamily: String(row.model_family),
        contextWindow: Number(row.context_window),
        maxTokens: Number(row.max_tokens),
        inputPricePerToken: String(row.input_price_per_token),
        outputPricePerToken: String(row.output_price_per_token),
        supportedFeatures: JSON.parse(String(row.supported_features)),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    } as Model
}

export const modelRepository = {
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
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        await client.execute({
            sql: `INSERT INTO models (
                id, name, description, provider_id, is_enabled, 
                model_family, context_window, max_tokens,
                input_price_per_token, output_price_per_token,
                supported_features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id, data.name, data.description, data.providerId, data.isEnabled,
                data.modelFamily, data.contextWindow, data.maxTokens,
                data.inputPricePerToken, data.outputPricePerToken,
                JSON.stringify(data.supportedFeatures), now, now
            ]
        })

        return {
            id,
            createdAt: now,
            updatedAt: now,
            ...data
        }
    },

    async update(id: string, data: Partial<Omit<Model, "id" | "createdAt" | "updatedAt">>): Promise<Model> {
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

        if (data.supportedFeatures !== undefined) {
            sets.push("supported_features = ?")
            values.push(JSON.stringify(data.supportedFeatures))
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
        return rowToModel(result.rows[0])
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM models WHERE id = ?",
            args: [id]
        })
    }
} 