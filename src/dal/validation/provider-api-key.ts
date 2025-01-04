import type { ProviderApiKey } from "@/domain"
import { ValidationError } from "../errors"

export function validateProviderApiKey(apiKey: ProviderApiKey): void {
    const errors: string[] = []

    if (!apiKey.id) {
        errors.push("id is required")
    }

    if (!apiKey.providerId) {
        errors.push("providerId is required")
    }

    if (!apiKey.apiKey) {
        errors.push("apiKey is required")
    }

    if (!apiKey.name) {
        errors.push("name is required")
    }

    if (apiKey.isEnabled === undefined) {
        errors.push("isEnabled is required")
    }

    if (apiKey.expiresAt && !(apiKey.expiresAt instanceof Date)) {
        errors.push("expiresAt must be a Date")
    }

    if (apiKey.lastUsedAt && !(apiKey.lastUsedAt instanceof Date)) {
        errors.push("lastUsedAt must be a Date")
    }

    if (!apiKey.createdAt) {
        errors.push("createdAt is required")
    }

    if (!apiKey.updatedAt) {
        errors.push("updatedAt is required")
    }

    if (errors.length > 0) {
        throw new ValidationError("ProviderApiKey", errors)
    }
} 