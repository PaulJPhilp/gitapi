import { NextResponse } from "next/server"
import { promptsService } from "../../../../src/services/prompts"
import { NotFoundError, ValidationError } from "../../../api/errors/execution"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const prompt = await promptsService.getById(params.id)
        return NextResponse.json(prompt)
    } catch (error) {
        console.error(`Failed to get prompt ${params.id}:`, error)
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const data = await request.json()
        const prompt = await promptsService.update(params.id, data)
        return NextResponse.json(prompt)
    } catch (error) {
        console.error(`Failed to update prompt ${params.id}:`, error)
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
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        await promptsService.delete(params.id)
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error(`Failed to delete prompt ${params.id}:`, error)
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
