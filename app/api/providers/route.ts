import { NextResponse } from "next/server"
import { z } from "zod"
import { providersService } from "../../../src/services/providers"
import { NotFoundError, ValidationError } from "../../api/errors/execution"

const CreateProviderSchema = z.object({
    name: z.string(),
    description: z.string(),
    website: z.string(),
    apiKeyRequired: z.boolean(),
    baseUrl: z.string().nullable(),
    isEnabled: z.boolean().default(true),
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
        const providers = await providersService.list()
        return NextResponse.json(providers)
    } catch (error) {
        console.error("Failed to list providers:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const validatedData = CreateProviderSchema.parse(data)
        const provider = await providersService.create(validatedData)
        return NextResponse.json(provider, { status: 201 })
    } catch (error) {
        console.error("Failed to create provider:", error)
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
        console.log("[API] Updating provider...")
        const { id, ...data } = await request.json()
        const provider = await providersService.update(id, data)
        return NextResponse.json(provider)
    } catch (error) {
        console.error("[API] Error updating provider:", {
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
            { error: "Failed to update provider" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        console.log("[API] Deleting provider...")
        const { id } = await request.json()
        await providersService.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Error deleting provider:", {
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
            { error: "Failed to delete provider" },
            { status: 500 }
        )
    }
}
