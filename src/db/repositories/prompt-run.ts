import type { PromptRun } from "@/domain"
import { client } from "@/src/db/db"
import type { Row } from "@libsql/client"
import { nanoid } from "nanoid/non-secure"
import type { PromptRunRepository } from "./types"

const generateId = () => nanoid(10)

function rowToPromptRun(row: Row): PromptRun {
    return {
        id: String(row.id),
        promptId: String(row.prompt_id),
        modelId: String(row.model_id),
        providerId: String(row.provider_id),
        content: String(row.content),
        completion: String(row.completion),
        usage: JSON.parse(String(row.usage)),
        createdAt: String(row.created_at)
    }
}

export class DefaultPromptRunRepository implements PromptRunRepository {
    async findById(id: string): Promise<PromptRun | null> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE id = ?",
                args: [id]
            })
            return result.rows[0] ? rowToPromptRun(result.rows[0]) : null
        } catch (error) {
            throw new Error(`Failed to find prompt run: ${error}`)
        }
    }

    async findAll(): Promise<PromptRun[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs",
                args: []
            })
            return result.rows.map(rowToPromptRun)
        } catch (error) {
            throw new Error(`Failed to find prompt runs: ${error}`)
        }
    }

    async create(promptRun: Omit<PromptRun, "id" | "createdAt">): Promise<PromptRun> {
        try {
            const id = generateId()
            const now = new Date().toISOString()

            await client.execute({
                sql: "INSERT INTO prompt_runs (id, prompt_id, model_id, provider_id, content, completion, usage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                args: [id, promptRun.promptId, promptRun.modelId, promptRun.providerId, promptRun.content, promptRun.completion, JSON.stringify(promptRun.usage), now]
            })

            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new Error("Failed to find created prompt run")
            }

            return rowToPromptRun(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to create prompt run: ${error}`)
        }
    }

    async update(id: string, data: Partial<PromptRun>): Promise<PromptRun> {
        try {
            const sets: string[] = []
            const values: (string | null)[] = []

            if (data.promptId !== undefined) {
                sets.push("prompt_id = ?")
                values.push(data.promptId)
            }

            if (data.modelId !== undefined) {
                sets.push("model_id = ?")
                values.push(data.modelId)
            }

            if (data.providerId !== undefined) {
                sets.push("provider_id = ?")
                values.push(data.providerId)
            }

            if (data.content !== undefined) {
                sets.push("content = ?")
                values.push(data.content)
            }

            if (data.completion !== undefined) {
                sets.push("completion = ?")
                values.push(data.completion)
            }

            if (data.usage !== undefined) {
                sets.push("usage = ?")
                values.push(JSON.stringify(data.usage))
            }

            if (sets.length > 0) {
                values.push(id)

                await client.execute({
                    sql: `UPDATE prompt_runs SET ${sets.join(", ")} WHERE id = ?`,
                    args: values
                })
            }

            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new Error("Failed to find updated prompt run")
            }

            return rowToPromptRun(result.rows[0])
        } catch (error) {
            throw new Error(`Failed to update prompt run: ${error}`)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await client.execute({
                sql: "DELETE FROM prompt_runs WHERE id = ?",
                args: [id]
            })
        } catch (error) {
            throw new Error(`Failed to delete prompt run: ${error}`)
        }
    }

    async findByPrompt(promptId: string): Promise<PromptRun[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE prompt_id = ?",
                args: [promptId]
            })
            return result.rows.map(rowToPromptRun)
        } catch (error) {
            throw new Error(`Failed to find prompt runs by prompt: ${error}`)
        }
    }

    async findByModel(modelId: string): Promise<PromptRun[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE model_id = ?",
                args: [modelId]
            })
            return result.rows.map(rowToPromptRun)
        } catch (error) {
            throw new Error(`Failed to find prompt runs by model: ${error}`)
        }
    }

    async findByProvider(providerId: string): Promise<PromptRun[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs WHERE provider_id = ?",
                args: [providerId]
            })
            return result.rows.map(rowToPromptRun)
        } catch (error) {
            throw new Error(`Failed to find prompt runs by provider: ${error}`)
        }
    }

    async findRecent(limit: number): Promise<PromptRun[]> {
        try {
            const result = await client.execute({
                sql: "SELECT * FROM prompt_runs ORDER BY created_at DESC LIMIT ?",
                args: [limit]
            })
            return result.rows.map(rowToPromptRun)
        } catch (error) {
            throw new Error(`Failed to find recent prompt runs: ${error}`)
        }
    }
}
