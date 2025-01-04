// src/utils/repositories/template.repository.ts
import type { TemplateError } from '../../domain/errors/template.errors'
import type { Template, TemplateVersion } from '../../domain/types/template'

function createTemplateError(code: TemplateError['code'], message: string): TemplateError {
    const error = new Error(message) as TemplateError
    error.code = code
    return error
}

export interface TemplateRepository {
    create(template: Template): Promise<string>
    getById(id: string): Promise<Template | null>
    getVersions(templateId: string): Promise<TemplateVersion[]>
    createVersion(version: TemplateVersion): Promise<string>
    update(template: Template): Promise<void>
    deprecate(id: string, replacedById?: string): Promise<void>
    cleanup(maxAge?: number): Promise<void>
    clearDeprecated(): Promise<void>
    transaction<T>(operation: () => Promise<T>): Promise<T>
}

export class TemplateRepositoryImpl implements TemplateRepository {
    private templates: Map<string, Template> = new Map()
    private versions: Map<string, TemplateVersion[]> = new Map()
    private readonly DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    private inTransaction = false
    private transactionBackup: {
        templates: Map<string, Template>
        versions: Map<string, TemplateVersion[]>
    } | null = null

    async transaction<T>(operation: () => Promise<T>): Promise<T> {
        if (this.inTransaction) {
            throw new Error('Nested transactions are not supported')
        }

        this.inTransaction = true
        this.transactionBackup = {
            templates: new Map(this.templates),
            versions: new Map(this.versions)
        }

        try {
            const result = await operation()
            this.transactionBackup = null
            return result
        } catch (error) {
            // Rollback on error
            if (this.transactionBackup) {
                this.templates = new Map(this.transactionBackup.templates)
                this.versions = new Map(this.transactionBackup.versions)
            }
            throw error
        } finally {
            this.inTransaction = false
        }
    }

    async create(template: Template): Promise<string> {
        await this.cleanup() // Cleanup before adding new data
        const id = crypto.randomUUID()
        const templateWithId = { ...template, id }
        this.templates.set(id, templateWithId)
        this.versions.set(id, [])
        return id
    }

    async getById(id: string): Promise<Template | null> {
        return this.templates.get(id) ?? null
    }

    async getVersions(templateId: string): Promise<TemplateVersion[]> {
        return this.versions.get(templateId) ?? []
    }

    async createVersion(version: TemplateVersion): Promise<string> {
        return this.transaction(async () => {
            const templateVersions = this.versions.get(version.templateId) ?? []

            // Keep only the last 5 versions if there are more
            if (templateVersions.length >= 5) {
                templateVersions.splice(0, templateVersions.length - 4)
            }

            const versionWithId = { ...version, id: crypto.randomUUID() }
            this.versions.set(version.templateId, [...templateVersions, versionWithId])
            return versionWithId.id
        })
    }

    async update(template: Template): Promise<void> {
        return this.transaction(async () => {
            if (!this.templates.has(template.id)) {
                throw createTemplateError(
                    'TEMPLATE_NOT_FOUND',
                    `Template ${template.id} not found`
                )
            }
            this.templates.set(template.id, {
                ...template,
                updatedAt: new Date()
            })
        })
    }

    async deprecate(id: string, replacedById?: string): Promise<void> {
        return this.transaction(async () => {
            const template = this.templates.get(id)
            if (!template) {
                throw createTemplateError(
                    'TEMPLATE_NOT_FOUND',
                    `Template ${id} not found`
                )
            }

            this.templates.set(id, {
                ...template,
                isDeprecated: true,
                deprecatedAt: new Date(),
                replacedByTemplateId: replacedById,
                updatedAt: new Date()
            })
        })
    }

    async cleanup(maxAge: number = this.DEFAULT_MAX_AGE): Promise<void> {
        const now = Date.now()

        // Cleanup old templates
        for (const [id, template] of this.templates) {
            const age = now - template.updatedAt.getTime()

            // Remove if template is too old and deprecated
            if (template.isDeprecated && age > maxAge) {
                this.templates.delete(id)
                this.versions.delete(id)
                continue
            }

            // Remove if template hasn't been updated in a very long time (3x maxAge)
            if (age > maxAge * 3) {
                this.templates.delete(id)
                this.versions.delete(id)
            }
        }

        // Cleanup orphaned versions
        for (const [templateId, _] of this.versions) {
            if (!this.templates.has(templateId)) {
                this.versions.delete(templateId)
            }
        }
    }

    async clearDeprecated(): Promise<void> {
        for (const [id, template] of this.templates) {
            if (template.isDeprecated) {
                this.templates.delete(id)
                this.versions.delete(id)
            }
        }
    }
}