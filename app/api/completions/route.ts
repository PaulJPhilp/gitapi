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
        console.log("[API] Environment variables:", {
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            envVars: Object.keys(process.env)
        })

        const body = await request.json()
        console.log("[API] Request body:", body)

        const result = CompletionRequestSchema.parse(body)
        console.log("[API] Parsed request:", result)

        // Get the model to get its provider ID
        const model = await modelsService.getById(result.modelId)
        if (!model) {
            throw new Error(`Model ${result.modelId} not found`)
        }

        // Get completion from the model
        try {
            const completion = await completionsService.complete(result)
            console.log("[API] Got completion:", completion)

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
            console.log("[API] Created prompt run:", promptRun)

            return NextResponse.json({
                ...completion,
                promptRun
            })
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
