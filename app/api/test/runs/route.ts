import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

interface Run {
    id: string
    promptId: string
    status: "pending" | "running" | "completed" | "failed"
    result?: string
    error?: string
    createdAt: Date
    completedAt?: Date
}

// In-memory storage for testing
const runs = new Map<string, Run>()

export async function GET() {
    return NextResponse.json(Array.from(runs.values()))
}

export async function POST(request: Request) {
    const body = await request.json()
    const { promptId } = body

    if (!promptId) {
        return NextResponse.json(
            { error: "Prompt ID is required" },
            { status: 400 }
        )
    }

    const run: Run = {
        id: nanoid(),
        promptId,
        status: "pending",
        createdAt: new Date()
    }

    runs.set(run.id, run)

    // Simulate async processing
    setTimeout(() => {
        const success = Math.random() > 0.3 // 70% success rate
        const updatedRun: Run = {
            ...run,
            status: success ? "completed" : "failed",
            result: success ? "Sample result: This is a simulated response." : undefined,
            error: success ? undefined : "Simulated error: Something went wrong",
            completedAt: new Date()
        }
        runs.set(run.id, updatedRun)
    }, 2000)

    return NextResponse.json(run)
} 