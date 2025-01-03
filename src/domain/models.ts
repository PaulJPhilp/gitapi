export interface Model {
    id: string
    name: string
    description: string | null
    providerId: string
    isEnabled: boolean
    modelFamily: string | null
    contextWindow: number
    maxTokens: number | null
    inputPricePerToken: string
    outputPricePerToken: string
    releaseDate: string | null
    supportedFeatures: SupportedFeatures
    createdAt: string
    updatedAt: string
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

export interface Usage {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}

export type NewPromptRun = Omit<PromptRun, "id" | "createdAt">

export interface PromptRun {
    id: string
    promptId: string
    modelId: string
    providerId: string
    content: string
    completion: string
    usage: Usage
    createdAt: string
}

export interface SupportedFeatures {
    chat: boolean
    completion: boolean
    embedding: boolean
    imageGeneration: boolean
    imageAnalysis: boolean
    functionCalling: boolean
    streaming: boolean
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
    supportedFeatures: SupportedFeatures
    createdAt: string
    updatedAt: string
}

export interface ProviderApiKey {
    providerId: string
    apiKey: string
    createdAt: string
    updatedAt: string
} 