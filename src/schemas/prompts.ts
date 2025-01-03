import zod from "zod"

export interface Prompt {
    id: string
    name: string
    content: string
    isActive: boolean
    modelId: string
    createdAt: string
    updatedAt: string
}

export const promptSchema = zod.object({
    name: zod.string(),
    content: zod.string(),
    isActive: zod.boolean(),
    modelId: zod.string()
})

export type CreatePromptRequest = {
    name: string
    content: string
    modelId: string
}

export const CreatePromptRequestSchema = zod.object({
    name: zod.string(),
    content: zod.string(),
    modelId: zod.string()
})

export type UpdatePromptRequest = {
    name?: string
    content?: string
    isActive?: boolean
    modelId?: string
}

export const UpdatePromptRequestSchema = zod.object({
    name: zod.string().optional(),
    content: zod.string().optional(),
    isActive: zod.boolean().optional(),
    modelId: zod.string().optional()
})

// PromptRun types and schemas
export interface PromptRun {
    id: string
    promptId: string
    modelId: string
    providerId: string
    content: string
    completion: string
    usage: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
    }
    createdAt: string
}

const UsageSchema = zod.object({
    promptTokens: zod.number(),
    completionTokens: zod.number(),
    totalTokens: zod.number()
})

export const PromptRunSchema = zod.object({
    id: zod.string(),
    promptId: zod.string(),
    modelId: zod.string(),
    providerId: zod.string(),
    content: zod.string(),
    completion: zod.string(),
    usage: UsageSchema,
    createdAt: zod.string()
})

export type CreatePromptRunRequest = {
    promptId: string
    modelId: string
    content: string
}

export const CreatePromptRunRequestSchema = zod.object({
    promptId: zod.string(),
    modelId: zod.string(),
    content: zod.string()
}) 