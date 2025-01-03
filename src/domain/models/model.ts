export interface SupportedFeatures {
    chat: boolean
    completion: boolean
    embedding: boolean
    imageGeneration: boolean
    imageAnalysis: boolean
    functionCalling: boolean
    streaming: boolean
}

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
    supportedFeatures: SupportedFeatures
}

export interface NewModel extends Omit<Model, 'id' | 'createdAt' | 'updatedAt'> { } 