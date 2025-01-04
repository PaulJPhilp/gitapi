import type { AuthPermission, AuthUser } from "@/domain"
import { ValidationError } from "../errors"

export function validateAuthUser(user: AuthUser): void {
    const errors: string[] = []

    if (!user.id) {
        errors.push("id is required")
    }

    if (!user.email) {
        errors.push("email is required")
    } else if (!isValidEmail(user.email)) {
        errors.push("email is invalid")
    }

    if (!user.name) {
        errors.push("name is required")
    }

    if (!Array.isArray(user.roles)) {
        errors.push("roles must be an array")
    }

    if (user.isActive === undefined) {
        errors.push("isActive is required")
    }

    if (!user.createdAt) {
        errors.push("createdAt is required")
    }

    if (!user.updatedAt) {
        errors.push("updatedAt is required")
    }

    if (errors.length > 0) {
        throw new ValidationError("AuthUser", errors)
    }
}

export function validateAuthPermission(permission: AuthPermission): void {
    const errors: string[] = []

    if (!permission.action) {
        errors.push("action is required")
    } else if (!isValidAction(permission.action)) {
        errors.push("invalid action")
    }

    if (!permission.resource) {
        errors.push("resource is required")
    } else if (!isValidResource(permission.resource)) {
        errors.push("invalid resource")
    }

    if (errors.length > 0) {
        throw new ValidationError("AuthPermission", errors)
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidAction(action: string): boolean {
    return ["create", "read", "update", "delete"].includes(action)
}

function isValidResource(resource: string): boolean {
    return [
        "provider",
        "model",
        "prompt",
        "template",
        "template_version",
        "api_key"
    ].includes(resource)
} 