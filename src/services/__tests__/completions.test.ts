import { describe, expect, it, vi } from "vitest";
import { ProviderAuthError, ProviderNotFoundError } from "../../errors";
import type { Model } from "../../schemas/models";
import { DefaultCompletionsService } from "../completions";
import type { ProviderService } from "../providers";
import * as providers from "../providers";

// Mock the completeWithProvider function
vi.spyOn(providers, "completeWithProvider").mockImplementation(async () => ({
    text: "test completion",
    usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
    },
}));

describe("CompletionsService", () => {
    const mockModel: Model = {
        id: "existing-model",
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
            streaming: false,
        }
    };

    const mockProviderService: ProviderService = {
        _tag: "ProviderService",
        getAllProviders: async () => [],
        getEnabledProviders: async () => [],
        getProviderById: async () => ({ id: "openai", name: "openai", apiKeyRequired: true, isEnabled: true }),
        validateApiKey: async () => true,
        setApiKey: async () => { },
        getApiKey: async () => "test-api-key",
        getAllModels: async () => [mockModel],
        getEnabledModels: async () => [mockModel],
        getModelById: vi.fn().mockImplementation(async (id: string) => {
            if (id === "existing-model") {
                return mockModel;
            }
            throw new ProviderNotFoundError({
                message: `Model ${id} not found`,
                providerId: "openai"
            });
        }),
        getModelsByProvider: async () => [mockModel]
    };

    describe("complete", () => {
        it("should validate that the model exists", async () => {
            const service = new DefaultCompletionsService({
                ...mockProviderService,
                getModelById: async () => {
                    throw new ProviderNotFoundError({
                        message: "Model not found",
                        providerId: "openai"
                    });
                }
            });

            const error = await service.complete({
                modelId: "non-existent-model",
                prompt: "test prompt"
            }).catch(e => e);

            expect(error.message).toBe("Model not found");
        });

        it("should validate model is enabled", async () => {
            const service = new DefaultCompletionsService({
                ...mockProviderService,
                getModelById: async () => ({ ...mockModel, isEnabled: false })
            });

            const error = await service.complete({
                modelId: "disabled-model",
                prompt: "test prompt"
            }).catch(e => e);

            expect(error.message).toContain("not enabled");
        });

        it("should validate model supports completions", async () => {
            const service = new DefaultCompletionsService({
                ...mockProviderService,
                getModelById: async () => ({
                    ...mockModel,
                    supportedFeatures: { ...mockModel.supportedFeatures, completion: false }
                })
            });

            const error = await service.complete({
                modelId: "no-completion-model",
                prompt: "test prompt"
            }).catch(e => e);

            expect(error.message).toContain("does not support completions");
        });

        it("should validate temperature range", async () => {
            const service = new DefaultCompletionsService(mockProviderService);

            const error = await service.complete({
                modelId: "existing-model",
                prompt: "test prompt",
                temperature: 2.0
            }).catch(e => e);

            expect(error.message).toContain("Temperature must be between");
        });

        it("should validate maxTokens", async () => {
            const service = new DefaultCompletionsService(mockProviderService);

            const error = await service.complete({
                modelId: "existing-model",
                prompt: "test prompt",
                maxTokens: 5000
            }).catch(e => e);

            expect(error.message).toContain("maxTokens cannot exceed");
        });

        it("should validate API key", async () => {
            const service = new DefaultCompletionsService({
                ...mockProviderService,
                getApiKey: async () => {
                    throw new ProviderAuthError({
                        message: "No API key",
                        providerId: "openai"
                    });
                }
            });

            const error = await service.complete({
                modelId: "existing-model",
                prompt: "test prompt"
            }).catch(e => e);

            expect(error.message).toBe("No API key");
        });

        it("should use default values when optional parameters are not provided", async () => {
            const service = new DefaultCompletionsService(mockProviderService);

            const result = await service.complete({
                modelId: "existing-model",
                prompt: "test prompt"
            });

            expect(result).toEqual({
                text: "test completion",
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30,
                }
            });
        });

        it("should use provided values when optional parameters are specified", async () => {
            const service = new DefaultCompletionsService(mockProviderService);

            const result = await service.complete({
                modelId: "existing-model",
                prompt: "test prompt",
                temperature: 0.5,
                maxTokens: 1000
            });

            expect(result).toEqual({
                text: "test completion",
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30,
                }
            });
        });
    });
});
