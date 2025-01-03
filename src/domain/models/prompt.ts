export interface Prompt {
    id: string
    name: string
    content: string
    isActive: boolean
    modelId: string
    createdAt: string
    updatedAt: string
}

export interface NewPrompt extends Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> { } 