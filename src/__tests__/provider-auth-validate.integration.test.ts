import type { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { app } from "../index";

describe("Provider Auth Validate Endpoint", () => {
    const testApp = app as unknown as Hono;

    describe("GET /providers/:providerId/auth/validate", () => {
        it("should validate correct API key", async () => {
            // First store the API key
            await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });

            // Then validate it
            const res = await testApp.request("/providers/openai/auth/validate", {
                headers: {
                    "x-api-key": "test-key",
                },
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({ isValid: true });
        });

        it("should invalidate incorrect API key", async () => {
            // First store the API key
            await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });

            // Then validate with wrong key
            const res = await testApp.request("/providers/openai/auth/validate", {
                headers: {
                    "x-api-key": "wrong-key",
                },
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({ isValid: false });
        });

        it("should return 404 when provider does not exist", async () => {
            const res = await testApp.request("/providers/non-existent/auth/validate", {
                headers: {
                    "x-api-key": "test-key",
                },
            });
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not found");
        });

        it("should return 403 when provider is disabled", async () => {
            const res = await testApp.request("/providers/facebook/auth/validate", {
                headers: {
                    "x-api-key": "test-key",
                },
            });
            expect(res.status).toBe(403);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not enabled");
        });

        it("should handle missing API key header", async () => {
            const res = await testApp.request("/providers/openai/auth/validate");
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("API key is required");
        });

        it("should handle empty API key header", async () => {
            const res = await testApp.request("/providers/openai/auth/validate", {
                headers: {
                    "x-api-key": "",
                },
            });
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("API key is required");
        });

        it("should handle special characters in provider ID", async () => {
            const res = await testApp.request("/providers/provider@123!$/auth/validate", {
                headers: {
                    "x-api-key": "test-key",
                },
            });
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });

        it("should handle case sensitivity in API keys", async () => {
            // Store API key with mixed case
            await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "Test-Key" }),
            });

            // Validate with different case
            const res = await testApp.request("/providers/openai/auth/validate", {
                headers: {
                    "x-api-key": "test-key",
                },
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({ isValid: false });
        });
    });
}); 