"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { MainNav } from "../components/nav"

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Models page error:", error)
    }, [error])

    return (
        <div className="flex flex-col min-h-screen">
            <MainNav />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h2 className="text-2xl font-bold">Something went wrong!</h2>
                    <p className="text-gray-600">{error.message}</p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </main>
        </div>
    )
} 