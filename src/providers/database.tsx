import { createContext, useContext, type ReactNode } from "react"
import { DefaultModelRepository } from "../db/repositories/model"
import { DefaultPromptRepository } from "../db/repositories/prompt"
import { DefaultPromptRunRepository } from "../db/repositories/prompt-run"
import { DefaultProviderRepository } from "../db/repositories/provider"
import type { ModelRepository, PromptRepository, PromptRunRepository, ProviderRepository } from "../db/repositories/types"

interface DatabaseContextValue {
    models: ModelRepository
    providers: ProviderRepository
    prompts: PromptRepository
    promptRuns: PromptRunRepository
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

interface DatabaseProviderProps {
    children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
    const value: DatabaseContextValue = {
        models: new DefaultModelRepository(),
        providers: new DefaultProviderRepository(),
        prompts: new DefaultPromptRepository(),
        promptRuns: new DefaultPromptRunRepository()
    }

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    )
}

export function useDatabase() {
    const context = useContext(DatabaseContext)
    if (!context) {
        throw new Error("useDatabase must be used within a DatabaseProvider")
    }
    return context
} 