export interface ApiErrorOptions {
    message: string
    cause?: Error
}

export class ApiError extends Error {
    readonly _tag = "ApiError"
    constructor(readonly options: ApiErrorOptions) {
        super(options.message)
        this.name = "ApiError"
    }
}

export class ValidationError extends Error {
    readonly _tag = "ValidationError"
    constructor(message: string) {
        super(message)
        this.name = "ValidationError"
    }
}

export class AuthError extends Error {
    readonly _tag = "AuthError"
    constructor(message: string) {
        super(message)
        this.name = "AuthError"
    }
}

export class NotFoundError extends Error {
    readonly _tag = "NotFoundError"
    constructor(message: string) {
        super(message)
        this.name = "NotFoundError"
    }
} 