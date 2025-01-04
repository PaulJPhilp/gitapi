import { API_BASE_URL } from "../../../src/config/api"

interface CreateModelOptions {
    name?: string
    description?: string | null
    providerId?: string
    modelFamily?: string
    isEnabled?: boolean
    contextWindow?: number
    maxTokens?: number | null
    inputPricePerToken?: string
    outputPricePerToken?: string
    releaseDate?: string | null
    supportedFeatures?: {
        chat?: boolean
        completion?: boolean
        embedding?: boolean
        imageGeneration?: boolean
        imageAnalysis?: boolean
        functionCalling?: boolean
        streaming?: boolean
    }
}

interface CreatePromptOptions {
    name?: string
    content?: string
    modelId: string
    isActive?: boolean
    templateId?: string
    lastMigrationCheck?: Date
}

interface CreateCompletionOptions {
    modelId: string
    promptId: string
    prompt?: string
    temperature?: number
    maxTokens?: number
}

export async function createTestModel(options: CreateModelOptions = {}) {
    const {
        name = 'Test Model',
        description = 'A test model',
        providerId = 'openai',
        modelFamily = 'Test',
        isEnabled = true,
        contextWindow = 4096,
        maxTokens = 1024,
        inputPricePerToken = '0.01',
        outputPricePerToken = '0.02',
        releaseDate = new Date().toISOString(),
        supportedFeatures = {
            chat: true,
            completion: true,
            embedding: false,
            imageGeneration: false,
            imageAnalysis: false,
            functionCalling: false,
            streaming: true
        }
    } = options

    const response = await fetch(`${API_BASE_URL}/models`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            providerId,
            modelFamily,
            isEnabled,
            contextWindow,
            maxTokens,
            inputPricePerToken,
            outputPricePerToken,
            releaseDate,
            supportedFeatures
        })
    })

    if (!response.ok) {
        throw new Error(`Failed to create test model: ${response.status} ${response.statusText}`)
    }

    return await response.json()
}

export async function createTestPrompt(options: CreatePromptOptions) {
    const {
        name = 'Test Prompt',
        content = 'This is a test prompt',
        modelId,
        isActive = true,
        templateId = crypto.randomUUID(),
        lastMigrationCheck = new Date()
    } = options

    const response = await fetch(`${API_BASE_URL}/prompts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            content,
            modelId,
            isActive,
            templateId,
            lastMigrationCheck
        })
    })

    if (!response.ok) {
        throw new Error(`Failed to create test prompt: ${response.status} ${response.statusText}`)
    }

    return await response.json()
}

export async function createTestCompletion(options: CreateCompletionOptions) {
    const {
        modelId,
        promptId,
        prompt = 'This is a test completion request',
        temperature = 0.7,
        maxTokens = 100
    } = options

    const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            modelId,
            promptId,
            prompt,
            temperature,
            maxTokens
        })
    })

    if (!response.ok) {
        throw new Error(`Failed to create test completion: ${response.status} ${response.statusText}`)
    }

    return await response.json()
}

export async function deleteTestModel(modelId: string) {
    const response = await fetch(`${API_BASE_URL}/models/${modelId}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        console.warn(`Warning: Failed to delete test model ${modelId}: ${response.status} ${response.statusText}`)
    }
}

export async function deleteTestPrompt(promptId: string) {
    const response = await fetch(`${API_BASE_URL}/prompts/${promptId}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        console.warn(`Warning: Failed to delete test prompt ${promptId}: ${response.status} ${response.statusText}`)
    }
}

export async function deleteTestPromptRun(promptRunId: string) {
    const response = await fetch(`${API_BASE_URL}/prompt-runs/${promptRunId}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        console.warn(`Warning: Failed to delete test prompt run ${promptRunId}: ${response.status} ${response.statusText}`)
    }
} 