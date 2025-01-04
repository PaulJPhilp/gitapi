import type { Entity } from "../common/entity"

export interface Usage {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}

export interface Prompt extends Entity {
    name: string
    content: string
    isActive: boolean
    modelId: string
    templateId?: string
    templateVersion?: string
    parameters?: Record<string, unknown>
    autoUpdate?: boolean
    lastMigrationCheck?: Date
}

export interface PromptRun extends Entity {
    promptId: string
    modelId: string
    providerId: string
    content: string
    completion: string
    usage: Usage
}

export type CreatePromptParams = Omit<Prompt, keyof Entity>
export type UpdatePromptParams = Partial<CreatePromptParams>

export type CreatePromptRunParams = Omit<PromptRun, keyof Entity>
export type UpdatePromptRunParams = Partial<CreatePromptRunParams>

export type PromptUpdateStatus = 'pending' | 'completed' | 'failed' 