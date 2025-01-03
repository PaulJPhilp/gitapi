import type { Model } from "../schemas/models"

export const models: Model[] = [
    // OpenAI GPT-4O Models
    {
        id: "gpt-4o",
        name: "GPT-4o (2024-11-20)",
        modelFamily: "GPT-4O",
        providerId: "openai",
        releaseDate: "2024-11-20",
        isEnabled: true,
        contextWindow: 128000,
        maxTokens: 16000,
        inputPricePerToken: 0.04,
        outputPricePerToken: 0.08,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: true,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o-mini",
        modelFamily: "GPT-4O",
        providerId: "openai",
        releaseDate: "2024-11-20",
        isEnabled: true,
        contextWindow: 64000,
        maxTokens: 8000,
        inputPricePerToken: 0.02,
        outputPricePerToken: 0.04,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: true,
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        }
    },
    // ... Add the rest of the models here
] 