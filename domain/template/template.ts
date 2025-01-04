import { Entity } from '../common/entity'

export class Template extends Entity {
    constructor(
        id: string,
        createdAt: Date,
        updatedAt: Date,
        public readonly name: string,
        public readonly content: string,
        public readonly version: string,
        public readonly isDeprecated: boolean,
        public readonly createdBy: string,
        public readonly deprecatedAt?: Date,
        public readonly replacedByTemplateId?: string,
        public readonly lastModifiedBy?: string
    ) {
        super(id, createdAt, updatedAt)
    }

    static create(params: CreateTemplateParams): Template {
        const now = new Date()
        return new Template(
            crypto.randomUUID(),
            now,
            now,
            params.name,
            params.content,
            '1.0.0',
            false,
            params.createdBy
        )
    }

    deprecate(replacedById?: string): Template {
        return new Template(
            this.id,
            this.createdAt,
            new Date(),
            this.name,
            this.content,
            this.version,
            true,
            this.createdBy,
            new Date(),
            replacedById,
            this.lastModifiedBy
        )
    }

    update(params: UpdateTemplateParams): Template {
        return new Template(
            this.id,
            this.createdAt,
            new Date(),
            params.name ?? this.name,
            params.content ?? this.content,
            this.version,
            this.isDeprecated,
            this.createdBy,
            this.deprecatedAt,
            this.replacedByTemplateId,
            params.lastModifiedBy
        )
    }
}

export interface CreateTemplateParams {
    name: string
    content: string
    createdBy: string
}

export interface UpdateTemplateParams {
    name?: string
    content?: string
    lastModifiedBy: string
}

export interface TemplateDTO {
    id: string
    name: string
    content: string
    version: string
    createdAt: Date
    updatedAt: Date
    isDeprecated: boolean
    createdBy: string
    deprecatedAt?: Date
    replacedByTemplateId?: string
    lastModifiedBy?: string
} 