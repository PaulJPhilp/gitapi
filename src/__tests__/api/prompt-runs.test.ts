import { API_BASE_URL } from '@/src/config/api'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
    createTestCompletion,
    createTestModel,
    createTestPrompt,
    deleteTestModel,
    deleteTestPrompt,
    deleteTestPromptRun
} from '../utils/test-helpers'

describe('Prompt Runs API', () => {
    let testModelId: string
    let testPromptId: string
    let testPromptRunId: string

    beforeAll(async () => {
        // Create test data
        const model = await createTestModel({
            name: 'Test Model for Prompt Runs'
        })
        testModelId = model.id

        const prompt = await createTestPrompt({
            name: 'Test Prompt for Prompt Runs',
            content: 'This is a test prompt for prompt runs',
            modelId: testModelId
        })
        testPromptId = prompt.id

        const completion = await createTestCompletion({
            modelId: testModelId,
            promptId: testPromptId
        })
        testPromptRunId = completion.promptRun.id
    })

    afterAll(async () => {
        // Clean up in reverse order of creation
        await deleteTestPromptRun(testPromptRunId)
        await deleteTestPrompt(testPromptId)
        await deleteTestModel(testModelId)
    })

    describe('GET /api/prompt-runs', () => {
        it('should return an array of prompt runs', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)

            // Verify prompt run structure
            if (data.length > 0) {
                const promptRun = data[0]
                expect(promptRun).toHaveProperty('id')
                expect(promptRun).toHaveProperty('promptId')
                expect(promptRun).toHaveProperty('modelId')
                expect(promptRun).toHaveProperty('providerId')
                expect(promptRun).toHaveProperty('content')
                expect(promptRun).toHaveProperty('completion')
                expect(promptRun).toHaveProperty('usage')
                expect(promptRun).toHaveProperty('createdAt')
            }
        })

        it('should filter by promptId', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs?promptId=${testPromptId}`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)

            // All returned runs should be for our test prompt
            for (const run of data) {
                expect(run.promptId).toBe(testPromptId)
            }
        })

        it('should filter by modelId', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs?modelId=${testModelId}`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)

            // All returned runs should be for our test model
            for (const run of data) {
                expect(run.modelId).toBe(testModelId)
            }
        })
    })

    describe('GET /api/prompt-runs/:id', () => {
        it('should return a specific prompt run', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/${testPromptRunId}`)
            expect(response.ok).toBe(true)

            const promptRun = await response.json()
            expect(promptRun.id).toBe(testPromptRunId)
            expect(promptRun.promptId).toBe(testPromptId)
            expect(promptRun.modelId).toBe(testModelId)
        })

        it('should return 404 for non-existent prompt run', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/non-existent-id`)
            expect(response.ok).toBe(false)
            expect(response.status).toBe(404)
        })
    })

    describe('GET /api/prompt-runs/by-prompt/:promptId', () => {
        it('should return runs for a specific prompt', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/by-prompt/${testPromptId}`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)

            // All returned runs should be for our test prompt
            for (const run of data) {
                expect(run.promptId).toBe(testPromptId)
            }
        })

        it('should return empty array for non-existent prompt', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/by-prompt/non-existent-id`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBe(0)
        })
    })

    describe('GET /api/prompt-runs/by-model/:modelId', () => {
        it('should return runs for a specific model', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/by-model/${testModelId}`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)

            // All returned runs should be for our test model
            for (const run of data) {
                expect(run.modelId).toBe(testModelId)
            }
        })

        it('should return empty array for non-existent model', async () => {
            const response = await fetch(`${API_BASE_URL}/prompt-runs/by-model/non-existent-id`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBe(0)
        })
    })
}) 