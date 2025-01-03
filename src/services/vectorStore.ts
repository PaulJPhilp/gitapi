// Types
interface Document {
    id: string
    vector: number[]
    metadata: Record<string, unknown>
}

interface VectorStoreDocument {
    id: string
    vector: number[]
    metadata: Record<string, unknown>
}

// Service interface
export interface VectorStore {
    readonly _tag: "VectorStore"
    add(doc: Document): Promise<void>
    search(query: { vector: number[]; limit: number }): Promise<Array<{ metadata: { score: number } & Record<string, unknown> }>>
}

// Implementation
export class InMemoryVectorStore implements VectorStore {
    readonly _tag = "VectorStore" as const

    private vectors = new Map<string, VectorStoreDocument>()

    async add(doc: Document): Promise<void> {
        this.vectors.set(doc.id, doc)
    }

    async search(query: { vector: number[]; limit: number }): Promise<Array<{ metadata: { score: number } & Record<string, unknown> }>> {
        return Array.from(this.vectors.values())
            .map((doc: VectorStoreDocument) => ({
                metadata: {
                    ...doc.metadata,
                    score: this.calculateSimilarity(query.vector, doc.vector)
                }
            }))
            .sort((a, b) => (b.metadata.score as number) - (a.metadata.score as number))
            .slice(0, query.limit)
    }

    private calculateSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
        return dotProduct / (magnitudeA * magnitudeB)
    }
} 