import chalk from "chalk";
import { Octokit } from "octokit";

interface DetailedRelease {
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

async function fetchReleaseDetails(tagName: string) {
    const octokit = new Octokit();

    const response = await octokit.rest.repos.getReleaseByTag({
        owner: "Effect-TS",
        repo: "effect",
        tag: tagName
    });

    return response.data as DetailedRelease;
}

// Example usage
const program = async () => {
    const release = await fetchReleaseDetails('effect@3.12.0');
    console.log(`Version: ${release.tag_name}`);
    console.log(`Name: ${release.name}`);
    console.log(`Published: ${release.published_at}`);
    console.log(`Author: ${release.author.login}`);
    console.log(`Description:\n${release.body}`);
    console.log('\nAssets:');
    for (const asset of release.assets) {
        console.log(`- ${asset.name} (${asset.download_count} downloads)`);
    }
};

program().catch(error => {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
})
