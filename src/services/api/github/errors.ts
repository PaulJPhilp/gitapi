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