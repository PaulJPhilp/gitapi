"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useDatabaseInit } from "../hooks/use-database-init"

interface DatabaseInitializerProps {
    children: ReactNode
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
    const { isInitialized, error, isLoading } = useDatabaseInit()

    if (error) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertTitle>Database Error</AlertTitle>
                    <AlertDescription>
                        Failed to initialize the database: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (isLoading || !isInitialized) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                        Initializing database...
                    </p>
                </div>
            </div>
        )
    }

    return <>{children}</>
} 