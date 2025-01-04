import { NextResponse } from "next/server"
import { providersService } from "../../../../src/services/providers"
import { NotFoundError, ValidationError } from "../../../api/errors/execution"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const provider = await providersService.getById(params.id)
        return NextResponse.json(provider)
    } catch (error) {
        console.error(`Failed to get provider ${params.id}:`, error)
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
        const provider = await providersService.update(params.id, data)
        return NextResponse.json(provider)
    } catch (error) {
        console.error(`Failed to update provider ${params.id}:`, error)
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
        await providersService.delete(params.id)
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error(`Failed to delete provider ${params.id}:`, error)
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
