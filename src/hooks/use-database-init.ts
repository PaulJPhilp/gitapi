import { DatabaseManager } from "@/src/lib/db/DatabaseManager"
import { useEffect, useState } from "react"

interface DatabaseInitState {
    isInitialized: boolean
    error: Error | null
    isLoading: boolean
}

export function useDatabaseInit() {
    const [state, setState] = useState<DatabaseInitState>({
        isInitialized: false,
        error: null,
        isLoading: true
    })

    useEffect(() => {
        const dbManager = new DatabaseManager()

        async function init() {
            try {
                const result = await dbManager.initialize()
                setState({
                    isInitialized: result.success,
                    error: null,
                    isLoading: false
                })
            } catch (error) {
                setState({
                    isInitialized: false,
                    error: error instanceof Error ? error : new Error("Failed to initialize database"),
                    isLoading: false
                })
            }
        }

        void init()
    }, [])

    return state
} 