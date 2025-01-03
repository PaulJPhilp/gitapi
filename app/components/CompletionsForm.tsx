'use client'

import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { API_BASE_URL } from "@/src/config/api"
import type { Model } from "@/src/schemas/models"
import { useEffect, useState } from "react"
import { PromptRunner, type PromptRunnerFormData } from "./PromptRunner"
import { ResultsView } from "./ResultsView"

interface CompletionResponse {
    text: string
    usage?: {
        promptTokens?: number
        completionTokens?: number
        totalTokens?: number
    }
    promptRun?: {
        id: string
        promptId: string
        modelId: string
        providerId: string
        content: string
        completion: string
        usage: {
            promptTokens: number
            completionTokens: number
            totalTokens: number
        }
        createdAt: string
    }
}

interface CompletionsFormProps {
    promptId: string
    content: string
}

interface RunPromptRequest {
    promptId: string;
    modelId: string;
    content: string;
    options?: {
        temperature?: number;
        maxTokens?: number;
    };
}

export function CompletionsForm({ promptId, content }: CompletionsFormProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [response, setResponse] = useState<CompletionResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [models, setModels] = useState<Model[]>([])

    useEffect(() => {
        const fetchModels = async () => {
            try {
                setIsLoading(true)
                setError(null)
                console.log("[CompletionsForm] Fetching models...")

                const response = await fetch(`${API_BASE_URL}/models`)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(
                        errorData.message ||
                        `Failed to fetch models: ${response.status} ${response.statusText}`
                    )
                }

                const data = await response.json()
                console.log("[CompletionsForm] Successfully fetched models:", data)
                setModels(data.models.filter((model: Model) => model.supportedFeatures.completion))
            } catch (err) {
                console.error("[CompletionsForm] Error fetching models:", {
                    error: err,
                    name: err instanceof Error ? err.name : "Unknown",
                    message: err instanceof Error ? err.message : "Unknown error",
                    stack: err instanceof Error ? err.stack : "No stack trace",
                })
                setError(err instanceof Error ? err.message : "Failed to fetch models")
                throw err // Let error boundary handle it
            } finally {
                setIsLoading(false)
            }
        }

        fetchModels()
    }, [])

    const onSubmit = async (values: PromptRunnerFormData) => {
        try {
            setIsSubmitting(true)
            setError(null)
            setResponse(null)
            console.log("[CompletionsForm] Submitting completion request:", values)

            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelId: values.modelId,
                    messages: [
                        {
                            role: "user",
                            content: values.prompt
                        }
                    ],
                    temperature: values.temperature,
                    maxTokens: values.maxTokens
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to get completion: ${response.status} ${response.statusText}`
                )
            }

            const data = await response.json()
            console.log("[CompletionsForm] Successfully received completion:", data)
            setResponse(data)
        } catch (err) {
            console.error("[CompletionsForm] Error getting completion:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to get completion")
            throw err // Let error boundary handle it
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <LoadingSpinner text="Loading models..." />
    }

    return (
        <div className="space-y-8">
            <PromptRunner
                models={models}
                content={content}
                onSubmit={onSubmit}
                loading={isSubmitting}
                error={error}
            />
            <ResultsView
                response={response}
                loading={isSubmitting}
                error={error}
                promptRuns={response?.promptRun ? [response.promptRun] : []}
            />
        </div>
    )
} 