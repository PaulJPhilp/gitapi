import { z } from "zod"

// Validate Repository Request Schema
export const ValidateRepoRequestSchema = z.object({
    owner: z.string(),
    repo: z.string()
})

// Release Request Schema
export const ReleaseRequestSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    perPage: z.number().optional(),
    page: z.number().optional()
})

// Compare Releases Request Schema
export const CompareReleasesRequestSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    base: z.string(),
    head: z.string()
})

// Provider Auth Request Schema
export const ProviderAuthRequestSchema = z.object({
    providerId: z.string(),
    apiKey: z.string()
})

// Completions Request Schema
export const CompletionsRequestSchema = z.object({
    modelId: z.string(),
    prompt: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
})

// Response Schemas
export const ValidateRepoResponseSchema = z.object({
    exists: z.boolean()
})

export const ErrorResponseSchema = z.object({
    error: z.string()
})

export const CompletionsResponseSchema = z.object({
    text: z.string(),
    usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number()
    })
})

// Derive types from schemas
export type ValidateRepoRequest = z.infer<typeof ValidateRepoRequestSchema>
export type ReleaseRequest = z.infer<typeof ReleaseRequestSchema>
export type CompareReleasesRequest = z.infer<typeof CompareReleasesRequestSchema>
export type ProviderAuthRequest = z.infer<typeof ProviderAuthRequestSchema>
export type CompletionsRequest = z.infer<typeof CompletionsRequestSchema>
export type ValidateRepoResponse = z.infer<typeof ValidateRepoResponseSchema>
export type CompletionsResponse = z.infer<typeof CompletionsResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema> 