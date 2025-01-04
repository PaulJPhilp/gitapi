import type { Model, Prompt, PromptRun, Provider } from "@/domain";

export interface Repository<T, U> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: U): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export interface ModelRepository extends Repository<Model, Omit<Model, "id" | "createdAt" | "updatedAt">> {
    findByProvider(providerId: string): Promise<Model[]>;
    findEnabled(): Promise<Model[]>;
}

export interface ProviderRepository extends Repository<Provider, Omit<Provider, "id" | "createdAt" | "updatedAt">> {
    findEnabled(): Promise<Provider[]>;
}

export interface PromptRepository extends Repository<Prompt, Omit<Prompt, "id" | "createdAt" | "updatedAt">> {
    findByModel(modelId: string): Promise<Prompt[]>;
    findActive(): Promise<Prompt[]>;
}

export interface PromptRunRepository extends Repository<PromptRun, Omit<PromptRun, "id" | "createdAt">> {
    findByPrompt(promptId: string): Promise<PromptRun[]>;
    findByModel(modelId: string): Promise<PromptRun[]>;
    findByProvider(providerId: string): Promise<PromptRun[]>;
}
