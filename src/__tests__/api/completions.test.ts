import { API_BASE_URL } from '@/src/config/api'
import { beforeAll, describe, expect, it } from 'vitest'

describe('Completions API', () => {
    let testModelId: string
    let testPromptId: string

    beforeAll(async () => {
        // Create a test model
        const modelResponse = await fetch(`${API_BASE_URL}/models`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Model for Completions',
                providerId: 'openai',
                supportedFeatures: {
                    completion: true
                }
            })
        })
        const model = await modelResponse.json()
        testModelId = model.id

        // Create a test prompt
        const promptResponse = await fetch(`${API_BASE_URL}/prompts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Prompt for Completions',
                content: 'This is a test prompt for completions',
                modelId: testModelId,
                isActive: true
            })
        })
        const prompt = await promptResponse.json()
        testPromptId = prompt.id
    })

    describe('POST /api/completions', () => {
        it('should generate a completion', async () => {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    modelId: testModelId,
                    promptId: testPromptId,
                    prompt: 'This is a test completion request',
                    temperature: 0.7,
                    maxTokens: 100
                })
            })
            expect(response.ok).toBe(true)

            const completion = await response.json()
            expect(completion).toHaveProperty('text')
            if (completion.usage) {
                expect(completion.usage).toHaveProperty('promptTokens')
                expect(completion.usage).toHaveProperty('completionTokens')
                expect(completion.usage).toHaveProperty('totalTokens')
            }
        })

        it('should validate required fields', async () => {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            expect(response.ok).toBe(false)
            expect(response.status).toBe(400)
        })

        it('should validate model existence', async () => {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    modelId: 'non-existent-model',
                    promptId: testPromptId,
                    prompt: 'This is a test completion request'
                })
            })
            expect(response.ok).toBe(false)
            expect(response.status).toBe(404)
        })

        it('should validate prompt existence', async () => {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    modelId: testModelId,
                    promptId: 'non-existent-prompt',
                    prompt: 'This is a test completion request'
                })
            })
            expect(response.ok).toBe(false)
            expect(response.status).toBe(404)
        })

        it('should handle provider errors gracefully', async () => {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    modelId: testModelId,
                    promptId: testPromptId,
                    prompt: 'This is a test completion request',
                    temperature: 999 // Invalid temperature to trigger provider error
                })
            })
            expect(response.ok).toBe(false)
            expect(response.status).toBe(400)
        })
    })
}) 