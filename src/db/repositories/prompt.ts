import type { Prompt } from "@/domain"
import { client } from "@/src/db/db"
import type { Row } from "@libsql/client"
import { nanoid } from "nanoid/non-secure"
import type { PromptRepository } from "./types"

const generateId = () => nanoid(10)

function rowToPrompt(row: Row): Prompt {
    return {
        id: String(row.id),
        name: String(row.name),
        content: String(row.content),
        isActive: Boolean(row.is_active),
        modelId: String(row.model_id),
        templateId: String(row.template_id),
        lastMigrationCheck: new Date(String(row.last_migration_check)),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

export class DefaultPromptRepository implements PromptRepository {
    async findById(id: string): Promise<Prompt | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE id = ?",
                args: [id]
            })
            return result.rows[0] ? rowToPrompt(result.rows[0]) : null
        } catch (error) {
            throw new Error(`Failed to find prompt: ${error}`)
        }
    }

    async findAll(): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts",
                args: []
            })
            return result.rows.map(rowToPrompt)
        } catch (error) {
            throw new Error(`Failed to find prompts: ${error}`)
        }
    }

    async create(prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt">): Promise<Prompt> {
        try {
            const id = generateId()
            const now = new Date().toISOString()

            await client.execute({
                sql: `INSERT INTO prompts (
                    id, name, content, is_active, model_id, template_id,
                    last_migration_check, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    prompt.name,
                    prompt.content,
                    prompt.isActive,
                    prompt.modelId,
                    prompt.templateId,
                    prompt.lastMigrationCheck.toISOString(),
                    now,
                    now
                ]
            })

            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new Error("Failed to find created prompt")
            }

            return rowToPrompt(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to create prompt: ${error}`)
        }
    }

    async update(id: string, data: Partial<Prompt>): Promise<Prompt> {
        try {
            const sets: string[] = []
            const values: (string | boolean | null | Date)[] = []
            const now = new Date().toISOString()

            if (data.name !== undefined) {
                sets.push("name = ?")
                values.push(data.name)
            }

            if (data.content !== undefined) {
                sets.push("content = ?")
                values.push(data.content)
            }

            if (data.isActive !== undefined) {
                sets.push("is_active = ?")
                values.push(data.isActive)
            }

            if (data.modelId !== undefined) {
                sets.push("model_id = ?")
                values.push(data.modelId)
            }

            if (data.templateId !== undefined) {
                sets.push("template_id = ?")
                values.push(data.templateId)
            }

            if (data.lastMigrationCheck !== undefined) {
                sets.push("last_migration_check = ?")
                values.push(data.lastMigrationCheck.toISOString())
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

            if (!result.rows[0]) {
                throw new Error("Failed to find updated prompt")
            }

            return rowToPrompt(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to update prompt: ${error}`)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await client.execute({
                sql: "DELETE FROM prompts WHERE id = ?",
                args: [id]
            })
        } catch (error) {
            throw new Error(`Failed to delete prompt: ${error}`)
        }
    }

    async findByModel(modelId: string): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE model_id = ?",
                args: [modelId]
            })
            return result.rows.map(rowToPrompt)
        } catch (error) {
            throw new Error(`Failed to find prompts by model: ${error}`)
        }
    }

    async findActive(): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE is_active = ?",
                args: [true]
            })
            return result.rows.map(rowToPrompt)
        } catch (error) {
            throw new Error(`Failed to find active prompts: ${error}`)
        }
    }
}
