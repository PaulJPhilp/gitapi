"use client"

import { createContext, useContext, type ReactNode } from "react"

interface DatabaseContextValue {
    isInitialized: boolean
}

const DatabaseContext = createContext<DatabaseContextValue>({
    isInitialized: false,
})

interface DatabaseProviderProps {
    children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
    return (
        <DatabaseContext.Provider value={{ isInitialized: false }}>
            {children}
        </DatabaseContext.Provider>
    )
}

export function useDatabase() {
    return useContext(DatabaseContext)
} 