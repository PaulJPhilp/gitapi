import type { Entity } from "../common/entity"
import type { SupportedFeatures } from "../model"

export interface Provider extends Entity {
    name: string
    description: string
    website: string
    apiKeyRequired: boolean
    baseUrl: string | null
    isEnabled: boolean
    releaseDate: string | null
    supportedFeatures: SupportedFeatures
}

export interface ProviderApiKey extends Entity {
    providerId: string
    apiKey: string
}

export type CreateProviderParams = Omit<Provider, keyof Entity>
export type UpdateProviderParams = Partial<CreateProviderParams>

export type CreateProviderApiKeyParams = Omit<ProviderApiKey, keyof Entity>
export type UpdateProviderApiKeyParams = Partial<CreateProviderApiKeyParams> 