import type { Model, Prompt, Provider } from "@/domain/models"
import { describe, expect, it } from "vitest"
import { ValidationError } from "../errors"
import { validateModel, validatePrompt, validateProvider } from "../validation"

describe("DAL Validation", () => {
    describe("Model Validation", () => {
        it("should validate a valid model", () => {
            const model: Model = {
                id: "test-id",
                name: "GPT-4",
                description: "Test model",
                providerId: "openai",
                isEnabled: true,
                modelFamily: "gpt",
                contextWindow: 8192,
                maxTokens: 4096,
                inputPricePerToken: "0.00001",
                outputPricePerToken: "0.00002",
                releaseDate: "2023-01-01",
                type: "proprietary",
                reasoning: true,
                supportedFeatures: {
                    chat: true,
                    completion: true,
                    embedding: false,
                    imageGeneration: false,
                    imageAnalysis: false,
                    functionCalling: true,
                    streaming: true
                },
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validateModel(model)).not.toThrow()
        })

        it("should throw on invalid model", () => {
            const invalidModel = {
                id: "test-id",
                // Missing required fields
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validateModel(invalidModel as Model)).toThrow(ValidationError)
        })
    })

    describe("Provider Validation", () => {
        it("should validate a valid provider", () => {
            const provider: Provider = {
                id: "test-id",
                name: "OpenAI",
                description: "OpenAI API provider",
                website: "https://openai.com",
                apiKeyRequired: true,
                baseUrl: null,
                isEnabled: true,
                releaseDate: null,
                supportedFeatures: {
                    chat: true,
                    completion: true,
                    embedding: true,
                    imageGeneration: true,
                    imageAnalysis: false,
                    functionCalling: true,
                    streaming: true
                },
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validateProvider(provider)).not.toThrow()
        })

        it("should throw on invalid provider", () => {
            const invalidProvider = {
                id: "test-id",
                // Missing required fields
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validateProvider(invalidProvider as Provider)).toThrow(ValidationError)
        })
    })

    describe("Prompt Validation", () => {
        it("should validate a valid prompt", () => {
            const prompt: Prompt = {
                id: "test-id",
                name: "Test Prompt",
                content: "This is a test prompt",
                isActive: true,
                modelId: "model-id",
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validatePrompt(prompt)).not.toThrow()
        })

        it("should throw on invalid prompt", () => {
            const invalidPrompt = {
                id: "test-id",
                // Missing required fields
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2023-01-01T00:00:00Z"
            }

            expect(() => validatePrompt(invalidPrompt as Prompt)).toThrow(ValidationError)
        })
    })
}) 