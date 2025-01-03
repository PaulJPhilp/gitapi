import { fetchApi } from "./api"

export interface Release {
    version: string
    name: string
    publishedAt: string
    url: string
}

export interface RepoParams {
    owner: string
    repo: string
}

export const ReleasesService = {
    validateRepo: async (params: RepoParams): Promise<boolean> => {
        const response = await fetchApi<{ exists: boolean }>(`/validate/${params.owner}/${params.repo}`)
        return response.exists
    },

    getMajorReleases: async (params: RepoParams): Promise<Release[]> =>
        fetchApi<Release[]>(`/releases/${params.owner}/${params.repo}`)
} 