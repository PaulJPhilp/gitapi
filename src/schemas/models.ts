import { z } from "zod"

export interface Model {
    id: string
    name: string
    providerId: string
    modelFamily?: string
    isEnabled: boolean
    contextWindow: number
    maxTokens?: number
    defaultTemperature?: number
    inputPricePerToken: number
    outputPricePerToken: number
    supportedFeatures: {
        chat: boolean
        completion: boolean
        embedding: boolean
        imageGeneration: boolean
        imageAnalysis: boolean
        functionCalling: boolean
        streaming: boolean
    }
    releaseDate?: string
}

const SupportedFeaturesSchema = z.object({
    chat: z.boolean(),
    completion: z.boolean(),
    embedding: z.boolean(),
    imageGeneration: z.boolean(),
    imageAnalysis: z.boolean(),
    functionCalling: z.boolean(),
    streaming: z.boolean()
})

export const ModelSchema = z.object({
    id: z.string(),
    name: z.string(),
    providerId: z.string(),
    modelFamily: z.string().optional(),
    isEnabled: z.boolean(),
    contextWindow: z.number(),
    maxTokens: z.number().optional(),
    defaultTemperature: z.number().optional(),
    inputPricePerToken: z.number(),
    outputPricePerToken: z.number(),
    supportedFeatures: SupportedFeaturesSchema,
    releaseDate: z.string().optional()
}) 