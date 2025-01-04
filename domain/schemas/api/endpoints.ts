import { z } from "zod"

// Repository validation
export const ValidateRepoRequestSchema = z.object({
    owner: z.string(),
    repo: z.string()
})

export const ValidateRepoResponseSchema = z.object({
    exists: z.boolean()
})

// Release management
export const ReleaseRequestSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    perPage: z.number().optional(),
    page: z.number().optional()
})

export const CompareReleasesRequestSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    base: z.string(),
    head: z.string()
})

// Provider authentication
export const ProviderAuthRequestSchema = z.object({
    providerId: z.string(),
    apiKey: z.string()
})

// Completions
export const CompletionsRequestSchema = z.object({
    modelId: z.string(),
    prompt: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
})

export const CompletionsResponseSchema = z.object({
    text: z.string(),
    usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number()
    })
})

// Common responses
export const ErrorResponseSchema = z.object({
    error: z.string()
}) 