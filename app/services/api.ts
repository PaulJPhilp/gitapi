import { ApiError } from "./errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface FetchOptions extends RequestInit {
    params?: Record<string, string>
}

export async function fetchApi<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { params, ...init } = options

    const url = new URL(`${API_BASE_URL}${endpoint}`)
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.append(key, value)
        }
    }

    try {
        const response = await fetch(url.toString(), init)
        const data = await response.json()

        if ("error" in data) {
            throw new ApiError({ message: data.error })
        }

        return data as T
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError({
            message: "Network error",
            cause: error instanceof Error ? error : new Error(String(error))
        })
    }
} 