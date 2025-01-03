export interface Model {
    id: string
    name: string
    description: string
    providerId: string
    isEnabled: boolean
    createdAt: string
    updatedAt: string
    modelFamily: string | null
    contextWindow: number
    maxTokens: number | null
    inputPricePerToken: string
    outputPricePerToken: string
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

export interface Prompt {
    id: string
    name: string
    content: string
    isActive: boolean
    modelId: string
    createdAt: string
    updatedAt: string
}

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