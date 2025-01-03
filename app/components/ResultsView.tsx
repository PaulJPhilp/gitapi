import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { PromptRun } from "@/src/schemas/prompts"
import { AlertCircle } from "lucide-react"

interface CompletionResponse {
    text: string
    usage?: {
        promptTokens?: number
        completionTokens?: number
        totalTokens?: number
    }
}

export interface ResultsViewProps {
    response: CompletionResponse | null
    promptRuns: PromptRun[]
    loading: boolean
    error: string | null
}

export function ResultsView({ response, promptRuns, loading, error }: ResultsViewProps) {
    return (
        <div className="max-w-[80%] mx-auto space-y-8">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="flex justify-center">
                    <LoadingSpinner text="Generating completion..." />
                </div>
            )}

            {response && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Response</h2>
                    <div className="rounded-lg border p-4">
                        <pre className="whitespace-pre-wrap">{response.text}</pre>
                    </div>
                    {response.usage && (
                        <div className="text-sm text-muted-foreground">
                            <p>Tokens used: {response.usage.totalTokens}</p>
                            <p>Prompt tokens: {response.usage.promptTokens}</p>
                            <p>Completion tokens: {response.usage.completionTokens}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 