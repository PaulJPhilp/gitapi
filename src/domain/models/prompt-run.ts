export interface Usage {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}

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

export interface NewPromptRun extends Omit<PromptRun, 'id' | 'createdAt'> { } 