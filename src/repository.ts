
import { Octokit } from "octokit";

interface Repository {
    id: number;
    name: string;
    description: string;
    stargazers_count: number;
}

export async function fetchRepository(owner: string, repo: string) {
    const octokit = new Octokit({})
        
    try {
        console.log(`Fetching repository ${owner}/${repo}`)
        const result = await octokit.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repo
        });

        return result.data as Repository;
    } catch (error: unknown) {
        if (error instanceof Error && 'status' in error && error.status === 404) {
            console.error('Repository not found');
        } else if (error instanceof Error) {
            console.error('An error occurred:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }

    
}
