import type { Prompt } from "@/domain/models"
import type { Row } from "@libsql/client"

export function mapRowToPrompt(row: Row): Prompt {
    return {
        id: String(row.id),
        name: String(row.name),
        content: String(row.content),
        isActive: Boolean(row.is_active),
        modelId: String(row.model_id),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
} 