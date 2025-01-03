import zod from "zod"

export interface Provider {
    id: string
    name: string
    description: string
    website: string
    apiKeyRequired: boolean
    baseUrl: string | null
    isEnabled: boolean
    releaseDate: string | null
    supportedFeatures: {
        chat: boolean
        completion: boolean
        embedding: boolean
        imageGeneration: boolean
        imageAnalysis: boolean
        functionCalling: boolean
        streaming: boolean
    }
    createdAt: string
    updatedAt: string
}

export const providerSchema = zod.object({
    name: zod.string(),
    description: zod.string(),
    website: zod.string(),
    apiKeyRequired: zod.boolean(),
    baseUrl: zod.string().nullable(),
    isEnabled: zod.boolean(),
    releaseDate: zod.string().nullable(),
    supportedFeatures: zod.object({
        chat: zod.boolean(),
        completion: zod.boolean(),
        embedding: zod.boolean(),
        imageGeneration: zod.boolean(),
        imageAnalysis: zod.boolean(),
        functionCalling: zod.boolean(),
        streaming: zod.boolean()
    })
})

export type CreateProviderRequest = {
    name: string
    description: string
    website: string
    apiKeyRequired: boolean
    baseUrl: string | null
    releaseDate: string | null
    supportedFeatures: {
        chat: boolean
        completion: boolean
        embedding: boolean
        imageGeneration: boolean
        imageAnalysis: boolean
        functionCalling: boolean
        streaming: boolean
    }
}

export const CreateProviderRequestSchema = zod.object({
    name: zod.string(),
    description: zod.string(),
    website: zod.string(),
    apiKeyRequired: zod.boolean(),
    baseUrl: zod.string().nullable(),
    releaseDate: zod.string().nullable(),
    supportedFeatures: zod.object({
        chat: zod.boolean(),
        completion: zod.boolean(),
        embedding: zod.boolean(),
        imageGeneration: zod.boolean(),
        imageAnalysis: zod.boolean(),
        functionCalling: zod.boolean(),
        streaming: zod.boolean()
    })
})

export type UpdateProviderRequest = {
    name?: string
    description?: string
    website?: string
    apiKeyRequired?: boolean
    baseUrl?: string | null
    isEnabled?: boolean
    releaseDate?: string | null
    supportedFeatures?: {
        chat: boolean
        completion: boolean
        embedding: boolean
        imageGeneration: boolean
        imageAnalysis: boolean
        functionCalling: boolean
        streaming: boolean
    }
}

export const UpdateProviderRequestSchema = zod.object({
    name: zod.string().optional(),
    description: zod.string().optional(),
    website: zod.string().optional(),
    apiKeyRequired: zod.boolean().optional(),
    baseUrl: zod.string().nullable().optional(),
    isEnabled: zod.boolean().optional(),
    releaseDate: zod.string().nullable().optional(),
    supportedFeatures: zod.object({
        chat: zod.boolean(),
        completion: zod.boolean(),
        embedding: zod.boolean(),
        imageGeneration: zod.boolean(),
        imageAnalysis: zod.boolean(),
        functionCalling: zod.boolean(),
        streaming: zod.boolean()
    }).optional()
}) 