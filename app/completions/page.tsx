'use client'

import { ErrorBoundary } from "@/app/components/ErrorBoundary"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Suspense } from "react"
import { CompletionsForm } from "../components/CompletionsForm"

function CompletionsContent() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Completions</h1>
            </div>

            <CompletionsForm promptId="" content="" />
        </div>
    )
}

export default function CompletionsPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner text="Loading completions page..." fullScreen />}>
                <CompletionsContent />
            </Suspense>
        </ErrorBoundary>
    )
} 