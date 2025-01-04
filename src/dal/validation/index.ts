import type { Model, Prompt, Provider } from "@/domain/models"
import { modelSchema, promptSchema, providerSchema } from "@/domain/schemas"
import { ValidationError } from "../errors"

export function validateModel(data: Partial<Model> | Model): void {
    const result = modelSchema.safeParse(data)
    if (!result.success) {
        throw new ValidationError(result.error.message)
    }
}

export function validateProvider(data: Partial<Provider> | Provider): void {
    const result = providerSchema.safeParse(data)
    if (!result.success) {
        throw new ValidationError(result.error.message)
    }
}

export function validatePrompt(data: Partial<Prompt> | Prompt): void {
    const result = promptSchema.safeParse(data)
    if (!result.success) {
        throw new ValidationError(result.error.message)
    }
} 