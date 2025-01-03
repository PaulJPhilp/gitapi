import type { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { app } from "../index";

describe("Provider Auth Endpoint", () => {
    const testApp = app as unknown as Hono;

    describe("POST /providers/:providerId/auth", () => {
        it("should store API key for valid provider", async () => {
            const res = await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({ success: true });
        });

        it("should return 404 when provider does not exist", async () => {
            const res = await testApp.request("/providers/non-existent/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not found");
        });

        it("should return 403 when provider is disabled", async () => {
            const res = await testApp.request("/providers/facebook/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });
            expect(res.status).toBe(403);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not enabled");
        });

        it("should handle missing API key", async () => {
            const res = await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("API key is required");
        });

        it("should handle empty API key", async () => {
            const res = await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "" }),
            });
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("API key is required");
        });

        it("should handle invalid JSON", async () => {
            const res = await testApp.request("/providers/openai/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "invalid-json",
            });
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });

        it("should handle special characters in provider ID", async () => {
            const res = await testApp.request("/providers/provider@123!$/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: "test-key" }),
            });
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });
    });
}); 