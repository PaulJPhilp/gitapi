import type { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { app } from "../index";
import { models } from "../schemas/models";

describe("Models Endpoint", () => {
    const testApp = app as unknown as Hono;

    describe("GET /models/:modelId", () => {
        it("should return model when it exists", async () => {
            const existingModel = models[0];
            const res = await testApp.request(`/models/${existingModel.id}`);
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual(existingModel);
        });

        it("should return 404 when model does not exist", async () => {
            const res = await testApp.request("/models/non-existent-model");
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
            expect(body.error).toContain("not found");
        });

        it("should handle special characters in model ID", async () => {
            const res = await testApp.request("/models/model@123!$");
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });
    });
});
