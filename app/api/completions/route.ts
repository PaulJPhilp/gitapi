import { completionsService } from "@/src/layers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const CompletionRequestSchema = z.object({
    modelId: z.string(),
    prompt: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = CompletionRequestSchema.parse(body)

        const completion = await completionsService.complete(result)
        return NextResponse.json(completion)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        if (error instanceof Error) {
            switch (error.constructor.name) {
                case "ProviderNotFoundError":
                    return NextResponse.json({ error: error.message }, { status: 404 })
                case "ProviderAuthError":
                    return NextResponse.json({ error: error.message }, { status: 401 })
                case "ProviderNotEnabledError":
                    return NextResponse.json({ error: error.message }, { status: 403 })
                case "ValidationError":
                    return NextResponse.json({ error: error.message }, { status: 400 })
                default:
                    console.error("Unhandled error:", error)
                    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
            }
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
