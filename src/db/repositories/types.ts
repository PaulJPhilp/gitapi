import type { Model, Prompt, PromptRun, Provider } from "@/src/domain/models"

export interface ModelRepository {
    findAll(): Promise<Model[]>
    findById(id: string): Promise<Model | null>
    findEnabled(): Promise<Model[]>
    findByProvider(providerId: string): Promise<Model[]>
    create(data: Omit<Model, "id" | "createdAt" | "updatedAt">): Promise<Model>
    update(id: string, data: Partial<Model>): Promise<Model>
    delete(id: string): Promise<void>
}

export interface PromptRepository {
    findAll(): Promise<Prompt[]>
    findById(id: string): Promise<Prompt | null>
    findActive(): Promise<Prompt[]>
    findByModel(modelId: string): Promise<Prompt[]>
    create(data: Omit<Prompt, "id" | "createdAt" | "updatedAt">): Promise<Prompt>
    update(id: string, data: Partial<Prompt>): Promise<Prompt>
    delete(id: string): Promise<void>
}

export interface PromptRunRepository {
    findAll(): Promise<PromptRun[]>
    findById(id: string): Promise<PromptRun | null>
    findByPrompt(promptId: string): Promise<PromptRun[]>
    findByModel(modelId: string): Promise<PromptRun[]>
    findByProvider(providerId: string): Promise<PromptRun[]>
    create(data: Omit<PromptRun, "id" | "createdAt">): Promise<PromptRun>
    delete(id: string): Promise<void>
}

export interface ProviderRepository {
    findAll(): Promise<Provider[]>
    findById(id: string): Promise<Provider | null>
    findEnabled(): Promise<Provider[]>
    create(data: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider>
    update(id: string, data: Partial<Provider>): Promise<Provider>
    delete(id: string): Promise<void>
}
