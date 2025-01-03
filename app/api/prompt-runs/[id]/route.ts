import { promptRunsService } from "@/src/services/prompt-runs"
import { NextResponse } from "next/server"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const promptRun = await promptRunsService.getById(params.id)
        if (!promptRun) {
            return NextResponse.json(
                { error: "Prompt run not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(promptRun)
    } catch (error) {
        console.error(`Failed to fetch prompt run ${params.id}:`, error)
        return NextResponse.json(
            { error: "Failed to fetch prompt run" },
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
        return NextResponse.json(
            { error: "Failed to update prompt run" },
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
        return NextResponse.json(
            { error: "Failed to delete prompt run" },
            { status: 500 }
        )
    }
} 