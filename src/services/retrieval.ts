import type { OpenAI } from "openai";
import type { Release, SearchResult } from "../types";
import type { GitHubService } from "./github";
import type { VectorStore } from "./vectorStore";

export class HonoDocRetrieval {
    constructor(
        private readonly openai: OpenAI,
        private readonly vectorStore: VectorStore,
        private readonly githubService: GitHubService,
    ) { }

    async indexNewRelease(release: Release) {
        const embedding = await this.generateEmbedding(release.content);

        await this.vectorStore.add({
            id: release.version,
            vector: embedding,
            metadata: {
                version: release.version,
                date: release.date,
                content: release.content,
            },
        });
    }

    async query(question: string): Promise<SearchResult[]> {
        const questionEmbedding = await this.generateEmbedding(question);

        const results = await this.vectorStore.search({
            vector: questionEmbedding,
            limit: 5,
        });

        return results.map((result) => ({
            content: result.metadata.content as string,
            version: result.metadata.version as string,
            similarity: result.metadata.score as number,
        }));
    }

    private async generateEmbedding(text: string) {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            throw new Error(`Failed to generate embedding: ${error}`);
        }
    }
}
