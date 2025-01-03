import type { Provider } from "../schemas/providers"

export const providers: Provider[] = [
    {
        id: "openai",
        name: "OpenAI",
        description: "Leading AI research company providing state-of-the-art language models.",
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
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "AI research company focused on developing safe and ethical AI systems.",
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
            imageAnalysis: true,
            functionCalling: true,
            streaming: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "meta",
        name: "Meta AI",
        description: "Meta's AI research division developing open-source language models.",
        website: "https://ai.meta.com",
        apiKeyRequired: false,
        baseUrl: null,
        isEnabled: true,
        releaseDate: null,
        supportedFeatures: {
            chat: true,
            completion: true,
            embedding: true,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: true,
            streaming: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "google",
        name: "Google AI",
        description: "Google's AI research division developing advanced language models.",
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
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
] 