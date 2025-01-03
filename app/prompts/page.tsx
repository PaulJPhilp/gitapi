"use client"

import { AddPromptDialog } from "@/app/components/AddPromptDialog"
import { ErrorBoundary } from "@/app/components/ErrorBoundary"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { API_BASE_URL } from "@/src/config/api"
import type { Prompt } from "@/src/schemas/prompts"
import { Suspense, useCallback, useEffect, useState } from "react"

function PromptsList() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const fetchPrompts = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("[Prompts Page] Fetching prompts...")

            const response = await fetch(`${API_BASE_URL}/prompts`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to fetch prompts: ${response.status} ${response.statusText}`
                )
            }

            const data = await response.json()
            console.log("[Prompts Page] Successfully fetched prompts:", data)
            setPrompts(data.prompts)
        } catch (err) {
            console.error("[Prompts Page] Error fetching prompts:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to fetch prompts")
            throw err // Let error boundary handle it
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPrompts()
    }, [fetchPrompts])

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id)
            console.log(`[Prompts Page] Deleting prompt ${id}...`)
            const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to delete prompt: ${response.status} ${response.statusText}`
                )
            }

            console.log(`[Prompts Page] Successfully deleted prompt ${id}`)
            await fetchPrompts()
        } catch (err) {
            console.error("[Prompts Page] Error deleting prompt:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to delete prompt")
            throw err // Let error boundary handle it
        } finally {
            setIsDeleting(null)
        }
    }

    const handlePromptAdded = () => {
        console.log("[Prompts Page] Prompt added, refreshing list...")
        fetchPrompts()
    }

    if (isLoading) {
        return <LoadingSpinner text="Loading prompts..." />
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Prompts</h1>
                <AddPromptDialog onPromptAdded={handlePromptAdded} />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {prompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                            <TableCell className="font-medium">{prompt.name}</TableCell>
                            <TableCell>{prompt.modelId}</TableCell>
                            <TableCell>{prompt.isActive ? "Active" : "Inactive"}</TableCell>
                            <TableCell className="truncate max-w-md">{prompt.content}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(prompt.id)}
                                    disabled={isDeleting === prompt.id}
                                >
                                    {isDeleting === prompt.id ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default function PromptsPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner text="Loading prompts page..." fullScreen />}>
                <PromptsList />
            </Suspense>
        </ErrorBoundary>
    )
} 