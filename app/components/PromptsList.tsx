"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { Prompt } from "@/domain"
import { useEffect, useState } from "react"
import { CompletionsForm } from "./CompletionsForm"

// Helper functions for localStorage
const getStoredPrompts = (): Prompt[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('prompts')
    return stored ? JSON.parse(stored) : []
}

const setStoredPrompts = (prompts: Prompt[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('prompts', JSON.stringify(prompts))
}

export default function PromptsList() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [models, setModels] = useState<Record<string, string>>({})
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(true)
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
    const [runDialogOpen, setRunDialogOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load prompts from localStorage
                setPrompts(getStoredPrompts())

                // Fetch models
                const response = await fetch('/api/models')
                if (!response.ok) throw new Error('Failed to fetch models')
                const modelData = await response.json()
                const modelMap = modelData.reduce((acc: Record<string, string>, model: { id: string, name: string }) => {
                    acc[model.id] = model.name
                    return acc
                }, {})
                setModels(modelMap)
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const fetchPrompts = async () => {
        try {
            const stored = getStoredPrompts()
            setPrompts(stored)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const updated = prompts.filter(p => p.id !== id)
            setStoredPrompts(updated)
            setPrompts(updated)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        }
    }

    const handleSetActive = async (id: string) => {
        try {
            const updated = prompts.map(p => ({
                ...p,
                isActive: p.id === id ? !p.isActive : p.isActive,
                updatedAt: p.id === id ? new Date().toISOString() : p.updatedAt
            }))
            setStoredPrompts(updated)
            setPrompts(updated)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        }
    }

    const handleRun = (prompt: Prompt) => {
        setSelectedPrompt(prompt)
        setRunDialogOpen(true)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div className="text-destructive">{error}</div>
    }

    if (prompts.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No prompts found. Create one to get started.
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Template ID</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {prompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                            <TableCell>
                                {prompt.isActive && (
                                    <Badge variant="secondary">Active</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{prompt.name}</TableCell>
                            <TableCell className="max-w-md truncate">
                                {prompt.content}
                            </TableCell>
                            <TableCell>{models[prompt.modelId] || prompt.modelId}</TableCell>
                            <TableCell className="font-mono text-xs">{prompt.templateId}</TableCell>
                            <TableCell>
                                {new Date(prompt.updatedAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetActive(prompt.id)}
                                    disabled={prompt.isActive}
                                >
                                    Set Active
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleRun(prompt)}
                                >
                                    Run
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(prompt.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Run Prompt: {selectedPrompt?.name}</DialogTitle>
                        <DialogDescription>
                            Select a model and customize parameters to generate a completion for this prompt.
                        </DialogDescription>
                    </DialogHeader>
                    {runDialogOpen && selectedPrompt && (
                        <CompletionsForm
                            promptId={selectedPrompt.id}
                            content={selectedPrompt.content}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
} 