import type { Row } from "@libsql/client"
import { client } from "../../db/client"
import type { Prompt } from "../../domain/models"

function rowToPrompt(row: Row): Prompt {
    return {
        id: String(row.id),
        name: String(row.name),
        content: String(row.content),
        isActive: Boolean(row.is_active),
        modelId: String(row.model_id),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

export const promptRepository = {
    async list(): Promise<Prompt[]> {
        const result = await client.execute({
            sql: "SELECT * FROM prompts",
            args: []
        })
        return result.rows.map(rowToPrompt)
    },

    async findById(id: string): Promise<Prompt | null> {
        const result = await client.execute({
            sql: "SELECT * FROM prompts WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? rowToPrompt(result.rows[0]) : null
    },

    async create(data: Omit<Prompt, "id" | "createdAt" | "updatedAt">): Promise<Prompt> {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        await client.execute({
            sql: "INSERT INTO prompts (id, name, content, is_active, model_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [id, data.name, data.content, data.isActive, data.modelId, now, now]
        })

        return {
            id,
            name: data.name,
            content: data.content,
            isActive: data.isActive,
            modelId: data.modelId,
            createdAt: now,
            updatedAt: now
        }
    },

    async update(id: string, data: Partial<Omit<Prompt, "id" | "createdAt" | "updatedAt">>): Promise<Prompt> {
        const sets: string[] = []
        const values: (string | boolean)[] = []
        const now = new Date().toISOString()

        if (data.name !== undefined) {
            sets.push("name = ?")
            values.push(data.name)
        }

        if (data.content !== undefined) {
            sets.push("content = ?")
            values.push(data.content)
        }

        if (data.modelId !== undefined) {
            sets.push("model_id = ?")
            values.push(data.modelId)
        }

        if (data.isActive !== undefined) {
            sets.push("is_active = ?")
            values.push(data.isActive)
        }

        if (sets.length > 0) {
            sets.push("updated_at = ?")
            values.push(now)
            values.push(id)
            await client.execute({
                sql: `UPDATE prompts SET ${sets.join(", ")} WHERE id = ?`,
                args: values
            })
        }

        const result = await client.execute({
            sql: "SELECT * FROM prompts WHERE id = ?",
            args: [id]
        })
        return rowToPrompt(result.rows[0])
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM prompts WHERE id = ?",
            args: [id]
        })
    }
} 
