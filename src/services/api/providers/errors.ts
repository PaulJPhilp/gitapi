// Base error interface
export interface ErrorOptions {
    message: string
    cause?: unknown
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

// Network-related errors
export class NetworkError extends Error {
    readonly _tag = "NetworkError"
    constructor(readonly message: string, readonly statusCode?: number, readonly cause?: unknown) {
        super(message)
        this.cause = cause
    }
} 