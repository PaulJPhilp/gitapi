import type { AuthContext, TemplateUpdateNotification, UpdateValidation } from '../../domain/models'
import type { Template, TemplateChanges, TemplateVersion } from '../domain/types/template'
import type { PromptRepository } from '../infrastructure/repositories/prompt.repository'
import type { TemplateRepository } from '../infrastructure/repositories/template.repository'

export interface TemplateService {
    createTemplate(template: Template): Promise<string>
    createNewVersion(
        templateId: string,
        content: string,
        changeDescription: string
    ): Promise<TemplateVersion>
    validateUpdate(
        templateId: string,
        fromVersion: string,
        toVersion: string
    ): Promise<UpdateValidation>
    findAffectedPrompts(
        templateId: string,
        version: string
    ): Promise<TemplateUpdateNotification>
}

export class TemplateServiceImpl implements TemplateService {
    constructor(
        private readonly templateRepository: TemplateRepository,
        private readonly promptRepository: PromptRepository,
        private readonly authContext: AuthContext
    ) { }

    private async checkPermission(action: 'create' | 'update' | 'delete' | 'read', templateId?: string): Promise<void> {
        if (!this.authContext.isAuthenticated) {
            throw new Error('Authentication required')
        }

        const hasPermission = await this.authContext.hasPermission({
            action,
            resource: 'template',
            resourceId: templateId
        })

        if (!hasPermission) {
            throw new Error(`Permission denied: ${action} template${templateId ? ` ${templateId}` : ''}`)
        }
    }

    async createTemplate(template: Template): Promise<string> {
        await this.checkPermission('create')
        this.validateTemplate(template)

        const now = new Date()
        const enrichedTemplate: Template = {
            ...template,
            createdAt: now,
            updatedAt: now,
            isDeprecated: false,
            version: '1.0.0',
            createdBy: this.authContext.userId
        }

        return this.templateRepository.create(enrichedTemplate)
    }

    async createNewVersion(
        templateId: string,
        content: string,
        changeDescription: string
    ): Promise<TemplateVersion> {
        await this.checkPermission('update', templateId)

        const template = await this.templateRepository.getById(templateId)
        if (!template) {
            throw new Error(`Template ${templateId} not found`)
        }

        const versions = await this.templateRepository.getVersions(templateId)
        const latestVersion = versions[versions.length - 1]
        const baseVersion = latestVersion?.version ?? '1.0.0'

        // Compute changes to determine version bump
        const changes = latestVersion
            ? this.computeChanges(latestVersion, {
                id: '',
                templateId,
                version: '',
                content,
                createdAt: new Date(),
                changeDescription,
                author: this.authContext.userId
            })
            : {
                contentDiff: content,
                parameterChanges: { added: [], removed: [], modified: [] },
                breakingChanges: false
            }

        const newVersion = this.incrementVersion(baseVersion, changes)

        const templateVersion: TemplateVersion = {
            id: crypto.randomUUID(),
            templateId,
            version: newVersion,
            content,
            createdAt: new Date(),
            changeDescription,
            author: this.authContext.userId
        }

        await this.templateRepository.createVersion(templateVersion)
        return templateVersion
    }

    async validateUpdate(
        templateId: string,
        fromVersion: string,
        toVersion: string
    ): Promise<UpdateValidation> {
        await this.checkPermission('read', templateId)

        const template = await this.templateRepository.getById(templateId)
        if (!template) {
            throw new Error(`Template ${templateId} not found`)
        }

        const versions = await this.templateRepository.getVersions(templateId)
        const oldVersion = versions.find(v => v.version === fromVersion)
        const newVersion = versions.find(v => v.version === toVersion)

        if (!oldVersion || !newVersion) {
            throw new Error('Version not found')
        }

        const changes = this.computeChanges(oldVersion, newVersion)

        return {
            promptId: templateId,
            proposedUpdate: {
                fromVersion,
                toVersion,
                parameterChanges: changes.parameterChanges,
                contentChanges: changes.contentDiff
            },
            validation: {
                isValid: !changes.breakingChanges,
                parameterValidation: this.validateParameters(changes),
                contentValidation: {
                    syntaxValid: true,
                    semanticsValid: true,
                    issues: []
                }
            }
        }
    }

