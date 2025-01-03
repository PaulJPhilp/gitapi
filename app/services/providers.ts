import { fetchApi } from "./api"

export interface Model {
    id: string
    name: string
    providerId: string
    isEnabled: boolean
    contextWindow: number
    maxTokens?: number
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
}

export interface Provider {
    id: string
    name: string
    isEnabled: boolean
    models: Model[]
}

export const ProvidersService = {
    getAllModels: async (): Promise<Model[]> =>
        fetchApi<Model[]>("/models"),

    getModelById: async (modelId: string): Promise<Model> =>
        fetchApi<Model>(`/models/${modelId}`),

    getModelsByProvider: async (providerId: string): Promise<Model[]> =>
        fetchApi<Model[]>(`/providers/${providerId}/models`),

    validateApiKey: async (params: {
        providerId: string
        apiKey: string
    }): Promise<boolean> => {
        const response = await fetchApi<{ isValid: boolean }>(
            `/providers/${params.providerId}/auth/validate`,
            {
                headers: {
                    "X-API-Key": params.apiKey,
                },
            }
        )
        return response.isValid
    },

    setApiKey: async (params: {
        providerId: string
        apiKey: string
    }): Promise<boolean> => {
        const response = await fetchApi<{ success: boolean }>(
            `/providers/${params.providerId}/auth`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: params.apiKey }),
            }
        )
        return response.success
    },
} 