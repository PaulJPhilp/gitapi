import { promptRunsService } from "@/src/services/prompt-runs"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const promptRuns = await promptRunsService.list()
        return NextResponse.json(promptRuns)
    } catch (error) {
        console.error("Failed to fetch prompt runs:", error)
        return NextResponse.json(
            { error: "Failed to fetch prompt runs" },
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
        return NextResponse.json(
            { error: "Failed to create prompt run" },
            { status: 500 }
        )
    }
} 