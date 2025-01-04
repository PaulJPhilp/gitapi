import type { Entity } from "../common/entity"

export interface SupportedFeatures {
    chat: boolean
    completion: boolean
    embedding: boolean
    imageGeneration: boolean
    imageAnalysis: boolean
    functionCalling: boolean
    streaming: boolean
}

export interface Model extends Entity {
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
    type: 'proprietary' | 'open source'
    reasoning: boolean
    supportedFeatures: SupportedFeatures
}

export type CreateModelParams = Omit<Model, keyof Entity>
export type UpdateModelParams = Partial<CreateModelParams> 