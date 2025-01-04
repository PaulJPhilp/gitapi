import { describe, expect, test } from 'vitest'

interface TestCase {
    endpoint: string
    description: string
    validPayload: Record<string, unknown>
    requiredFields: string[]
}

const testCases: TestCase[] = [
    {
        endpoint: '/api/providers',
        description: 'Provider management endpoints',
        validPayload: {
            name: 'Test Provider',
            description: 'Test provider description',
            website: 'https://test.com',
            apiKeyRequired: true,
            baseUrl: null,
            isEnabled: true,
            releaseDate: null,
            supportedFeatures: {
                chat: true,
                completion: true,
                embedding: false,
                imageGeneration: false,
                imageAnalysis: false,
                functionCalling: false,
                streaming: true
            }
        },
        requiredFields: ['name', 'description', 'website', 'apiKeyRequired', 'isEnabled', 'supportedFeatures']
    },
    {
        endpoint: '/api/models',
        description: 'Model management endpoints',
        validPayload: {
            name: 'Test Model',
            description: 'Test model description',
            providerId: 'provider-id',
            isEnabled: true,
            modelFamily: 'gpt',
            contextWindow: 4096,
            maxTokens: 4096,
            inputPricePerToken: '0.0001',
            outputPricePerToken: '0.0002',
            releaseDate: null,
            supportedFeatures: {
                chat: true,
                completion: true,
                embedding: false,
                imageGeneration: false,
                imageAnalysis: false,
                functionCalling: false,
                streaming: true
            }
        },
        requiredFields: ['name', 'providerId', 'isEnabled', 'modelFamily', 'contextWindow', 'inputPricePerToken', 'outputPricePerToken', 'supportedFeatures']
    },
    {
        endpoint: '/api/prompts',
        description: 'Prompt management endpoints',
        validPayload: {
            name: 'Test Prompt',
            content: 'This is a test prompt content',
            isActive: true,
            modelId: 'model-id'
        },
        requiredFields: ['name', 'content', 'isActive', 'modelId']
    }
]

async function testEndpoint(url: string, method: string, body?: unknown) {
    const response = await fetch(`http://localhost:3000${url}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    })
    return {
        status: response.status,
        body: await response.json(),
    }
}

describe('API Endpoints', () => {
    for (const { endpoint, validPayload, requiredFields } of testCases) {
        describe(`${endpoint}`, () => {
            test('creates resource with valid payload', async () => {
                const response = await testEndpoint(endpoint, 'POST', validPayload)

                expect(response.status).toBe(201)
                expect(response.body).toHaveProperty('id')
            })

            for (const field of requiredFields) {
                test(`fails when ${field} is missing`, async () => {
                    const invalidPayload = { ...validPayload }
                    delete invalidPayload[field]

                    const response = await testEndpoint(endpoint, 'POST', invalidPayload)

                    expect(response.status).toBe(400)
                    expect(response.body).toHaveProperty('error')
                })
            }
        })
    }
}) 