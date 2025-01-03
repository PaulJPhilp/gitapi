import { NextResponse } from "next/server"
import { NotFoundError, ValidationError } from "../../../../src/errors"
import { promptRunsService } from "../../../../src/services/prompt-runs"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const promptRun = await promptRunsService.getById(params.id)
        return NextResponse.json(promptRun)
    } catch (error) {
        console.error(`Failed to get prompt run ${params.id}:`, error)
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
        const promptRun = await promptRunsService.update(params.id, data)
        return NextResponse.json(promptRun)
    } catch (error) {
        console.error(`Failed to update prompt run ${params.id}:`, error)
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
        await promptRunsService.delete(params.id)
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error(`Failed to delete prompt run ${params.id}:`, error)
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