import type { Provider, SupportedFeatures } from "@/domain/models"
import type { ProviderApiKey } from "@/domain/provider-api-key"
import type { Row } from "@libsql/client"

export function mapRowToProvider(row: Row): Provider {
    return {
        id: String(row.id),
        name: String(row.name),
        description: String(row.description),
        website: String(row.website),
        apiKeyRequired: Boolean(row.api_key_required),
        baseUrl: row.base_url ? String(row.base_url) : null,
        isEnabled: Boolean(row.is_enabled),
        releaseDate: row.release_date ? String(row.release_date) : null,
        supportedFeatures: JSON.parse(String(row.supported_features)) as SupportedFeatures,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

export function mapRowToProviderApiKey(row: Row): ProviderApiKey {
    return {
        providerId: String(row.provider_id),
        apiKey: String(row.api_key),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
} 