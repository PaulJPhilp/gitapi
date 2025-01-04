import { NextResponse } from "next/server"
import { modelsService } from "../../../../src/services/models"
import { NotFoundError, ValidationError } from "../../../api/errors/execution"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const model = await modelsService.getById(params.id)
        return NextResponse.json(model)
    } catch (error) {
        console.error(`Failed to get model ${params.id}:`, error)
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
        const model = await modelsService.update(params.id, data)
        return NextResponse.json(model)
    } catch (error) {
        console.error(`Failed to update model ${params.id}:`, error)
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
        await modelsService.delete(params.id)
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error(`Failed to delete model ${params.id}:`, error)
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
