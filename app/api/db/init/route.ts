import { initializeDatabase } from "@/src/db/db"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        console.log("[API] Starting database initialization...")

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Database initialization timed out")), 10000)
        })

        const initPromise = initializeDatabase()

        await Promise.race([initPromise, timeoutPromise])

        console.log("[API] Database initialization completed successfully")
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Database initialization failed:", {
            error,
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
        })

        return NextResponse.json(
            {
                error: "Failed to initialize database",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
} 