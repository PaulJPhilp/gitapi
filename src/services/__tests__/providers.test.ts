import { describe, expect, it } from "vitest";
import { models } from "../../schemas/models";
import { InMemoryProviderService } from "../providers";
import { ProviderAuthError, ProviderNotEnabledError, ProviderNotFoundError } from "../providers/errors";

describe("ProviderService", () => {
    describe("getAllProviders", () => {
        it("should return all providers", async () => {
            const service = new InMemoryProviderService();
            const providers = await service.getAllProviders();
            expect(providers).toHaveLength(3);
            expect(providers[0].id).toBe("anthropic");
            expect(providers[1].id).toBe("openai");
            expect(providers[2].id).toBe("facebook");
        });
    });

    describe("getEnabledProviders", () => {
        it("should return only enabled providers", async () => {
            const service = new InMemoryProviderService();
            const providers = await service.getEnabledProviders();
            expect(providers.every(p => p.isEnabled)).toBe(true);
            expect(providers.find(p => p.id === "facebook")).toBeUndefined();
        });
    });

    describe("getProviderById", () => {
        it("should return provider when exists", async () => {
            const service = new InMemoryProviderService();
            const provider = await service.getProviderById("openai");
            expect(provider.id).toBe("openai");
            expect(provider.name).toBe("OpenAI");
        });

        it("should throw ProviderNotFoundError when provider does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.getProviderById("non-existent");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });
    });

    describe("validateApiKey", () => {
        it("should return true when API key matches", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "test-key" });
            const isValid = await service.validateApiKey({ providerId: "openai", apiKey: "test-key" });
            expect(isValid).toBe(true);
        });

        it("should return false when API key does not match", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "test-key" });
            const isValid = await service.validateApiKey({ providerId: "openai", apiKey: "wrong-key" });
            expect(isValid).toBe(false);
        });

        it("should be case sensitive when validating API keys", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "Test-Key" });
            const isValid = await service.validateApiKey({ providerId: "openai", apiKey: "test-key" });
            expect(isValid).toBe(false);
        });

        it("should validate API keys with special characters", async () => {
            const service = new InMemoryProviderService();
            const complexKey = "sk-1234!@#$%^&*()_+-=[]{}|;:,.<>?";
            await service.setApiKey({ providerId: "openai", apiKey: complexKey });
            const isValid = await service.validateApiKey({ providerId: "openai", apiKey: complexKey });
            expect(isValid).toBe(true);
        });

        it("should throw ProviderNotFoundError when provider does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.validateApiKey({ providerId: "non-existent", apiKey: "test-key" });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });

        it("should throw ProviderNotEnabledError when provider is disabled", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.validateApiKey({ providerId: "facebook", apiKey: "test-key" });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotEnabledError);
                expect(error.message).toContain("not enabled");
            }
        });

        it("should throw ProviderAuthError when no API key is stored", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.validateApiKey({ providerId: "openai", apiKey: "test-key" });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderAuthError);
                expect(error.message).toContain("No API key found");
            }
        });
    });

    describe("setApiKey", () => {
        it("should store API key for provider", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "test-key" });
            const apiKey = await service.getApiKey("openai");
            expect(apiKey).toBe("test-key");
        });

        it("should throw ProviderNotFoundError when provider does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.setApiKey({ providerId: "non-existent", apiKey: "test-key" });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });

        it("should throw ProviderNotEnabledError when provider is disabled", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.setApiKey({ providerId: "facebook", apiKey: "test-key" });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotEnabledError);
                expect(error.message).toContain("not enabled");
            }
        });

        it("should update existing API key", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "old-key" });
            await service.setApiKey({ providerId: "openai", apiKey: "new-key" });
            const apiKey = await service.getApiKey("openai");
            expect(apiKey).toBe("new-key");
        });

        it("should handle empty API key", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "" });
            try {
                await service.getApiKey("openai");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderAuthError);
                expect(error.message).toContain("No API key found");
            }
        });

        it("should handle API keys with whitespace", async () => {
            const service = new InMemoryProviderService();
            const keyWithWhitespace = "  test-key  ";
            await service.setApiKey({ providerId: "openai", apiKey: keyWithWhitespace });
            const apiKey = await service.getApiKey("openai");
            expect(apiKey).toBe(keyWithWhitespace.trim());
        });
    });

    describe("getApiKey", () => {
        it("should return stored API key", async () => {
            const service = new InMemoryProviderService();
            await service.setApiKey({ providerId: "openai", apiKey: "test-key" });
            const apiKey = await service.getApiKey("openai");
            expect(apiKey).toBe("test-key");
        });

        it("should throw ProviderNotFoundError when provider does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.getApiKey("non-existent");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });

        it("should throw ProviderAuthError when no API key is stored", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.getApiKey("openai");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderAuthError);
                expect(error.message).toContain("No API key found");
            }
        });
    });

    describe("getAllModels", () => {
        it("should return all models", async () => {
            const service = new InMemoryProviderService();
            const result = await service.getAllModels();
            expect(result).toEqual(models);
        });
    });

    describe("getEnabledModels", () => {
        it("should return only enabled models", async () => {
            const service = new InMemoryProviderService();
            const result = await service.getEnabledModels();
            expect(result.every(model => model.isEnabled)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(models.length);
        });
    });

    describe("getModelById", () => {
        it("should return model when exists", async () => {
            const service = new InMemoryProviderService();
            const existingModel = models[0];
            const result = await service.getModelById(existingModel.id);
            expect(result).toEqual(existingModel);
        });

        it("should throw ProviderNotFoundError when model does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.getModelById("non-existent");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });
    });

    describe("getModelsByProvider", () => {
        it("should return models for existing provider", async () => {
            const service = new InMemoryProviderService();
            const result = await service.getModelsByProvider("openai");
            expect(result.every(model => model.providerId === "openai")).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it("should return correct models for each provider", async () => {
            const service = new InMemoryProviderService();

            // Test OpenAI models
            const openaiModels = await service.getModelsByProvider("openai");
            expect(openaiModels.every(model => model.providerId === "openai")).toBe(true);
            expect(openaiModels.some(model => model.id === "gpt-4")).toBe(true);

            // Test Anthropic models
            const anthropicModels = await service.getModelsByProvider("anthropic");
            expect(anthropicModels.every(model => model.providerId === "anthropic")).toBe(true);
            expect(anthropicModels.some(model => model.id === "claude-3-opus")).toBe(true);

            // Test Facebook models
            const facebookModels = await service.getModelsByProvider("facebook");
            expect(facebookModels.every(model => model.providerId === "facebook")).toBe(true);
            expect(facebookModels.some(model => model.id === "llama-3-1")).toBe(true);
            expect(facebookModels.some(model => model.id === "llama-3-0")).toBe(true);
        });

        it("should throw ProviderNotFoundError when provider does not exist", async () => {
            const service = new InMemoryProviderService();
            try {
                await service.getModelsByProvider("non-existent");
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ProviderNotFoundError);
                expect(error.message).toContain("non-existent");
            }
        });
    });
}); 