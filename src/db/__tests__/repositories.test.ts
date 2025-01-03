import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { client } from "../index"
import { DefaultModelRepository } from "../repositories/model"
import { DefaultPromptRepository } from "../repositories/prompt"
import { DefaultPromptRunRepository } from "../repositories/prompt-run"
import { DefaultProviderRepository } from "../repositories/provider"

// Test data
const testProvider = {
    name: "Test Provider",
    description: "Test provider description",
    website: "https://test.com",
    apiKeyRequired: true,
    isEnabled: true,
    releaseDate: "2024-01-01",
    supportedFeatures: {
        chat: true,
        completion: true,
        embedding: false,
        imageGeneration: false,
        imageAnalysis: false,
        functionCalling: true,
        streaming: true
    }
}

const testModel = {
    name: "Test Model",
    providerId: "", // Will be set after provider creation
    isEnabled: true,
    contextWindow: 4096,
    maxTokens: 2048,
    inputPricePerToken: 0.001,
    outputPricePerToken: 0.002,
    supportedFeatures: {
        chat: true,
        completion: true,
        embedding: false,
        imageGeneration: false,
        imageAnalysis: false,
        functionCalling: true,
        streaming: true
    },
    modelFamily: "Test Family",
    releaseDate: "2024-01-01"
}

const testPrompt = {
    name: "Test Prompt",
    content: "This is a test prompt",
    isActive: true,
    modelId: "" // Will be set after model creation
}

const testPromptRun = {
    promptId: "", // Will be set after prompt creation
    modelId: "", // Will be set after model creation
    providerId: "", // Will be set after provider creation
    content: "Test content",
    completion: "Test completion",
    usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
    }
}

describe("Repository Tests", () => {
    // Store created IDs for cleanup
    let providerId: string
    let modelId: string
    let promptId: string
    let promptRunId: string

    // Initialize repositories
    const providerRepository = new DefaultProviderRepository()
    const modelRepository = new DefaultModelRepository()
    const promptRepository = new DefaultPromptRepository()
    const promptRunRepository = new DefaultPromptRunRepository()

    // Initialize database before tests
    beforeAll(async () => {
        // TODO: Replace with direct SQLite migration
        const migrations = await import("../migrations")
        await migrations.up(client)
    })

    // Cleanup after all tests
    afterAll(async () => {
        // Delete test data in reverse order of creation
        if (promptRunId) {
            await promptRunRepository.delete(promptRunId)
        }
        if (promptId) {
            await promptRepository.delete(promptId)
        }
        if (modelId) {
            await modelRepository.delete(modelId)
        }
        if (providerId) {
            await providerRepository.delete(providerId)
        }
        await client.close()
    })

    describe("Provider Repository", () => {
        test("should create a provider", async () => {
            const provider = await providerRepository.create(testProvider)
            expect(provider).toBeDefined()
            expect(provider.id).toBeDefined()
            expect(provider.name).toBe(testProvider.name)
            providerId = provider.id
            testModel.providerId = providerId // Set for model tests
            testPromptRun.providerId = providerId // Set for prompt run tests
        })

        test("should find a provider by ID", async () => {
            const provider = await providerRepository.findById(providerId)
            expect(provider).toBeDefined()
            expect(provider?.id).toBe(providerId)
        })

        test("should update a provider", async () => {
            const updatedName = "Updated Provider"
            const provider = await providerRepository.update(providerId, { name: updatedName })
            expect(provider.name).toBe(updatedName)
        })

        test("should find enabled providers", async () => {
            const providers = await providerRepository.findEnabled()
            expect(providers.length).toBeGreaterThan(0)
            expect(providers.some(p => p.id === providerId)).toBe(true)
        })
    })

    describe("Model Repository", () => {
        test("should create a model", async () => {
            const model = await modelRepository.create(testModel)
            expect(model).toBeDefined()
            expect(model.id).toBeDefined()
            expect(model.name).toBe(testModel.name)
            modelId = model.id
            testPrompt.modelId = modelId // Set for prompt tests
            testPromptRun.modelId = modelId // Set for prompt run tests
        })

        test("should find a model by ID", async () => {
            const model = await modelRepository.findById(modelId)
            expect(model).toBeDefined()
            expect(model?.id).toBe(modelId)
        })

        test("should find models by provider", async () => {
            const models = await modelRepository.findByProvider(providerId)
            expect(models.length).toBeGreaterThan(0)
            expect(models[0].providerId).toBe(providerId)
        })

        test("should find enabled models", async () => {
            const models = await modelRepository.findEnabled()
            expect(models.length).toBeGreaterThan(0)
            expect(models.some(m => m.id === modelId)).toBe(true)
        })
    })

    describe("Prompt Repository", () => {
        test("should create a prompt", async () => {
            const prompt = await promptRepository.create(testPrompt)
            expect(prompt).toBeDefined()
            expect(prompt.id).toBeDefined()
            expect(prompt.name).toBe(testPrompt.name)
            promptId = prompt.id
            testPromptRun.promptId = promptId // Set for prompt run tests
        })

        test("should find a prompt by ID", async () => {
            const prompt = await promptRepository.findById(promptId)
            expect(prompt).toBeDefined()
            expect(prompt?.id).toBe(promptId)
        })

        test("should find prompts by model", async () => {
            const prompts = await promptRepository.findByModel(modelId)
            expect(prompts.length).toBeGreaterThan(0)
            expect(prompts[0].modelId).toBe(modelId)
        })

        test("should find active prompts", async () => {
            const prompts = await promptRepository.findActive()
            expect(prompts.length).toBeGreaterThan(0)
            expect(prompts.some(p => p.id === promptId)).toBe(true)
        })
    })

    describe("PromptRun Repository", () => {
        test("should create a prompt run", async () => {
            const promptRun = await promptRunRepository.create(testPromptRun)
            expect(promptRun).toBeDefined()
            expect(promptRun.id).toBeDefined()
            expect(promptRun.content).toBe(testPromptRun.content)
            promptRunId = promptRun.id
        })

        test("should find a prompt run by ID", async () => {
            const promptRun = await promptRunRepository.findById(promptRunId)
            expect(promptRun).toBeDefined()
            expect(promptRun?.id).toBe(promptRunId)
        })

        test("should find prompt runs by prompt", async () => {
            const promptRuns = await promptRunRepository.findByPrompt(promptId)
            expect(promptRuns.length).toBeGreaterThan(0)
            expect(promptRuns[0].promptId).toBe(promptId)
        })

        test("should find prompt runs by model", async () => {
            const promptRuns = await promptRunRepository.findByModel(modelId)
            expect(promptRuns.length).toBeGreaterThan(0)
            expect(promptRuns[0].modelId).toBe(modelId)
        })

        test("should find prompt runs by provider", async () => {
            const promptRuns = await promptRunRepository.findByProvider(providerId)
            expect(promptRuns.length).toBeGreaterThan(0)
            expect(promptRuns[0].providerId).toBe(providerId)
        })

        test("should find recent prompt runs", async () => {
            const promptRuns = await promptRunRepository.findRecent(10)
            expect(promptRuns.length).toBeGreaterThan(0)
            expect(promptRuns[0].id).toBe(promptRunId)
        })
    })
}) 