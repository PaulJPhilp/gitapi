// Base error interface
export interface ErrorOptions {
    message: string
    cause?: unknown
}

// GitHub Auth Error
export class GitHubAuthError extends Error {
    readonly _tag = "GitHubAuthError"
    constructor(readonly options: ErrorOptions) {
        super(options.message)
        this.cause = options.cause
    }
}

// Release Error
export class ReleaseError extends Error {
    readonly _tag = "ReleaseError"
    constructor(readonly options: ErrorOptions) {
        super(options.message)
        this.cause = options.cause
    }
}

// Rate Limit Error
export interface RateLimitErrorOptions extends ErrorOptions {
    resetTime: Date
}

export class RateLimitError extends Error {
    readonly _tag = "RateLimitError"
    constructor(readonly options: RateLimitErrorOptions) {
        super(options.message)
        this.cause = options.cause
    }
}

// GitHub Error (base type for GitHub-related errors)
export type GitHubError = GitHubAuthError | ReleaseError

// Base API Error
export class APIError extends Error {
    readonly _tag = "APIError"
    constructor(readonly message: string, readonly cause?: unknown) {
        super(message)
        this.cause = cause
    }
}

// Authentication Errors
export class AuthError extends Error {
    readonly _tag = "AuthError"
    constructor(readonly message: string) {
        super(message)
    }
}

// Resource Errors
export class NotFoundError extends Error {
    readonly _tag = "NotFoundError"
    constructor(readonly resource: string, readonly identifier: string) {
        super(`${resource} with identifier ${identifier} not found`)
    }
}

export class ValidationError extends Error {
    readonly _tag = "ValidationError"
    constructor(readonly message: string, readonly field?: string) {
        super(message)
    }
}

// Network Errors
export class NetworkError extends Error {
    readonly _tag = "NetworkError"
    constructor(readonly message: string, readonly statusCode?: number, readonly cause?: unknown) {
        super(message)
        this.cause = cause
    }
}

// Service Errors
export class ServiceError extends Error {
    readonly _tag = "ServiceError"
    constructor(readonly service: string, readonly message: string, readonly cause?: unknown) {
        super(message)
        this.cause = cause
    }
}

// Provider Errors
export interface ProviderErrorOptions extends ErrorOptions {
    providerId: string
}

export class ProviderAuthError extends Error {
    readonly _tag = "ProviderAuthError"
    constructor(readonly options: { message: string; providerId: string; cause?: unknown }) {
        super(options.message)
        this.cause = options.cause
    }
}

export class ProviderNotFoundError extends Error {
    readonly _tag = "ProviderNotFoundError"
    constructor(readonly options: { message: string; providerId: string; cause?: unknown }) {
        super(options.message)
        this.cause = options.cause
    }
}

export class ProviderNotEnabledError extends Error {
    readonly _tag = "ProviderNotEnabledError"
    constructor(readonly options: ProviderErrorOptions) {
        super(options.message)
        this.cause = options.cause
    }
}

export class ModelNotFoundError extends Error {
    readonly _tag = "ModelNotFoundError"
    constructor(readonly modelId: string) {
        super(`Model with ID ${modelId} not found`)
    }
} 