    async findAffectedPrompts(
        templateId: string,
        version: string
    ): Promise<TemplateUpdateNotification> {
        await this.checkPermission('read', templateId)

        const prompts = await this.promptRepository.getByTemplateId(templateId)
        const affectedPrompts = await Promise.all(
            prompts.map(async prompt => {
                const validation = await this.validateUpdate(
                    templateId,
                    prompt.templateVersion,
                    version
                )

                return {
                    promptId: prompt.id,
                    compatibilityStatus: this.determineCompatibilityStatus(validation),
                    suggestedActions: this.generateSuggestedActions(validation)
                }
            })
        )

        return {
            templateId,
            affectedPrompts
        }
    }

    private validateTemplate(template: Template): void {
        if (!template.name || !template.content) {
            throw new Error('Template name and content are required')
        }
    }

    private incrementVersion(version: string, changes: TemplateChanges): string {
        const [major, minor, patch] = version.split('.').map(Number)

        // Major version bump for breaking changes
        if (changes.breakingChanges) {
            return `${major + 1}.0.0`
        }

        // Minor version bump for new parameters
        if (changes.parameterChanges.added.length > 0) {
            return `${major}.${minor + 1}.0`
        }

        // Patch version for non-breaking changes
        return `${major}.${minor}.${patch + 1}`
    }

    private computeChanges(oldVersion: TemplateVersion, newVersion: TemplateVersion): TemplateChanges {
        // Extract parameters from content
        const oldParams = this.extractParameters(oldVersion.content)
        const newParams = this.extractParameters(newVersion.content)

        const added = newParams.filter(p => !oldParams.includes(p))
        const removed = oldParams.filter(p => !newParams.includes(p))
        const modified = this.detectModifiedParameters(oldVersion.content, newVersion.content, oldParams)

        // Check for breaking changes
        const hasBreakingChanges = removed.length > 0 || modified.some(param =>
            this.isBreakingParameterChange(oldVersion.content, newVersion.content, param)
        )

        return {
            contentDiff: this.generateDiff(oldVersion.content, newVersion.content),
            parameterChanges: {
                added,
                removed,
                modified
            },
            breakingChanges: hasBreakingChanges
        }
    }

    private validateParameters(changes: TemplateChanges): Array<{
        parameter: string
        status: 'valid' | 'invalid' | 'missing'
        suggestion?: string
    }> {
        const validations: Array<{
            parameter: string
            status: 'valid' | 'invalid' | 'missing'
            suggestion?: string
        }> = []

        // Check removed parameters
        for (const param of changes.parameterChanges.removed) {
            validations.push({
                parameter: param,
                status: 'missing',
                suggestion: `Parameter ${param} was removed and needs to be handled`
            })
        }

        // Check added parameters
        for (const param of changes.parameterChanges.added) {
            validations.push({
                parameter: param,
                status: 'invalid',
                suggestion: `New parameter ${param} needs to be provided`
            })
        }

        // Check modified parameters
        for (const param of changes.parameterChanges.modified) {
            const validation = this.validateModifiedParameter(param)
            validations.push(validation)
        }

        return validations
    }

    private validateModifiedParameter(param: string): {
        parameter: string
        status: 'valid' | 'invalid' | 'missing'
        suggestion?: string
    } {
        // Check parameter format
        if (!this.isValidParameterFormat(param)) {
            return {
                parameter: param,
                status: 'invalid',
                suggestion: `Parameter ${param} format is invalid. Should match {{parameterName}}`
            }
        }

        // Check parameter name constraints
        if (!this.isValidParameterName(param)) {
            return {
                parameter: param,
                status: 'invalid',
                suggestion: `Parameter ${param} name should be alphanumeric and use camelCase`
            }
        }

        return {
            parameter: param,
            status: 'valid'
        }
    }

