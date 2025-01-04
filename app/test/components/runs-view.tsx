'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

interface Prompt {
    id: string
    templateId: string
    templateVersion: string
    parameters: Record<string, string>
}

interface Run {
    id: string
    promptId: string
    status: "pending" | "running" | "completed" | "failed"
    result?: string
    error?: string
    createdAt: Date
    completedAt?: Date
}

export function RunsView() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [selectedPrompt, setSelectedPrompt] = useState<string>("")
    const [runs, setRuns] = useState<Run[]>([])
    const { toast } = useToast()

    useEffect(() => {
        // Load prompts
        fetch("/api/test/prompts")
            .then((res) => res.json())
            .then(setPrompts)
            .catch(console.error)

        // Load runs
        fetch("/api/test/runs")
            .then((res) => res.json())
            .then(setRuns)
            .catch(console.error)
    }, [])

    const handleRun = async () => {
        if (!selectedPrompt) return

        try {
            const response = await fetch("/api/test/runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promptId: selectedPrompt })
            })

            if (!response.ok) throw new Error("Failed to create run")

            const newRun = await response.json()
            setRuns([...runs, newRun])
            setSelectedPrompt("")

            toast({
                title: "Success",
                description: "Run created successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create run",
                variant: "destructive"
            })
        }
    }

    const getStatusColor = (status: Run["status"]) => {
        switch (status) {
            case "completed": return "text-green-600"
            case "failed": return "text-red-600"
            case "running": return "text-blue-600"
            default: return "text-gray-600"
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex gap-4">
                <Select
                    value={selectedPrompt}
                    onValueChange={setSelectedPrompt}
                >
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a prompt to run" />
                    </SelectTrigger>
                    <SelectContent>
                        {prompts.map((prompt) => (
                            <SelectItem key={prompt.id} value={prompt.id}>
                                Template {prompt.templateId} (v{prompt.templateVersion})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={handleRun}
                    disabled={!selectedPrompt}
                >
                    Run Prompt
                </Button>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Runs</h2>
                {runs.map((run) => {
                    const prompt = prompts.find(p => p.id === run.promptId)
                    return (
                        <Card key={run.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">
                                        Run {run.id}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Prompt: {prompt?.id || "Unknown"}
                                    </p>
                                </div>
                                <span className={`text-sm font-medium ${getStatusColor(run.status)}`}>
                                    {run.status}
                                </span>
                            </div>

                            {run.result && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium">Result:</h4>
                                    <pre className="mt-1 p-2 bg-gray-100 rounded text-sm whitespace-pre-wrap">
                                        {run.result}
                                    </pre>
                                </div>
                            )}

                            {run.error && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-red-600">Error:</h4>
                                    <pre className="mt-1 p-2 bg-red-50 rounded text-sm text-red-600 whitespace-pre-wrap">
                                        {run.error}
                                    </pre>
                                </div>
                            )}

                            <div className="mt-2 text-xs text-gray-500">
                                Created: {new Date(run.createdAt).toLocaleString()}
                                {run.completedAt && (
                                    <> • Completed: {new Date(run.completedAt).toLocaleString()}</>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
} 