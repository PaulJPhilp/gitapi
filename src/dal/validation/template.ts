import type { Template } from "@/domain"
import { ValidationError } from "../errors"

export function validateTemplate(template: Template): void {
    const errors: string[] = []

    if (!template.id) {
        errors.push("id is required")
    }

    if (!template.name) {
        errors.push("name is required")
    }

    if (!template.version) {
        errors.push("version is required")
    }

    if (!template.content) {
        errors.push("content is required")
    }

    if (template.parameters === undefined) {
        errors.push("parameters is required (can be empty object)")
    }

    if (template.isActive === undefined) {
        errors.push("isActive is required")
    }

    if (!template.createdAt) {
        errors.push("createdAt is required")
    }

    if (!template.updatedAt) {
        errors.push("updatedAt is required")
    }

    if (errors.length > 0) {
        throw new ValidationError("Template", errors)
    }
} 