import { z } from "zod"

// Base schemas
const UsageSchema = z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
})

const CompletionOptionsSchema = z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional()
})

// Request/Response schemas
export const RunPromptRequestSchema = z.object({
    modelId: z.string(),
    options: CompletionOptionsSchema.optional()
})

export const PromptExecutionResultSchema = z.object({
    id: z.string(),
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string(),
    completion: z.string(),
    usage: UsageSchema.optional(),
    createdAt: z.string()
})

// Type exports
export type RunPromptRequest = z.infer<typeof RunPromptRequestSchema>
export type PromptExecutionResult = z.infer<typeof PromptExecutionResultSchema> 