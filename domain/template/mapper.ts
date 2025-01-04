import type { Template, TemplateDTO } from './template'
import type { TemplateVersion, TemplateVersionDTO } from './version'

export const TemplateMapper = {
    toDomain(dto: TemplateDTO): Template {
        return new Template(
            dto.id,
            dto.createdAt,
            dto.updatedAt,
            dto.name,
            dto.content,
            dto.version,
            dto.isDeprecated,
            dto.createdBy,
            dto.deprecatedAt,
            dto.replacedByTemplateId,
            dto.lastModifiedBy
        )
    },

    toDTO(entity: Template): TemplateDTO {
        return {
            id: entity.id,
            name: entity.name,
            content: entity.content,
            version: entity.version,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            isDeprecated: entity.isDeprecated,
            createdBy: entity.createdBy,
            deprecatedAt: entity.deprecatedAt,
            replacedByTemplateId: entity.replacedByTemplateId,
            lastModifiedBy: entity.lastModifiedBy
        }
    }
}

export const TemplateVersionMapper = {
    toDomain(dto: TemplateVersionDTO): TemplateVersion {
        return new TemplateVersion(
            dto.id,
            dto.createdAt,
            dto.updatedAt,
            dto.templateId,
            dto.version,
            dto.content,
            dto.changeDescription,
            dto.author
        )
    },

    toDTO(entity: TemplateVersion): TemplateVersionDTO {
        return {
            id: entity.id,
            templateId: entity.templateId,
            version: entity.version,
            content: entity.content,
            changeDescription: entity.changeDescription,
            author: entity.author,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        }
    }
} 