import { API_BASE_URL } from "@/src/config/api";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    createTestModel,
    createTestPrompt,
    deleteTestModel,
    deleteTestPrompt
} from '../utils/test-helpers';

describe("Prompts API", () => {
    let testModelId: string;
    const createdPromptIds: string[] = [];

    beforeAll(async () => {
        const model = await createTestModel({
            name: 'Test Model for Prompts'
        })
        testModelId = model.id
    });

    afterAll(async () => {
        // Clean up all prompts created during tests
        for (const promptId of createdPromptIds) {
            await deleteTestPrompt(promptId)
        }

        // Clean up the test model
        await deleteTestModel(testModelId)
    });

    describe("GET /api/prompts", () => {
        it("should return an array of prompts", async () => {
            const response = await fetch(`${API_BASE_URL}/prompts`);
            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);

            // Verify prompt structure
            if (data.length > 0) {
                const prompt = data[0];
                expect(prompt).toHaveProperty("id");
                expect(prompt).toHaveProperty("name");
                expect(prompt).toHaveProperty("content");
                expect(prompt).toHaveProperty("modelId");
            }
        });
    });

    describe("POST /api/prompts", () => {
        const testPrompt = {
            name: "Test Prompt",
            content: "This is a test prompt",
            modelId: "", // Will be set in beforeAll
            isActive: true,
            templateId: "test-template",
            lastMigrationCheck: new Date()
        };

        beforeAll(() => {
            testPrompt.modelId = testModelId;
        });

        it("should create a new prompt", async () => {
            const prompt = await createTestPrompt({
                name: testPrompt.name,
                content: testPrompt.content,
                modelId: testPrompt.modelId,
                isActive: testPrompt.isActive,
                templateId: testPrompt.templateId,
                lastMigrationCheck: testPrompt.lastMigrationCheck
            });

            expect(prompt).toHaveProperty('id')
            expect(prompt.name).toBe(testPrompt.name)
            expect(prompt.content).toBe(testPrompt.content)
            expect(prompt.modelId).toBe(testPrompt.modelId)
            expect(prompt.templateId).toBe(testPrompt.templateId)
            expect(prompt.lastMigrationCheck).toBeDefined()
            createdPromptIds.push(prompt.id)
        });

        it("should validate required fields", async () => {
            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            expect(response.ok).toBe(false);
            expect(response.status).toBe(400);
        });

        it("should validate model existence", async () => {
            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...testPrompt,
                    modelId: "non-existent-model",
                }),
            });
            expect(response.ok).toBe(false);
            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/prompts/:id", () => {
        let testPromptId: string;

        beforeAll(async () => {
            // Create a test prompt to fetch
            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "Test Prompt for Get",
                    content: "This is a test prompt for get",
                    modelId: testModelId,
                    isActive: true,
                    templateId: "test-template-get",
                    lastMigrationCheck: new Date()
                }),
            });
            const prompt = await response.json();
            testPromptId = prompt.id;
            createdPromptIds.push(testPromptId);
        });

        it("should return a specific prompt", async () => {
            const response = await fetch(`${API_BASE_URL}/prompts/${testPromptId}`);
            expect(response.ok).toBe(true);

            const prompt = await response.json();
            expect(prompt.id).toBe(testPromptId);
        });

        it("should return 404 for non-existent prompt", async () => {
            const response = await fetch(`${API_BASE_URL}/prompts/non-existent-id`);
            expect(response.ok).toBe(false);
            expect(response.status).toBe(404);
        });
    });
});
