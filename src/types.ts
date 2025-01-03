import { z } from "zod"

export interface Release {
    version: string
    content: string
    date: Date
}

export interface SearchResult {
    content: string
    version: string
    similarity: number
}

export interface GitHubRelease {
    id: number
    tag_name: string
    published_at: string
    body: string
    target_commitish?: string
    html_url?: string
    author?: {
        login: string
        avatar_url: string
    }
}

export interface ReleaseSimilarity {
    currentVersion: string
    previousVersion: string
    similarity: number
    changedFiles: string[]
}

export interface WordWeight {
    word: string
    weight: number
}

// Schema definitions
export const ReleaseSchema = z.object({
    version: z.string(),
    content: z.string(),
    date: z.date()
})

export const SearchResultSchema = z.object({
    content: z.string(),
    version: z.string(),
    similarity: z.number()
}) 