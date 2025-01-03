import { Octokit } from "octokit";

export interface DetailedRelease {
    url: string;
    html_url: string;
    assets_url: string;
    upload_url: string;
    tarball_url: string;
    zipball_url: string;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    author: {
        login: string;
        id: number;
        type: string;
        site_admin: boolean;
    };
    assets: {
        url: string;
        name: string;
        size: number;
        download_count: number;
        created_at: string;
        updated_at: string;
        browser_download_url: string;
    }[];
}

function createOctokit() {
    return new Octokit()
}

interface ReleaseComparison {
    tag_name: string;
    changes: string[];
}

async function compareReleases(oldTag: string, newTag: string) {
    const octokit = new Octokit();

    const [oldRelease, newRelease] = await Promise.all([
        octokit.rest.repos.getReleaseByTag({
            owner: "Effect-TS",
            repo: "effect",
            tag: oldTag
        }),
        octokit.rest.repos.getReleaseByTag({
            owner: "Effect-TS",
            repo: "effect",
            tag: newTag
        })
    ]);

    return {
        oldRelease: oldRelease.data,
        newRelease: newRelease.data
    };
}


export async function fetchReleaseDetails(owner: string, repo: string, tagName: string): Promise<DetailedRelease> {
    const octokit = createOctokit()

    const response = await octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag: tagName
    })

    return response.data as DetailedRelease
}

export async function fetchReleases(owner: string, repo: string): Promise<DetailedRelease[]> {
    const octokit = createOctokit()

    const response = await octokit.rest.repos.listReleases({
        owner,
        repo
    })

    return response.data as DetailedRelease[]
}

export async function fetchLatestRelease(owner: string, repo: string): Promise<DetailedRelease> {
    const octokit = createOctokit()

    const response = await octokit.rest.repos.getLatestRelease({
        owner,
        repo
    })

    return response.data as DetailedRelease
}

interface VersionDiff {
    currentVersion: string
    previousVersion: string
    changes: string[]
}

export async function getVersionDifference(owner: string, repo: string, oldTag: string, newTag: string): Promise<VersionDiff> {
    const octokit = new Octokit();

    const [oldRelease, newRelease] = await Promise.all([
        octokit.rest.repos.getReleaseByTag({
            owner: owner,
            repo: repo,
            tag: oldTag
        }),
        octokit.rest.repos.getReleaseByTag({
            owner: owner,
            repo: repo,
            tag: newTag
        })
    ]);
    return {
        currentVersion: newRelease.data.tag_name,
        previousVersion: oldRelease.data.tag_name,
        changes: newRelease.data.body?.split('\n') ?? []
    };
}

// Generate release notes automatically
export async function generateReleaseNotes(owner: string, repo: string, tagName: string, previousTagName: string) {
    const octokit = createOctokit()
    const { data } = await octokit.rest.repos.generateReleaseNotes({
        owner,
        repo,
        tag_name: tagName,
        previous_tag_name: previousTagName
    });
    return data.body; // Contains auto-generated release notes
};

export async function compareReleaseNotes(owner: string, repo: string, currentTag: string, previousTag: string): Promise<string> {
    const [currentRelease, previousRelease] = await Promise.all([
        fetchReleaseDetails(owner, repo, currentTag),
        fetchReleaseDetails(owner, repo, previousTag)
    ])

    return `
# Release Notes: ${currentRelease.tag_name}

## Changes since ${previousRelease.tag_name}

${currentRelease.body ?? 'No release notes available.'}

## Previous Release Notes
${previousRelease.body ?? 'No release notes available.'}
`
}