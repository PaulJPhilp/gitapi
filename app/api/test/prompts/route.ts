import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

interface Prompt {
    id: string
    templateId: string
    templateVersion: string
    parameters: Record<string, string>
    createdAt: Date
}

// In-memory storage for testing
const prompts = new Map<string, Prompt>()

export async function GET() {
    return NextResponse.json(Array.from(prompts.values()))
}

export async function POST(request: Request) {
    const body = await request.json()
    const { templateId, templateVersion, parameters } = body

    if (!templateId || !templateVersion || !parameters) {
        return NextResponse.json(
            { error: "Template ID, version, and parameters are required" },
            { status: 400 }
        )
    }

    const prompt: Prompt = {
        id: nanoid(),
        templateId,
        templateVersion,
        parameters,
        createdAt: new Date()
    }

    prompts.set(prompt.id, prompt)

    return NextResponse.json(prompt)
} 