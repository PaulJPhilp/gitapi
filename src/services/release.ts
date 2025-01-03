import { Octokit } from "@octokit/rest";
import { GitHubAuthError, RateLimitError, ReleaseError } from "../errors";
import type { Release } from "../types";

export interface ReleaseService {
    readonly _tag: "ReleaseService";
    getReleaseByTag(params: { owner: string; repo: string; tag: string }): Promise<Release>;
    compareReleases(params: { owner: string; repo: string; base: string; head: string }): Promise<string[]>;
    validateRepo(params: { owner: string; repo: string }): Promise<boolean>;
}

export interface ReleaseConfig {
    githubToken?: string;
}

// Implementation
export class GithubReleaseService implements ReleaseService {
    readonly _tag = "ReleaseService" as const;
    private octokit: Octokit;

    constructor(config: ReleaseConfig) {
        this.octokit = new Octokit({
            auth: config.githubToken,
        });
    }

    async getReleaseByTag(params: {
        owner: string;
        repo: string;
        tag: string;
    }): Promise<Release> {
        try {
            const response = await this.octokit.rest.repos.getReleaseByTag(params);
            return {
                version: response.data.tag_name,
                content: response.data.body ?? "",
                date: new Date(response.data.published_at ?? response.data.created_at)
            };
        } catch (error) {
            if (error && typeof error === "object" && "status" in error) {
                const githubError = error as {
                    status: number;
                    response?: { headers: { "x-ratelimit-reset": string } };
                };

                if (githubError.status === 401) {
                    throw new GitHubAuthError({ message: "Invalid GitHub token" });
                }
                if (githubError.status === 403) {
                    throw new RateLimitError({
                        message: "Rate limit exceeded",
                        resetTime: new Date(
                            Number.parseInt(
                                githubError.response?.headers["x-ratelimit-reset"] ?? "0",
                                10,
                            ) * 1000,
                        ),
                    });
                }
            }
            throw new ReleaseError({
                message: "Failed to fetch release",
                cause: error,
            });
        }
    }

    async compareReleases(params: {
        owner: string;
        repo: string;
        base: string;
        head: string;
    }): Promise<string[]> {
        try {
            const response = await this.octokit.rest.repos.compareCommits({
                owner: params.owner,
                repo: params.repo,
                base: params.base,
                head: params.head,
            });
            return response.data.files?.map((file) => file.filename) ?? [];
        } catch (error) {
            if (error && typeof error === "object" && "status" in error) {
                const githubError = error as {
                    status: number;
                    response?: { headers: { "x-ratelimit-reset": string } };
                };

                if (githubError.status === 401) {
                    throw new GitHubAuthError({ message: "Invalid GitHub token" });
                }
                if (githubError.status === 403) {
                    throw new RateLimitError({
                        message: "Rate limit exceeded",
                        resetTime: new Date(
                            Number.parseInt(
                                githubError.response?.headers["x-ratelimit-reset"] ?? "0",
                                10,
                            ) * 1000,
                        ),
                    });
                }
            }
            throw new ReleaseError({
                message: "Failed to compare releases",
                cause: error,
            });
        }
    }

    async validateRepo(params: {
        owner: string;
        repo: string;
    }): Promise<boolean> {
        try {
            await this.octokit.rest.repos.get({
                owner: params.owner,
                repo: params.repo,
            });
            return true;
        } catch (error) {
            if (error && typeof error === "object" && "status" in error) {
                const githubError = error as {
                    status: number;
                    response?: { headers: { "x-ratelimit-reset": string } };
                };

                if (githubError.status === 401) {
                    throw new GitHubAuthError({ message: "Invalid GitHub token" });
                }
                if (githubError.status === 403) {
                    throw new RateLimitError({
                        message: "Rate limit exceeded",
                        resetTime: new Date(
                            Number.parseInt(
                                githubError.response?.headers["x-ratelimit-reset"] ?? "0",
                                10,
                            ) * 1000,
                        ),
                    });
                }
            }
            return false;
        }
    }
}
