import { NextResponse } from "next/server"
import { z } from "zod"
import { providersService } from "../../../../../src/services/providers"
import { NotFoundError } from "../../../../api/errors/execution"

const ApiKeySchema = z.object({
    apiKey: z.string().min(1)
})

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const apiKey = await providersService.getApiKey(params.id)
        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not found" },
                { status: 404 }
            )
        }
        return NextResponse.json({ apiKey })
    } catch (error) {
        console.error("Failed to get API key:", error)
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json()
        const { apiKey } = ApiKeySchema.parse(data)

        const provider = await providersService.getById(params.id)
        if (!provider) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 }
            )
        }

        await providersService.setApiKey(params.id, apiKey)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to set API key:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors },
                { status: 400 }
            )
        }
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 