import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { app } from '../../server';

interface TestCase {
    endpoint: string
    description: string
    validPayload: Record<string, unknown>
    requiredFields: string[]
}

const testCases: TestCase[] = [
    {
        endpoint: '/providers',
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
        endpoint: '/models',
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
        endpoint: '/prompts',
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

describe('API Endpoints', () => {
    for (const { endpoint, validPayload, requiredFields } of testCases) {
        describe(`${endpoint}`, () => {
            test('creates resource with valid payload', async () => {
                const response = await request(app)
                    .post(endpoint)
                    .send(validPayload)

                expect(response.status).toBe(201)
                expect(response.body).toHaveProperty('id')
            })

            for (const field of requiredFields) {
                test(`fails when ${field} is missing`, async () => {
                    const invalidPayload = { ...validPayload }
                    delete invalidPayload[field]

                    const response = await request(app)
                        .post(endpoint)
                        .send(invalidPayload)

                    expect(response.status).toBe(400)
                    expect(response.body).toHaveProperty('error')
                })
            }
        })
    }
}) 