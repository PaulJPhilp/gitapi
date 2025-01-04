import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { AuthContext, CreateTemplateDTO, Prompt, Template, TemplateVersion } from '../../../domain/models'
import type { PromptRepository } from '../../infrastructure/repositories/prompt.repository'
import type { TemplateRepository } from '../../infrastructure/repositories/template.repository'
import { TemplateServiceImpl } from '../../services/template.service'

describe('TemplateService', () => {
    let templateService: TemplateServiceImpl
    let mockTemplateRepo: TemplateRepository
    let mockPromptRepo: PromptRepository
    let mockAuthContext: AuthContext

    beforeEach(() => {
        mockTemplateRepo = {
            create: mock(() => Promise.resolve('new-template-id')),
            getById: mock(() => Promise.resolve(null)),
            getVersions: mock(() => Promise.resolve([])),
            createVersion: mock(() => Promise.resolve('new-version-id')),
            update: mock(() => Promise.resolve()),
            deprecate: mock(() => Promise.resolve()),
            cleanup: mock(() => Promise.resolve()),
            clearDeprecated: mock(() => Promise.resolve()),
            transaction: mock((fn) => fn())
        }

        mockPromptRepo = {
            create: mock(() => Promise.resolve('new-prompt-id')),
            getById: mock(() => Promise.resolve(null)),
            getByTemplateId: mock(() => Promise.resolve([])),
            update: mock(() => Promise.resolve()),
            updateStatus: mock(() => Promise.resolve()),
            cleanup: mock(() => Promise.resolve()),
            clearUpdateHistory: mock(() => Promise.resolve())
        }

        mockAuthContext = {
            isAuthenticated: true,
            userId: 'test-user-id',
            hasPermission: mock(() => Promise.resolve(true))
        }

        templateService = new TemplateServiceImpl(
            mockTemplateRepo,
            mockPromptRepo,
            mockAuthContext
        )
    })

    describe('createTemplate', () => {
        const validTemplate: CreateTemplateDTO = {
            name: 'Test Template',
            content: 'Test content with {{parameter}}'
        }

        it('should create a template when user has permission', async () => {
            const result = await templateService.createTemplate(validTemplate)

            expect(result).toBe('new-template-id')
            expect(mockTemplateRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                name: validTemplate.name,
                content: validTemplate.content,
                createdBy: 'test-user-id',
                isDeprecated: false,
                version: '1.0.0'
            }))
        })

        it('should throw error when user is not authenticated', async () => {
            mockAuthContext.isAuthenticated = false

            await expect(templateService.createTemplate(validTemplate))
                .rejects
                .toThrow('Authentication required')
        })

        it('should throw error when user lacks permission', async () => {
            mockAuthContext.hasPermission = mock(() => Promise.resolve(false))

            await expect(templateService.createTemplate(validTemplate))
                .rejects
                .toThrow('Permission denied: create template')
        })

        it('should validate template fields', async () => {
            const invalidTemplate = { content: 'Only content' } as Template

            await expect(templateService.createTemplate(invalidTemplate))
                .rejects
                .toThrow('Template name and content are required')
        })
    })

    describe('createNewVersion', () => {
        const now = new Date()
        const existingTemplate: Template = {
            id: 'template-id',
            name: 'Test Template',
            content: 'Original content {{param}}',
            version: '1.0.0',
            createdAt: now,
            updatedAt: now,
            isDeprecated: false,
            createdBy: 'test-user-id'
        }

        const existingVersion: TemplateVersion = {
            id: 'version-1',
            templateId: 'template-id',
            version: '1.0.0',
            content: 'Original content {{param}}',
            createdAt: now,
            updatedAt: now,
            changeDescription: 'Initial version',
            author: 'test-user-id'
        }

        beforeEach(() => {
            mockTemplateRepo.getById = mock(() => Promise.resolve(existingTemplate))
            mockTemplateRepo.getVersions = mock(() => Promise.resolve([existingVersion]))
            mockTemplateRepo.createVersion = mock(() => Promise.resolve('new-version-id'))
        })

        it('should create new version with patch bump for non-breaking changes', async () => {
            const newContent = 'Updated content {{param}}'
            const result = await templateService.createNewVersion(
                'template-id',
                newContent,
                'Minor update'
            )

            expect(result.version).toBe('1.0.1')
            expect(result.content).toBe(newContent)
            expect(mockTemplateRepo.createVersion).toHaveBeenCalled()
        })

        it('should create new version with minor bump for added parameters', async () => {
            const newContent = 'Updated content {{param}} {{newParam}}'
            const result = await templateService.createNewVersion(
                'template-id',
                newContent,
                'Added parameter'
            )

            expect(result.version).toBe('1.1.0')
            expect(result.content).toBe(newContent)
        })

        it('should create new version with major bump for breaking changes', async () => {
            const newContent = 'Updated content {{newParam}}'  // Removed original parameter
            const result = await templateService.createNewVersion(
                'template-id',
                newContent,
                'Breaking change'
            )

            expect(result.version).toBe('2.0.0')
            expect(result.content).toBe(newContent)
        })

        it('should throw error when template not found', async () => {
            mockTemplateRepo.getById = mock(() => Promise.resolve(null))

            await expect(templateService.createNewVersion(
                'non-existent-id',
                'content',
                'description'
            )).rejects.toThrow('Template non-existent-id not found')
        })
    })

    describe('validateUpdate', () => {
        const oldVersion: TemplateVersion = {
            id: 'v1',
            templateId: 'template-id',
            version: '1.0.0',
            content: 'Original {{param1}}',
            createdAt: new Date(),
            changeDescription: 'Initial',
            author: 'test-user-id'
        }

        const newVersion: TemplateVersion = {
            id: 'v2',
            templateId: 'template-id',
            version: '1.1.0',
            content: 'Updated {{param1}} {{param2}}',
            createdAt: new Date(),
            changeDescription: 'Added param',
            author: 'test-user-id'
        }

        beforeEach(() => {
            mockTemplateRepo.getById = mock(() => Promise.resolve({
                id: 'template-id',
                name: 'Test',
                content: '',
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeprecated: false,
                createdBy: 'test-user-id'
            }))
            mockTemplateRepo.getVersions = mock(() => Promise.resolve([oldVersion, newVersion]))
        })

        it('should detect added parameters', async () => {
            const result = await templateService.validateUpdate(
                'template-id',
                '1.0.0',
                '1.1.0'
            )

            expect(result.proposedUpdate.parameterChanges.added).toContain('param2')
            expect(result.validation.isValid).toBe(true)
        })

        it('should detect breaking changes', async () => {
            const breakingVersion: TemplateVersion = {
                ...newVersion,
                content: 'Breaking {{newParam}}'  // Removed original parameter
            }
            mockTemplateRepo.getVersions = mock(() => Promise.resolve([oldVersion, breakingVersion]))

            const result = await templateService.validateUpdate(
                'template-id',
                '1.0.0',
                '1.1.0'
            )

            expect(result.validation.isValid).toBe(false)
            expect(result.validation.parameterValidation)
                .toContainEqual(expect.objectContaining({
                    status: 'missing',
                    parameter: 'param1'
                }))
        })
    })

    describe('findAffectedPrompts', () => {
        const mockPrompts: Prompt[] = [{
            id: 'prompt-1',
            name: 'Test Prompt',
            content: 'Original content with {{param}}',
            isActive: true,
            modelId: 'model-1',
            templateId: 'template-id',
            templateVersion: '1.0.0',
            parameters: { param: 'value' },
            autoUpdate: true,
            lastMigrationCheck: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }]

        beforeEach(() => {
            mockPromptRepo.getByTemplateId = mock(() => Promise.resolve(mockPrompts))
        })

        it('should find all prompts affected by update', async () => {
            const result = await templateService.findAffectedPrompts(
                'template-id',
                '1.1.0'
            )

            expect(result.affectedPrompts).toHaveLength(1)
            expect(result.affectedPrompts[0].promptId).toBe('prompt-1')
            expect(result.affectedPrompts[0].compatibilityStatus).toBe('requires-review')
        })

        it('should generate appropriate actions for affected prompts', async () => {
            const result = await templateService.findAffectedPrompts(
                'template-id',
                '1.1.0'
            )

            expect(result.affectedPrompts[0].suggestedActions)
                .toContainEqual(expect.objectContaining({
                    type: 'parameter-update',
                    description: expect.stringContaining('newParam')
                }))
        })
    })
}) 