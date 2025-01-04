import type { Prompt, PromptUpdateStatus } from "../../../domain/models";

export interface PromptRepository {
    create(prompt: Prompt): Promise<string>;
    getById(id: string): Promise<Prompt | null>;
    getByTemplateId(templateId: string): Promise<Prompt[]>;
    update(prompt: Prompt): Promise<void>;
    updateStatus(id: string, status: PromptUpdateStatus): Promise<void>;
    cleanup(maxAge?: number): Promise<void>;
    clearUpdateHistory(maxAge?: number): Promise<void>;
}

export class PromptRepositoryImpl implements PromptRepository {
    private prompts: Map<string, Prompt> = new Map()
    private updateStatuses: Map<string, PromptUpdateStatus> = new Map()
    private readonly DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    private readonly DEFAULT_HISTORY_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days for update history

    async create(prompt: Prompt): Promise<string> {
        await this.cleanup() // Cleanup before adding new data
        const id = crypto.randomUUID()
        this.prompts.set(id, { ...prompt, id })
        return id
    }

    async getById(id: string): Promise<Prompt | null> {
        return this.prompts.get(id) ?? null
    }

    async getByTemplateId(templateId: string): Promise<Prompt[]> {
        return Array.from(this.prompts.values())
            .filter(prompt => prompt.templateId === templateId)
    }

    async update(prompt: Prompt): Promise<void> {
        if (!this.prompts.has(prompt.id)) {
            throw new Error(`Prompt ${prompt.id} not found`)
        }
        this.prompts.set(prompt.id, prompt)
    }

    async updateStatus(id: string, status: PromptUpdateStatus): Promise<void> {
        await this.clearUpdateHistory() // Cleanup old history before adding new status
        this.updateStatuses.set(id, status)
    }

    async cleanup(maxAge: number = this.DEFAULT_MAX_AGE): Promise<void> {
        const now = Date.now()

        // Cleanup old prompts
        for (const [id, prompt] of this.prompts) {
            const age = now - prompt.lastMigrationCheck.getTime()

            // Remove if prompt hasn't been checked in a long time
            if (age > maxAge) {
                this.prompts.delete(id)
                this.updateStatuses.delete(id)
            }
        }

        // Cleanup orphaned update statuses
        for (const [promptId, _] of this.updateStatuses) {
            if (!this.prompts.has(promptId)) {
                this.updateStatuses.delete(promptId)
            }
        }
    }

    async clearUpdateHistory(maxAge: number = this.DEFAULT_HISTORY_AGE): Promise<void> {
        const now = Date.now()

        // Cleanup old update history
        for (const [id, status] of this.updateStatuses) {
            const filteredHistory = status.updateHistory.filter(update => {
                const age = now - update.timestamp.getTime()
                return age <= maxAge
            })

            if (filteredHistory.length !== status.updateHistory.length) {
                this.updateStatuses.set(id, {
                    ...status,
                    updateHistory: filteredHistory
                })
            }

            // If all history is old, remove the entire status
            if (filteredHistory.length === 0) {
                this.updateStatuses.delete(id)
            }
        }
    }
}