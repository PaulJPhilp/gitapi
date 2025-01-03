import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { PromptRun } from "@/src/schemas/prompt-run"
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

            {promptRuns.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Recent Runs</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
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
            )}
        </div>
    )
} 