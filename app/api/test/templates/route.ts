import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

interface Template {
    id: string
    name: string
    content: string
    version: string
    createdAt: Date
    updatedAt: Date
    isDeprecated: boolean
    createdBy: string
}

// In-memory storage for testing
const templates = new Map<string, Template>()

export async function GET() {
    return NextResponse.json(Array.from(templates.values()))
}

export async function POST(request: Request) {
    const body = await request.json()
    const { name, content } = body

    if (!name || !content) {
        return NextResponse.json(
            { error: "Name and content are required" },
            { status: 400 }
        )
    }

    const template: Template = {
        id: nanoid(),
        name,
        content,
        version: "1.0.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeprecated: false,
        createdBy: "test-user" // Hardcoded for testing
    }

    templates.set(template.id, template)

    return NextResponse.json(template)
} 