import type { Model } from "@/domain/models"
import type { Row } from "@libsql/client"

export function mapRowToModel(row: Row): Model {
    return {
        id: String(row.id),
        name: String(row.name),
        description: row.description === null ? null : String(row.description),
        providerId: String(row.provider_id),
        isEnabled: Boolean(row.is_enabled),
        modelFamily: String(row.model_family),
        contextWindow: Number(row.context_window),
        maxTokens: row.max_tokens === null ? null : Number(row.max_tokens),
        inputPricePerToken: String(row.input_price_per_token),
        outputPricePerToken: String(row.output_price_per_token),
        releaseDate: row.release_date === null ? null : String(row.release_date),
        type: String(row.type) as 'proprietary' | 'open source',
        reasoning: Boolean(row.reasoning),
        supportedFeatures: JSON.parse(String(row.supported_features)),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
} 