import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { API_BASE_URL } from "../../../src/config/api";
import { createTestModel, deleteTestModel } from "../utils/test-helpers";

describe("Models API", () => {
    const createdModelIds: string[] = [];

    afterAll(async () => {
        // Clean up all models created during tests
        for (const modelId of createdModelIds) {
            await deleteTestModel(modelId);
        }
    });

    describe("GET /api/models", () => {
        it("should return an array of models", async () => {
            const response = await fetch(`${API_BASE_URL}/models`);
            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(data).toHaveProperty('models')
            expect(Array.isArray(data.models)).toBe(true);

            // Verify model structure
            if (data.models.length > 0) {
                const model = data.models[0];
                expect(model).toHaveProperty("id");
                expect(model).toHaveProperty("name");
                expect(model).toHaveProperty("providerId");
                expect(model).toHaveProperty("supportedFeatures");
            }
        });
    });

    describe("POST /api/models", () => {
        const testModel = {
            name: "Test Model",
            description: "A test model",
            providerId: "openai",
            modelFamily: "Test",
            isEnabled: true,
            contextWindow: 4096,
            maxTokens: 1024,
            inputPricePerToken: "0.01",
            outputPricePerToken: "0.02",
            releaseDate: new Date().toISOString(),
            supportedFeatures: {
                chat: true,
                completion: true,
                embedding: false,
                imageGeneration: false,
                imageAnalysis: false,
                functionCalling: false,
                streaming: true
            }
        };

        it("should create a new model", async () => {
            const model = await createTestModel({
                name: testModel.name,
                description: testModel.description,
                providerId: testModel.providerId,
                modelFamily: testModel.modelFamily,
                isEnabled: testModel.isEnabled,
                contextWindow: testModel.contextWindow,
                maxTokens: testModel.maxTokens,
                inputPricePerToken: testModel.inputPricePerToken,
                outputPricePerToken: testModel.outputPricePerToken,
                releaseDate: testModel.releaseDate,
                supportedFeatures: testModel.supportedFeatures
            });

            expect(model).toHaveProperty("id");
            expect(model.name).toBe(testModel.name);
            expect(model.providerId).toBe(testModel.providerId);
            createdModelIds.push(model.id);
        });

        it("should validate required fields", async () => {
            const response = await fetch(`${API_BASE_URL}/models`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            expect(response.ok).toBe(false);
            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/models/:id", () => {
        let testModelId: string;

        beforeAll(async () => {
            const model = await createTestModel({
                name: "Test Model for Get",
            });
            testModelId = model.id;
            createdModelIds.push(testModelId);
        });

        it("should return a specific model", async () => {
            const response = await fetch(`${API_BASE_URL}/models/${testModelId}`);
            expect(response.ok).toBe(true);

            const model = await response.json();
            expect(model.id).toBe(testModelId);
        });

        it("should return 404 for non-existent model", async () => {
            const response = await fetch(`${API_BASE_URL}/models/non-existent-id`);
            expect(response.ok).toBe(false);
            expect(response.status).toBe(404);
        });
    });
});
