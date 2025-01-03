import { NextResponse } from "next/server"
import { ValidationError } from "../../../src/errors"
import { promptRunsService } from "../../../src/services/prompt-runs"

export async function GET() {
    try {
        const promptRuns = await promptRunsService.list()
        return NextResponse.json(promptRuns)
    } catch (error) {
        console.error("Failed to list prompt runs:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const promptRun = await promptRunsService.create(data)
        return NextResponse.json(promptRun, { status: 201 })
    } catch (error) {
        console.error("Failed to create prompt run:", error)
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