import { z } from "zod"

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

const UsageSchema = z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
})

export const PromptRunSchema = z.object({
    id: z.string(),
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string(),
    completion: z.string(),
    usage: UsageSchema,
    createdAt: z.string()
})

export interface CreatePromptRunRequest {
    promptId: string
    modelId: string
    providerId: string
    content: string
}

export const CreatePromptRunRequestSchema = z.object({
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string()
}) 