import type { ProviderApiKey } from "@/domain"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { client } from "../../db"
import { DatabaseError, EntityNotFoundError, ValidationError } from "../../errors"
import { providerApiKeyRepository } from "../../repositories"

vi.mock("../../db", () => ({
    client: {
        execute: vi.fn()
    }
}))

describe("providerApiKeyRepository", () => {
    const mockApiKey: ProviderApiKey = {
        id: "test-id",
        providerId: "provider-id",
        apiKey: "test-api-key",
        name: "Test API Key",
        expiresAt: new Date("2024-12-31T23:59:59.999Z"),
        lastUsedAt: new Date("2024-01-04T00:00:00.000Z"),
        isEnabled: true,
        createdAt: "2024-01-04T00:00:00.000Z",
        updatedAt: "2024-01-04T00:00:00.000Z"
    }

    const mockRow = {
        id: mockApiKey.id,
        provider_id: mockApiKey.providerId,
        api_key: mockApiKey.apiKey,
        name: mockApiKey.name,
        expires_at: mockApiKey.expiresAt?.toISOString(),
        last_used_at: mockApiKey.lastUsedAt?.toISOString(),
        is_enabled: mockApiKey.isEnabled,
        created_at: mockApiKey.createdAt,
        updated_at: mockApiKey.updatedAt
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe("findAll", () => {
        it("should return all API keys", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await providerApiKeyRepository.findAll()
            expect(result).toEqual([mockApiKey])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM provider_api_keys",
                args: []
            })
        })

        it("should return empty array when no API keys exist", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await providerApiKeyRepository.findAll()
            expect(result).toEqual([])
        })
    })

    describe("findById", () => {
        it("should return API key by id", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await providerApiKeyRepository.findById(mockApiKey.id)
            expect(result).toEqual(mockApiKey)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM provider_api_keys WHERE id = ?",
                args: [mockApiKey.id]
            })
        })

        it("should return null when API key not found", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await providerApiKeyRepository.findById("non-existent")
            expect(result).toBeNull()
        })
    })

    describe("create", () => {
        const createData = {
            providerId: mockApiKey.providerId,
            apiKey: mockApiKey.apiKey,
            name: mockApiKey.name,
            expiresAt: mockApiKey.expiresAt,
            isEnabled: mockApiKey.isEnabled
        }

        it("should create new API key", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            const result = await providerApiKeyRepository.create(createData)
            expect(result).toMatchObject(createData)
            expect(result.id).toBeDefined()
            expect(result.createdAt).toBeDefined()
            expect(result.updatedAt).toBeDefined()
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("INSERT INTO provider_api_keys"),
                args: expect.arrayContaining([
                    expect.any(String),
                    createData.providerId,
                    createData.apiKey,
                    createData.name,
                    createData.expiresAt,
                    null, // lastUsedAt
                    createData.isEnabled,
                    expect.any(String),
                    expect.any(String)
                ])
            }))
        })

        it("should throw ValidationError when data is invalid", async () => {
            const invalidData = { ...createData, apiKey: "" }
            await expect(providerApiKeyRepository.create(invalidData))
                .rejects
                .toThrow(ValidationError)
        })

        it("should throw DatabaseError on database failure", async () => {
            vi.mocked(client.execute).mockRejectedValueOnce(new Error("DB Error"))
            await expect(providerApiKeyRepository.create(createData))
                .rejects
                .toThrow(DatabaseError)
        })
    })

    describe("update", () => {
        const updateData = {
            name: "Updated Name",
            isEnabled: false
        }

        beforeEach(() => {
            // Mock findById for validation
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })
        })

        it("should update API key", async () => {
            vi.mocked(client.execute)
                .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // For update
                .mockResolvedValueOnce({ rows: [{ ...mockRow, ...updateData }], rowCount: 1 }) // For final select

            const result = await providerApiKeyRepository.update(mockApiKey.id, updateData)
            expect(result).toMatchObject(expect.objectContaining(updateData))
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("UPDATE provider_api_keys SET"),
                args: expect.arrayContaining([
                    updateData.name,
                    updateData.isEnabled,
                    expect.any(String),
                    mockApiKey.id
                ])
            }))
        })

        it("should throw EntityNotFoundError when API key not found", async () => {
            vi.mocked(client.execute).mockReset()
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            await expect(providerApiKeyRepository.update("non-existent", updateData))
                .rejects
                .toThrow(EntityNotFoundError)
        })
    })

    describe("findByProvider", () => {
        it("should return API keys by provider", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await providerApiKeyRepository.findByProvider(mockApiKey.providerId)
            expect(result).toEqual([mockApiKey])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM provider_api_keys WHERE provider_id = ?",
                args: [mockApiKey.providerId]
            })
        })
    })

    describe("findEnabled", () => {
        it("should return enabled API keys", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await providerApiKeyRepository.findEnabled()
            expect(result).toEqual([mockApiKey])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM provider_api_keys WHERE is_enabled = true",
                args: []
            })
        })
    })

    describe("updateLastUsed", () => {
        it("should update last used timestamp", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            await providerApiKeyRepository.updateLastUsed(mockApiKey.id)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "UPDATE provider_api_keys SET last_used_at = ?, updated_at = ? WHERE id = ?",
                args: expect.arrayContaining([
                    expect.any(String),
                    expect.any(String),
                    mockApiKey.id
                ])
            })
        })
    })
}) 