import { z } from "zod"

export const baseSchema = z.object({
    id: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
})

export type BaseSchema = z.infer<typeof baseSchema>

export const baseNewSchema = z.object({
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
})

export type BaseNewSchema = z.infer<typeof baseNewSchema>

export const supportedFeaturesSchema = z.object({
    chat: z.boolean(),
    completion: z.boolean(),
    embedding: z.boolean(),
    imageGeneration: z.boolean(),
    imageAnalysis: z.boolean(),
    functionCalling: z.boolean(),
    streaming: z.boolean()
})

export const usageSchema = z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
}) 