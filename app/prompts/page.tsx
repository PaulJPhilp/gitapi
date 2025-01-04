"use client"

import { AddPromptDialog } from "@/app/components/AddPromptDialog"
import { ErrorBoundary } from "@/app/components/ErrorBoundary"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import type { Prompt } from "@/domain"
import { API_BASE_URL } from "@/src/config/api"
import { Copy } from "lucide-react"
import { Suspense, useCallback, useEffect, useState } from "react"

function PromptsList() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isRunning, setIsRunning] = useState<string | null>(null)
    const [completionDialog, setCompletionDialog] = useState<{
        isOpen: boolean
        prompt?: Prompt
        completion?: string
    }>({ isOpen: false })
    const { toast } = useToast()

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
            setPrompts(Array.isArray(data) ? data : data.prompts || [])
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

    const handleRun = async (prompt: Prompt) => {
        try {
            setIsRunning(prompt.id)
            console.log(`[Prompts Page] Running prompt ${prompt.id}...`)

            // First, get the completion from the completions API
            const completionResponse = await fetch(`${API_BASE_URL}/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelId: prompt.modelId,
                    promptId: prompt.id,
                    prompt: prompt.content,
                    temperature: 0.7,
                    maxTokens: 1000
                }),
            })

            if (!completionResponse.ok) {
                const errorData = await completionResponse.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to get completion: ${completionResponse.status} ${completionResponse.statusText}`
                )
            }

            const completionData = await completionResponse.json()

            // The prompt run is now created by the completions API
            // so we don't need to create it separately

            console.log(`[Prompts Page] Successfully ran prompt ${prompt.id}:`, completionData)
            setCompletionDialog({
                isOpen: true,
                prompt,
                completion: completionData.text
            })
        } catch (err) {
            console.error("[Prompts Page] Error running prompt:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to run prompt")
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to run prompt"
            })
        } finally {
            setIsRunning(null)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            description: "Copied to clipboard",
            duration: 2000
        })
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
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleRun(prompt)}
                                    disabled={isRunning === prompt.id}
                                >
                                    {isRunning === prompt.id ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Running...
                                        </>
                                    ) : (
                                        "Run"
                                    )}
                                </Button>
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

            <Dialog
                open={completionDialog.isOpen}
                onOpenChange={(open) => setCompletionDialog(prev => ({ ...prev, isOpen: open }))}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Completion Result</DialogTitle>
                        <DialogDescription>
                            {completionDialog.prompt?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Prompt</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(completionDialog.prompt?.content || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm whitespace-pre-wrap">
                                    {completionDialog.prompt?.content}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Completion</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(completionDialog.completion || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm whitespace-pre-wrap">
                                    {completionDialog.completion}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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