import { completionsService } from "@/src/layers"
import { modelsService } from "@/src/services/models"
import { promptRunsService } from "@/src/services/prompt-runs"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const runtime = 'nodejs'

const CompletionRequestSchema = z.object({
    modelId: z.string(),
    promptId: z.string(),
    prompt: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const result = CompletionRequestSchema.parse(body)

        // Get the model to get its provider ID
        const model = await modelsService.getById(result.modelId)
        if (!model) {
            throw new Error(`Model ${result.modelId} not found`)
        }

        // Get completion from the model
        try {
            const completion = await completionsService.complete(result)

            // Save the prompt run with the correct provider ID
            const promptRun = await promptRunsService.create({
                promptId: result.promptId,
                modelId: result.modelId,
                providerId: model.providerId,
                content: result.prompt,
                completion: completion.text,
                usage: {
                    promptTokens: completion.usage?.promptTokens ?? 0,
                    completionTokens: completion.usage?.completionTokens ?? 0,
                    totalTokens: completion.usage?.totalTokens ?? 0
                }
            })

            return NextResponse.json(promptRun)
        } catch (error) {
            console.error("[API] Service error:", {
                name: error instanceof Error ? error.name : "Unknown",
                message: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : "No stack trace",
                error
            })
            throw error
        }
    } catch (error) {
        console.error("[API] Error:", {
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
            error
        })

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
                    console.error("[API] Unhandled error:", error)
                    return NextResponse.json({
                        error: "Internal server error",
                        details: error instanceof Error ? error.message : "Unknown error"
                    }, { status: 500 })
            }
        }
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
