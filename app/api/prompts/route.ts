import { NextResponse } from "next/server"
import { promptsService } from "../../../src/services/prompts"
import { NotFoundError, ValidationError } from "../../api/errors/execution"

export async function GET() {
    try {
        const prompts = await promptsService.list()
        return NextResponse.json(prompts)
    } catch (error) {
        console.error("Failed to list prompts:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const prompt = await promptsService.create(data)
        return NextResponse.json(prompt, { status: 201 })
    } catch (error) {
        console.error("Failed to create prompt:", error)
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
        console.log("[API] Updating prompt...")
        const { id, ...data } = await request.json()
        const prompt = await promptsService.update(id, data)
        return NextResponse.json(prompt)
    } catch (error) {
        console.error("[API] Error updating prompt:", {
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
            { error: "Failed to update prompt" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        console.log("[API] Deleting prompt...")
        const { id } = await request.json()
        await promptsService.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Error deleting prompt:", {
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
            { error: "Failed to delete prompt" },
            { status: 500 }
        )
    }
}
