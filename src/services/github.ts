import { Octokit } from "@octokit/rest";
import type { GitHubRelease } from "../types";

export interface GitHubService {
    readonly _tag: "GitHubService"
    getReleaseByTag(params: { owner: string; repo: string; tag: string }): Promise<GitHubRelease>
    compareCommits(params: { owner: string; repo: string; base: string; head: string }): Promise<string[]>
}

export class OctokitGitHubService implements GitHubService {
    readonly _tag = "GitHubService" as const
    private octokit: Octokit

    constructor() {
        this.octokit = new Octokit()
    }

    async getReleaseByTag(params: { owner: string; repo: string; tag: string }): Promise<GitHubRelease> {
        try {
            const { data } = await this.octokit.rest.repos.getReleaseByTag(params)
            return data as GitHubRelease
        } catch (error) {
            throw new Error(`Failed to fetch release: ${error}`)
        }
    }

    async compareCommits(params: { owner: string; repo: string; base: string; head: string }): Promise<string[]> {
        try {
            const { data } = await this.octokit.rest.repos.compareCommits(params)
            return data.files?.map(file => file.filename) ?? []
        } catch (error) {
            throw new Error(`Failed to compare commits: ${error}`)
        }
    }
} 