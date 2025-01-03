import type { Row } from "@libsql/client"
import { client } from "../../db/client"
import type { PromptRun, Usage } from "../../domain/models"

function rowToPromptRun(row: Row): PromptRun {
    return {
        id: String(row.id),
        promptId: String(row.prompt_id),
        modelId: String(row.model_id),
        providerId: String(row.provider_id),
        content: String(row.content),
        completion: String(row.completion),
        usage: JSON.parse(String(row.usage)) as Usage,
        createdAt: String(row.created_at)
    }
}

export const promptRunRepository = {
    async list(): Promise<PromptRun[]> {
        const result = await client.execute({
            sql: "SELECT * FROM prompt_runs",
            args: []
        })
        return result.rows.map(rowToPromptRun)
    },

    async findById(id: string): Promise<PromptRun | null> {
        const result = await client.execute({
            sql: "SELECT * FROM prompt_runs WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? rowToPromptRun(result.rows[0]) : null
    },

    async create(data: Omit<PromptRun, "id" | "createdAt">): Promise<PromptRun> {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        await client.execute({
            sql: "INSERT INTO prompt_runs (id, prompt_id, model_id, provider_id, content, completion, usage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [id, data.promptId, data.modelId, data.providerId, data.content, data.completion, JSON.stringify(data.usage), now]
        })

        return {
            id,
            promptId: data.promptId,
            modelId: data.modelId,
            providerId: data.providerId,
            content: data.content,
            completion: data.completion,
            usage: data.usage,
            createdAt: now
        }
    },

    async update(id: string, data: Partial<Omit<PromptRun, "id" | "createdAt">>): Promise<PromptRun> {
        const sets: string[] = []
        const values: string[] = []

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
            throw new Error("Prompt run not found after update")
        }
        return rowToPromptRun(result.rows[0])
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM prompt_runs WHERE id = ?",
            args: [id]
        })
    },

    async findByPrompt(promptId: string): Promise<PromptRun[]> {
        const result = await client.execute({
            sql: "SELECT * FROM prompt_runs WHERE prompt_id = ?",
            args: [promptId]
        })
        return result.rows.map(rowToPromptRun)
    },

    async findByModel(modelId: string): Promise<PromptRun[]> {
        const result = await client.execute({
            sql: "SELECT * FROM prompt_runs WHERE model_id = ?",
            args: [modelId]
        })
        return result.rows.map(rowToPromptRun)
    },

    async findByProvider(providerId: string): Promise<PromptRun[]> {
        const result = await client.execute({
            sql: "SELECT * FROM prompt_runs WHERE provider_id = ?",
            args: [providerId]
        })
        return result.rows.map(rowToPromptRun)
    }
} 