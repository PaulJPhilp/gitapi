import express from "express"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Model } from "../schemas/models"
import { DefaultCompletionsService } from "../services/completions"

const mockModel: Model = {
    id: "test-model",
    name: "Test Model",
    providerId: "openai",
    isEnabled: true,
    contextWindow: 4096,
    maxTokens: 2048,
    inputPricePerToken: 0.01,
    outputPricePerToken: 0.02,
    supportedFeatures: {
        chat: true,
        completion: true,
        embedding: false,
        imageGeneration: false,
        imageAnalysis: false,
        functionCalling: false,
        streaming: false
    }
}

const mockProviderService = {
    _tag: "ProviderService",
    getAllProviders: async () => [],
    getEnabledProviders: async () => [],
    getProviderById: async () => ({ id: "test-provider", name: "test", apiKeyRequired: true, isEnabled: true }),
    validateApiKey: async () => true,
    setApiKey: async () => { },
    getApiKey: async () => "test-api-key",
    getAllModels: async () => [mockModel],
    getEnabledModels: async () => [mockModel],
    getModelById: vi.fn(async (id: string) => mockModel),
    getModelsByProvider: async () => [mockModel]
}

describe("Completions Endpoint", () => {
    let app: express.Express

    beforeEach(() => {
        app = express()
        app.use(express.json())

        // Mock fetch for provider API calls
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: "test response" } }],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30
                }
            })
        })

        // Set up the endpoint
        app.post("/completions", async (req, res) => {
            try {
                const providerService = mockProviderService
                const completionsService = new DefaultCompletionsService(providerService)
                const result = await completionsService.complete(req.body)
                    .then(value => ({ _tag: "Success", value }))
                    .catch(error => ({ _tag: "Failure", cause: error }))

                if (result._tag === "Success") {
                    res.status(200).json(result.value)
                } else {
                    const error = result.cause
                    switch (error._tag) {
                        case "ProviderNotFoundError":
                            res.status(404).json({ error: error.message })
                            break
                        case "ProviderAuthError":
                            res.status(401).json({ error: error.message })
                            break
                        case "ProviderNotEnabledError":
                            res.status(403).json({ error: error.message })
                            break
                        case "ValidationError":
                            res.status(400).json({ error: error.message })
                            break
                        case "NetworkError":
                            res.status(500).json({ error: error.message })
                            break
                        default:
                            res.status(500).json({ error: "Internal server error" })
                    }
                }
            } catch (error) {
                res.status(500).json({ error: "Internal server error" })
            }
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it("should handle valid request", async () => {
        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model",
                prompt: "test prompt"
            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            text: "test response",
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            }
        })
    })

    /***
    it("should handle invalid model ID", async () => {
        const mockProviderServiceInvalidModel = {
            ...mockProviderService,
            getModelById: async () => {
                throw new ProviderNotFoundError({
                    message: "Model not found",
                    providerId: "unknown"
                })
            }
        }

        app.post("/completions", async (req, res) => {
            try {
                const providerService = mockProviderServiceInvalidModel
                const completionsService = new DefaultCompletionsService(providerService)
                const result = await completionsService.complete(req.body)
                    .then(value => ({ _tag: "Success", value }))
                    .catch(error => ({ _tag: "Failure", cause: error }))

                if (result._tag === "Success") {
                    res.status(200).json(result.value)
                } else {
                    const error = result.cause
                    switch (error._tag) {
                        case "ProviderNotFoundError":
                            res.status(404).json({ error: error.message })
                            break
                        case "ProviderAuthError":
                            res.status(401).json({ error: error.message })
                            break
                        case "ProviderNotEnabledError":
                            res.status(403).json({ error: error.message })
                            break
                        case "ValidationError":
                            res.status(400).json({ error: error.message })
                            break
                        case "NetworkError":
                            res.status(500).json({ error: error.message })
                            break
                        default:
                            res.status(500).json({ error: "Internal server error" })
                    }
                }
            } catch (error) {
                res.status(500).json({ error: "Internal server error" })
            }
        })

        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "invalid-model",
                prompt: "test prompt"
            })

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty("error")
    })
    ***/

    /***
    it("should handle missing prompt", async () => {
        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model"
            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error")
    })
    ***/

    /***
    it("should handle invalid temperature", async () => {
        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model",
                prompt: "test prompt",
                temperature: 2.0
            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toContain("temperature")
    })
    ***/

    /***
    it("should handle invalid maxTokens", async () => {
        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model",
                prompt: "test prompt",
                maxTokens: 10000
            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toContain("maxTokens")
    })
    ***/

    /***
    it("should handle provider API errors", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            statusText: "Internal Server Error"
        })

        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model",
                prompt: "test prompt"
            })

        expect(response.status).toBe(500)
        expect(response.body).toHaveProperty("error")
    })
    ***/

    /***
    it("should handle missing API key", async () => {
        const mockProviderServiceNoKey = {
            ...mockProviderService,
            getApiKey: async () => {
                throw new ProviderAuthError({
                    message: "No API key",
                    providerId: "test-provider"
                })
            }
        }

        app.post("/completions", async (req, res) => {
            try {
                const providerService = mockProviderServiceNoKey
                const completionsService = new DefaultCompletionsService(providerService)
                const result = await completionsService.complete(req.body)
                    .then(value => ({ _tag: "Success", value }))
                    .catch(error => ({ _tag: "Failure", cause: error }))

                if (result._tag === "Success") {
                    res.status(200).json(result.value)
                } else {
                    const error = result.cause
                    switch (error._tag) {
                        case "ProviderNotFoundError":
                            res.status(404).json({ error: error.message })
                            break
                        case "ProviderAuthError":
                            res.status(401).json({ error: error.message })
                            break
                        case "ProviderNotEnabledError":
                            res.status(403).json({ error: error.message })
                            break
                        case "ValidationError":
                            res.status(400).json({ error: error.message })
                            break
                        case "NetworkError":
                            res.status(500).json({ error: error.message })
                            break
                        default:
                            res.status(500).json({ error: "Internal server error" })
                    }
                }
            } catch (error) {
                res.status(500).json({ error: "Internal server error" })
            }
        })

        const response = await request(app)
            .post("/completions")
            .send({
                modelId: "test-model",
                prompt: "test prompt"
            })

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("No API key")
    })
    ***/
}) 