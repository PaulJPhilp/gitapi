import type { TemplateChanges } from './template'

export interface VersionCompatibility {
    fromVersion: string
    toVersion: string
    isCompatible: boolean
    requiredChanges?: string[]
    automaticMigrationPossible: boolean
}

export interface TemplateUpdateNotification {
    templateId: string
    affectedPrompts: Array<{
        promptId: string
        compatibilityStatus: 'compatible' | 'requires-review' | 'breaking'
        suggestedActions: Array<{
            type: 'parameter-update' | 'content-update' | 'manual-review'
            description: string
        }>
    }>
}

export interface UpdateValidation {
    promptId: string
    proposedUpdate: {
        fromVersion: string
        toVersion: string
        parameterChanges: TemplateChanges['parameterChanges']
        contentChanges: string
    }
    validation: {
        isValid: boolean
        parameterValidation: Array<{
            parameter: string
            status: 'valid' | 'invalid' | 'missing'
            suggestion?: string
        }>
        contentValidation: {
            syntaxValid: boolean
            semanticsValid: boolean
            issues: string[]
        }
    }
}

export interface UpdateRollback {
    promptId: string
    rollbackPoint: {
        version: string
        timestamp: Date
        snapshot: {
            content: string
            parameters: Record<string, unknown>
            metadata: Record<string, unknown>
        }
    }
    rollbackReason: string
    automaticRollbackTriggers: Array<{
        condition: string
        threshold: number
    }>
} 