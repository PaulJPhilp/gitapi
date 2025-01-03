"use client"

import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { API_BASE_URL } from "@/src/config/api"
import type { PromptRun } from "@/src/schemas/prompt-run"
import { useCallback, useEffect, useState } from "react"

export default function PromptRunsPage() {
    const [promptRuns, setPromptRuns] = useState<PromptRun[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchPromptRuns = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("[Prompt Runs Page] Fetching prompt runs...")

            const response = await fetch(`${API_BASE_URL}/prompt-runs`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to fetch prompt runs: ${response.status} ${response.statusText}`
                )
            }

            const data = await response.json()
            console.log("[Prompt Runs Page] Successfully fetched prompt runs:", data)
            setPromptRuns(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("[Prompt Runs Page] Error fetching prompt runs:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to fetch prompt runs")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPromptRuns()
    }, [fetchPromptRuns])

    if (isLoading) {
        return <LoadingSpinner text="Loading prompt runs..." />
    }

    if (error) {
        return <div className="text-destructive">{error}</div>
    }

    if (promptRuns.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No prompt runs found.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Prompt Runs</h1>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Prompt ID</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {promptRuns.map((run) => (
                        <TableRow key={run.id}>
                            <TableCell className="font-medium">{run.promptId}</TableCell>
                            <TableCell>{run.modelId}</TableCell>
                            <TableCell>{run.providerId}</TableCell>
                            <TableCell className="max-w-md group relative">
                                <div className="truncate">{run.content}</div>
                                <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md whitespace-pre-wrap max-w-2xl">
                                    {run.content}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-md group relative">
                                <div className="truncate">{run.completion}</div>
                                <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md whitespace-pre-wrap max-w-2xl">
                                    {run.completion}
                                </div>
                            </TableCell>
                            <TableCell>{run.usage.totalTokens} tokens</TableCell>
                            <TableCell>{new Date(run.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
} 