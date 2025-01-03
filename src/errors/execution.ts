import { NextResponse } from "next/server"

export class PromptExecutionError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly details?: unknown
    ) {
        super(message)
        this.name = "PromptExecutionError"
    }
}

export class ModelNotSupportedError extends PromptExecutionError {
    constructor(modelId: string) {
        super(
            `Model ${modelId} does not support this operation`,
            "MODEL_NOT_SUPPORTED"
        )
    }
}

// ... other specific error types

export function handleExecutionError(error: unknown) {
    if (error instanceof PromptExecutionError) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
                details: error.details
            },
            { status: 400 }
        )
    }

    // ... handle other error types

    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    )
} 