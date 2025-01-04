import { Entity } from '../common/entity'

export class TemplateVersion extends Entity {
    constructor(
        id: string,
        createdAt: Date,
        updatedAt: Date,
        public readonly templateId: string,
        public readonly version: string,
        public readonly content: string,
        public readonly createdBy: string,
        public readonly changelog?: string,
        public readonly isLatest: boolean = false
    ) {
        super(id, createdAt, updatedAt)
    }

    static create(params: CreateTemplateVersionParams): TemplateVersion {
        const now = new Date()
        return new TemplateVersion(
            crypto.randomUUID(),
            now,
            now,
            params.templateId,
            params.version,
            params.content,
            params.createdBy,
            params.changelog,
            params.isLatest ?? false
        )
    }

    markAsLatest(): TemplateVersion {
        return new TemplateVersion(
            this.id,
            this.createdAt,
            new Date(),
            this.templateId,
            this.version,
            this.content,
            this.createdBy,
            this.changelog,
            true
        )
    }

    markAsNotLatest(): TemplateVersion {
        return new TemplateVersion(
            this.id,
            this.createdAt,
            new Date(),
            this.templateId,
            this.version,
            this.content,
            this.createdBy,
            this.changelog,
            false
        )
    }
}

export interface CreateTemplateVersionParams {
    templateId: string
    version: string
    content: string
    createdBy: string
    changelog?: string
    isLatest?: boolean
}

export interface TemplateVersionDTO {
    id: string
    templateId: string
    version: string
    content: string
    createdAt: Date
    updatedAt: Date
    createdBy: string
    changelog?: string
    isLatest: boolean
}

export interface TemplateChanges {
    parameterChanges: {
        added: string[]
        removed: string[]
        modified: string[]
    }
    contentDiff: string
    breakingChanges: boolean
} 