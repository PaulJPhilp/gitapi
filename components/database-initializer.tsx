"use client";

import { useDatabaseInit } from "@/app/hooks/use-database-init";
import type { ReactNode } from "react";

interface DatabaseInitializerProps {
    children: ReactNode;
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
    const { isInitialized, error } = useDatabaseInit();

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="rounded-lg bg-destructive p-6 text-destructive-foreground shadow-lg">
                    <h2 className="text-lg font-semibold">Database Error</h2>
                    <p className="mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="rounded-lg bg-card p-6 text-card-foreground shadow-lg">
                    <h2 className="text-lg font-semibold">Initializing Database...</h2>
                    <p className="mt-2">Please wait while we set up the database.</p>
                </div>
            </div>
        );
    }

    return children;
}