    private isValidParameterFormat(param: string): boolean {
        return /^[a-zA-Z][a-zA-Z0-9]*$/.test(param)
    }

    private isValidParameterName(param: string): boolean {
        return /^[a-z][a-zA-Z0-9]*$/.test(param) // camelCase validation
    }

    private detectModifiedParameters(oldContent: string, newContent: string, params: string[]): string[] {
        return params.filter(param => {
            const oldUsage = this.extractParameterUsage(oldContent, param)
            const newUsage = this.extractParameterUsage(newContent, param)
            return oldUsage !== newUsage && newUsage !== null
        })
    }

    private extractParameterUsage(content: string, param: string): string | null {
        const regex = new RegExp(`{{${param}([^}]*)}}`, 'g')
        const matches = content.match(regex)
        return matches ? matches[0] : null
    }

    private isBreakingParameterChange(oldContent: string, newContent: string, param: string): boolean {
        const oldUsage = this.extractParameterUsage(oldContent, param)
        const newUsage = this.extractParameterUsage(newContent, param)

        // If parameter is used differently or removed, it's a breaking change
        return oldUsage !== null && (newUsage === null || oldUsage !== newUsage)
    }

    private canAutoFix(validation: UpdateValidation): boolean {
        // Can't auto-fix if there are breaking changes
        if (validation.validation.parameterValidation.some(v => v.status === 'missing')) {
            return false
        }

        // Can't auto-fix if there are invalid parameters that need manual intervention
        if (validation.validation.parameterValidation.some(v =>
            v.status === 'invalid' && !this.isAutoFixableParameter(v)
        )) {
            return false
        }

        // Can't auto-fix if content validation failed
        if (!validation.validation.contentValidation.syntaxValid ||
            !validation.validation.contentValidation.semanticsValid) {
            return false
        }

        return true
    }

    private isAutoFixableParameter(validation: {
        parameter: string
        status: 'valid' | 'invalid' | 'missing'
        suggestion?: string
    }): boolean {
        // Only auto-fix parameters with valid format but wrong casing
        return validation.status === 'invalid' &&
            this.isValidParameterFormat(validation.parameter) &&
            !this.isValidParameterName(validation.parameter)
    }

    private generateDiff(oldContent: string, newContent: string): string {
        // Simple diff implementation - in a real app, use a proper diff library
        return newContent
    }

    private extractParameters(content: string): string[] {
        const paramRegex = /{{([^}]+)}}/g
        const matches = content.matchAll(paramRegex)
        return Array.from(matches, m => m[1])
    }

    private determineCompatibilityStatus(validation: UpdateValidation): 'compatible' | 'requires-review' | 'incompatible' {
        // Breaking changes make the update incompatible
        if (!validation.validation.isValid) {
            return 'incompatible'
        }

        // Added parameters or modified parameters require review
        if (validation.proposedUpdate.parameterChanges.added.length > 0 ||
            validation.proposedUpdate.parameterChanges.modified.length > 0) {
            return 'requires-review'
        }

        return 'compatible'
    }

    private generateSuggestedActions(validation: UpdateValidation): Array<{
        type: string
        description: string
    }> {
        const actions: Array<{ type: string; description: string }> = []

        // Handle added parameters
        for (const param of validation.proposedUpdate.parameterChanges.added) {
            actions.push({
                type: 'parameter-update',
                description: `Add value for new parameter: ${param}`
            })
        }

        // Handle removed parameters
        for (const param of validation.proposedUpdate.parameterChanges.removed) {
            actions.push({
                type: 'parameter-removal',
                description: `Remove parameter: ${param}`
            })
        }

        // Handle modified parameters
        for (const param of validation.proposedUpdate.parameterChanges.modified) {
            actions.push({
                type: 'parameter-update',
                description: `Update parameter format: ${param}`
            })
        }

        return actions
    }
} 