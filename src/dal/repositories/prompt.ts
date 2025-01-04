import { client } from "@/db/client"
import type { Prompt } from "@/domain/models"
import { DatabaseError, EntityNotFoundError } from "../errors"
import type { Repository } from "../interfaces/repository"
import { mapRowToPrompt } from "../mappers/prompt"

export interface PromptRepository extends Repository<Prompt, Omit<Prompt, "id" | "createdAt" | "updatedAt">> {
    findByModel(modelId: string): Promise<Prompt[]>
    findActive(): Promise<Prompt[]>
}

export const promptRepository: PromptRepository = {
    async list(): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts",
                args: []
            })
            return result.rows.map(mapRowToPrompt)
        } catch (error) {
            throw new DatabaseError('list', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findById(id: string): Promise<Prompt | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE id = ?",
                args: [id]
            })
            return result.rows[0] ? mapRowToPrompt(result.rows[0]) : null
        } catch (error) {
            throw new DatabaseError('findById', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async create(data: Omit<Prompt, "id" | "createdAt" | "updatedAt">): Promise<Prompt> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            await client.execute({
                sql: `INSERT INTO prompts (
                    id, name, content, is_active, model_id,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    data.name,
                    data.content,
                    data.isActive,
                    data.modelId,
                    now,
                    now
                ]
            })

            return {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<Prompt, "id" | "createdAt" | "updatedAt">>): Promise<Prompt | null> {
        try {
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

            if (!result.rows[0]) {
                throw new EntityNotFoundError('Prompt', id)
            }

            return mapRowToPrompt(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const result = await client.execute({
                sql: "DELETE FROM prompts WHERE id = ?",
                args: [id]
            })

            if (result.rowsAffected === 0) {
                throw new EntityNotFoundError('Prompt', id)
            }
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('delete', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findByModel(modelId: string): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE model_id = ?",
                args: [modelId]
            })
            return result.rows.map(mapRowToPrompt)
        } catch (error) {
            throw new DatabaseError('findByModel', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async findActive(): Promise<Prompt[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompts WHERE is_active = true",
                args: []
            })
            return result.rows.map(mapRowToPrompt)
        } catch (error) {
            throw new DatabaseError('findActive', error instanceof Error ? error.message : 'Unknown error')
        }
    }
} 
