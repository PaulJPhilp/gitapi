interface Provider {
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
}

interface Model {
    id: string
    name: string
    providerId: string
    contextWindow: number
    isEnabled: boolean
    maxOutputTokens?: number
    costPer1kInput?: number
    costPer1kOutput?: number
}

export const providers: Provider[] = [
    {
        id: "openai",
        name: "OpenAI",
        description: "Leading AI research company",
        website: "https://openai.com",
        apiKeyRequired: true,
        baseUrl: "https://api.openai.com/v1",
        isEnabled: true,
        releaseDate: null,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: true,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "AI research company focused on safe and ethical AI",
        website: "https://anthropic.com",
        apiKeyRequired: true,
        baseUrl: "https://api.anthropic.com/v1",
        isEnabled: true,
        releaseDate: null,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "google",
        name: "Google AI",
        description: "Google's AI research division",
        website: "https://ai.google.dev",
        apiKeyRequired: true,
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        isEnabled: true,
        releaseDate: null,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: true,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    }
]

export const models: Model[] = [
    {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        providerId: "openai",
        contextWindow: 128000,
        maxOutputTokens: 4096,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
        isEnabled: true
    },
    {
        id: "gpt-4",
        name: "GPT-4",
        providerId: "openai",
        contextWindow: 8192,
        maxOutputTokens: 4096,
        costPer1kInput: 0.03,
        costPer1kOutput: 0.06,
        isEnabled: true
    },
    {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        providerId: "openai",
        contextWindow: 16385,
        maxOutputTokens: 4096,
        costPer1kInput: 0.0005,
        costPer1kOutput: 0.0015,
        isEnabled: true
    },
    {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        providerId: "anthropic",
        contextWindow: 200000,
        maxOutputTokens: 4096,
        costPer1kInput: 0.015,
        costPer1kOutput: 0.075,
        isEnabled: true
    },
    {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        providerId: "anthropic",
        contextWindow: 200000,
        maxOutputTokens: 4096,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
        isEnabled: true
    },
    {
        id: "gemini-pro",
        name: "Gemini Pro",
        providerId: "google",
        contextWindow: 32768,
        maxOutputTokens: 2048,
        costPer1kInput: 0.00025,
        costPer1kOutput: 0.0005,
        isEnabled: true
    }
] 