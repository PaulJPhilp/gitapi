import type { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { app } from "../index";
import type { Model } from "../schemas/models";

describe("Provider Models Endpoint", () => {
    const testApp = app as unknown as Hono;

    describe("GET /providers/:providerId/models", () => {
        it("should return models for existing provider", async () => {
            const res = await testApp.request("/providers/openai/models");
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
            expect(body.every((model: Model) => model.providerId === "openai")).toBe(true);
        });

        it("should return empty array for provider with no models", async () => {
            const res = await testApp.request("/providers/empty-provider/models");
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not found");
        });

        it("should return 404 when provider does not exist", async () => {
            const res = await testApp.request("/providers/non-existent/models");
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not found");
        });

        it("should handle special characters in provider ID", async () => {
            const res = await testApp.request("/providers/provider@123!$/models");
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });

        it("should return correct models for each provider", async () => {
            // Test OpenAI models
            const openaiRes = await testApp.request("/providers/openai/models");
            expect(openaiRes.status).toBe(200);
            const openaiModels = (await openaiRes.json()) as Model[];
            expect(openaiModels.every((model: Model) => model.providerId === "openai")).toBe(true);
            expect(openaiModels.some((model: Model) => model.id === "gpt-4")).toBe(true);

            // Test Anthropic models
            const anthropicRes = await testApp.request("/providers/anthropic/models");
            expect(anthropicRes.status).toBe(200);
            const anthropicModels = (await anthropicRes.json()) as Model[];
            expect(anthropicModels.every((model: Model) => model.providerId === "anthropic")).toBe(true);
            expect(anthropicModels.some((model: Model) => model.id === "claude-3-opus")).toBe(true);

            // Test Facebook models
            const facebookRes = await testApp.request("/providers/facebook/models");
            expect(facebookRes.status).toBe(200);
            const facebookModels = (await facebookRes.json()) as Model[];
            expect(facebookModels.every((model: Model) => model.providerId === "facebook")).toBe(true);
            expect(facebookModels.some((model: Model) => model.id === "llama-3-1")).toBe(true);
            expect(facebookModels.some((model: Model) => model.id === "llama-3-0")).toBe(true);
        });
    });
}); 