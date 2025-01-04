import { NextResponse } from "next/server"
import { z } from "zod"
import { modelsService } from "../../../src/services/models"
import { NotFoundError, ValidationError } from "../../api/errors/execution"

const CreateModelSchema = z.object({
    name: z.string(),
    description: z.string().nullable(),
    providerId: z.string(),
    isEnabled: z.boolean().default(true),
    modelFamily: z.string().nullable(),
    contextWindow: z.number().int().positive(),
    maxTokens: z.number().int().positive().nullable(),
    inputPricePerToken: z.string(),
    outputPricePerToken: z.string(),
    type: z.enum(['proprietary', 'open source']),
    reasoning: z.boolean().default(false),
    releaseDate: z.string().nullable(),
    updatedAt: z.string().default(() => new Date().toISOString()),
    supportedFeatures: z.object({
        chat: z.boolean(),
        completion: z.boolean(),
        embedding: z.boolean(),
        imageGeneration: z.boolean(),
        imageAnalysis: z.boolean(),
        functionCalling: z.boolean(),
        streaming: z.boolean()
    })
})

export async function GET() {
    try {
        const models = await modelsService.list()
        return NextResponse.json({ models })
    } catch (error) {
        console.error("Failed to list models:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const validatedData = CreateModelSchema.parse(data)
        const model = await modelsService.create(validatedData)
        return NextResponse.json(model, { status: 201 })
    } catch (error) {
        console.error("Failed to create model:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors },
                { status: 400 }
            )
        }
        if (error instanceof ValidationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        console.log("[API] Updating model...")
        const { id, ...data } = await request.json()
        const model = await modelsService.update(id, data)
        return NextResponse.json(model)
    } catch (error) {
        console.error("[API] Error updating model:", {
            error,
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace"
        })

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: "Failed to update model" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        console.log("[API] Deleting model...")
        const { id } = await request.json()
        await modelsService.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Error deleting model:", {
            error,
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace"
        })

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: "Failed to delete model" },
            { status: 500 }
        )
    }
}
