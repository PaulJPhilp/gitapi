import type { Template } from "@/domain"
import { client } from "../db"
import { DatabaseError, EntityNotFoundError } from "../errors"
import { validateTemplate } from "../validation/template"
import type { Repository } from "./types"

export interface TemplateRepository extends Repository<Template, Omit<Template, "id" | "createdAt" | "updatedAt">> {
    findActive(): Promise<Template[]>
    findByVersion(version: string): Promise<Template[]>
}

export const templateRepository: TemplateRepository = {
    async findAll(): Promise<Template[]> {
        const result = await client.execute({
            sql: "SELECT * FROM templates",
            args: []
        })
        return result.rows.map(mapRowToTemplate)
    },

    async findById(id: string): Promise<Template | null> {
        const result = await client.execute({
            sql: "SELECT * FROM templates WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? mapRowToTemplate(result.rows[0]) : null
    },

    async create(data: Omit<Template, "id" | "createdAt" | "updatedAt">): Promise<Template> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            const template: Template = {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }

            validateTemplate(template)

            await client.execute({
                sql: `INSERT INTO templates (
                    id, name, description, version, content,
                    parameters, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id, data.name, data.description, data.version,
                    data.content, JSON.stringify(data.parameters),
                    data.isActive, now, now
                ]
            })

            return template
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>): Promise<Template> {
        try {
            const existing = await this.findById(id)
            if (!existing) {
                throw new EntityNotFoundError('Template', id)
            }

            const sets: string[] = []
            const values: (string | boolean | object | null)[] = []
            const now = new Date().toISOString()

            if (data.name !== undefined) {
                sets.push("name = ?")
                values.push(data.name)
            }

            if (data.description !== undefined) {
                sets.push("description = ?")
                values.push(data.description)
            }

            if (data.version !== undefined) {
                sets.push("version = ?")
                values.push(data.version)
            }

            if (data.content !== undefined) {
                sets.push("content = ?")
                values.push(data.content)
            }

            if (data.parameters !== undefined) {
                sets.push("parameters = ?")
                values.push(JSON.stringify(data.parameters))
            }

            if (data.isActive !== undefined) {
                sets.push("is_active = ?")
                values.push(data.isActive)
            }

            if (sets.length > 0) {
                const updatedTemplate: Template = {
                    ...existing,
                    ...data,
                    updatedAt: now
                }
                validateTemplate(updatedTemplate)

                sets.push("updated_at = ?")
                values.push(now)
                values.push(id)

                await client.execute({
                    sql: `UPDATE templates SET ${sets.join(", ")} WHERE id = ?`,
                    args: values
                })
            }

            const result = await client.execute({
                sql: "SELECT * FROM templates WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new EntityNotFoundError('Template', id)
            }

            return mapRowToTemplate(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM templates WHERE id = ?",
            args: [id]
        })
    },

    async findActive(): Promise<Template[]> {
        const result = await client.execute({
            sql: "SELECT * FROM templates WHERE is_active = true",
            args: []
        })
        return result.rows.map(mapRowToTemplate)
    },

    async findByVersion(version: string): Promise<Template[]> {
        const result = await client.execute({
            sql: "SELECT * FROM templates WHERE version = ?",
            args: [version]
        })
        return result.rows.map(mapRowToTemplate)
    }
}

function mapRowToTemplate(row: Record<string, unknown>): Template {
    return {
        id: String(row.id),
        name: String(row.name),
        description: row.description ? String(row.description) : null,
        version: String(row.version),
        content: String(row.content),
        parameters: row.parameters ? JSON.parse(String(row.parameters)) : {},
        isActive: Boolean(row.is_active),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
} 