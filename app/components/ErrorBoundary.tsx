'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', {
            error,
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            componentStack: errorInfo.componentStack
        })
        this.setState({ errorInfo })
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription className="mt-2">
                            <div className="space-y-2">
                                <p className="font-medium">
                                    {this.state.error?.message || 'An unexpected error occurred'}
                                </p>
                                {process.env.NODE_ENV === 'development' && (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            Error type: {this.state.error?.name}
                                        </p>
                                        {this.state.error?.stack && (
                                            <pre className="mt-2 max-h-40 overflow-auto rounded bg-secondary/50 p-2 text-xs">
                                                {this.state.error.stack}
                                            </pre>
                                        )}
                                        {this.state.errorInfo?.componentStack && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium">Component Stack:</p>
                                                <pre className="mt-2 max-h-40 overflow-auto rounded bg-secondary/50 p-2 text-xs">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button onClick={this.handleReset}>Try again</Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )
        }

        return this.props.children
    }
} 