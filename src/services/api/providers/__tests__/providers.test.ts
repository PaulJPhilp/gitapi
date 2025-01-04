import { afterEach, beforeEach, describe, vi } from "vitest";
import type { Model } from "../../../schemas/models";

const mockModel: Model = {
    id: "test-model",
    name: "Test Model",
    providerId: "test-provider",
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
    },
    defaultTemperature: 0.7,
    minTemperature: 0,
    maxTemperature: 1,
};

const mockResponse = {
    text: "test response",
    usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
    },
};

describe("Provider Implementations", () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Anthropic", () => {
        const anthropicModel = { ...mockModel, providerId: "anthropic" };

        /***
        it("should make correct API call", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        content: [{ text: mockResponse.text }],
                        usage: {
                            input_tokens: mockResponse.usage.promptTokens,
                            output_tokens: mockResponse.usage.completionTokens,
                        },
                    }),
            });
            global.fetch = mockFetch;

            const result = await Effect.runPromise(
                completeWithAnthropic(
                    "test prompt",
                    anthropicModel,
                    "test-api-key",
                    0.5,
                    1000,
                ),
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.anthropic.com/v1/messages",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": "test-api-key",
                        "anthropic-version": "2024-01-01",
                    },
                    body: expect.stringContaining("test prompt"),
                }),
            );
            expect(result).toEqual(mockResponse);
        });
        ***/

        /***
        it("should handle API errors", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: "Bad Request",
            });

            const result = await Effect.runPromiseExit(
                completeWithAnthropic("test prompt", anthropicModel, "test-api-key"),
            );

            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure") {
                expect(result.cause._tag).toBe("NetworkError");
            }
        });
        ***/
    });

    describe("OpenAI", () => {
        const openaiModel = { ...mockModel, providerId: "openai" };

        /***
        it("should make correct API call", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        choices: [{ message: { content: mockResponse.text } }],
                        usage: {
                            prompt_tokens: mockResponse.usage.promptTokens,
                            completion_tokens: mockResponse.usage.completionTokens,
                            total_tokens: mockResponse.usage.totalTokens,
                        },
                    }),
            });
            global.fetch = mockFetch;

            const result = await Effect.runPromise(
                completeWithOpenAI(
                    "test prompt",
                    openaiModel,
                    "test-api-key",
                    0.5,
                    1000,
                ),
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.openai.com/v1/chat/completions",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer test-api-key",
                    },
                    body: expect.stringContaining("test prompt"),
                }),
            );
            expect(result).toEqual(mockResponse);
        });
        ***/

        /***
        it("should handle API errors", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: "Bad Request",
            });

            const result = await Effect.runPromiseExit(
                completeWithOpenAI("test prompt", openaiModel, "test-api-key"),
            );

            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure") {
                expect(result.cause._tag).toBe("NetworkError");
            }
        });
        ***/
    });

    describe("completeWithProvider", () => {
        /***
        it("should route to correct provider", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        choices: [{ message: { content: mockResponse.text } }],
                        usage: {
                            prompt_tokens: mockResponse.usage.promptTokens,
                            completion_tokens: mockResponse.usage.completionTokens,
                            total_tokens: mockResponse.usage.totalTokens,
                        },
                    }),
            });
            global.fetch = mockFetch;

            await Effect.runPromise(
                completeWithProvider(
                    "test prompt",
                    { ...mockModel, providerId: "openai" },
                    "test-api-key",
                ),
            );

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("openai"),
                expect.any(Object),
            );
        });
        ***/

        /***
        it("should handle unsupported provider", async () => {
            const result = await Effect.runPromiseExit(
                completeWithProvider(
                    "test prompt",
                    { ...mockModel, providerId: "unsupported" },
                    "test-api-key",
                ),
            );

            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure") {
                const error = result.cause as unknown as NetworkError;
                expect(error._tag).toBe("NetworkError");
                expect(error.message).toContain("not supported");
            }
        });
        ***/
    });
});
