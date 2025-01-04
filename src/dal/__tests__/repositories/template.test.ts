import type { Template } from "@/domain"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { client } from "../../db"
import { DatabaseError, EntityNotFoundError, ValidationError } from "../../errors"
import { templateRepository } from "../../repositories"

vi.mock("../../db", () => ({
    client: {
        execute: vi.fn()
    }
}))

describe("templateRepository", () => {
    const mockTemplate: Template = {
        id: "test-id",
        name: "Test Template",
        description: "Test Description",
        version: "1.0.0",
        content: "Test content",
        parameters: {},
        isActive: true,
        createdAt: "2024-01-04T00:00:00.000Z",
        updatedAt: "2024-01-04T00:00:00.000Z"
    }

    const mockRow = {
        id: mockTemplate.id,
        name: mockTemplate.name,
        description: mockTemplate.description,
        version: mockTemplate.version,
        content: mockTemplate.content,
        parameters: JSON.stringify(mockTemplate.parameters),
        is_active: mockTemplate.isActive,
        created_at: mockTemplate.createdAt,
        updated_at: mockTemplate.updatedAt
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe("findAll", () => {
        it("should return all templates", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await templateRepository.findAll()
            expect(result).toEqual([mockTemplate])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM templates",
                args: []
            })
        })

        it("should return empty array when no templates exist", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await templateRepository.findAll()
            expect(result).toEqual([])
        })
    })

    describe("findById", () => {
        it("should return template by id", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await templateRepository.findById(mockTemplate.id)
            expect(result).toEqual(mockTemplate)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM templates WHERE id = ?",
                args: [mockTemplate.id]
            })
        })

        it("should return null when template not found", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await templateRepository.findById("non-existent")
            expect(result).toBeNull()
        })
    })

    describe("create", () => {
        const createData = {
            name: mockTemplate.name,
            description: mockTemplate.description,
            version: mockTemplate.version,
            content: mockTemplate.content,
            parameters: mockTemplate.parameters,
            isActive: mockTemplate.isActive
        }

        it("should create new template", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            const result = await templateRepository.create(createData)
            expect(result).toMatchObject(createData)
            expect(result.id).toBeDefined()
            expect(result.createdAt).toBeDefined()
            expect(result.updatedAt).toBeDefined()
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("INSERT INTO templates"),
                args: expect.arrayContaining([
                    expect.any(String),
                    createData.name,
                    createData.description,
                    createData.version,
                    createData.content,
                    JSON.stringify(createData.parameters),
                    createData.isActive,
                    expect.any(String),
                    expect.any(String)
                ])
            }))
        })

        it("should throw ValidationError when data is invalid", async () => {
            const invalidData = { ...createData, name: "" }
            await expect(templateRepository.create(invalidData))
                .rejects
                .toThrow(ValidationError)
        })

        it("should throw DatabaseError on database failure", async () => {
            vi.mocked(client.execute).mockRejectedValueOnce(new Error("DB Error"))
            await expect(templateRepository.create(createData))
                .rejects
                .toThrow(DatabaseError)
        })
    })

    describe("update", () => {
        const updateData = {
            name: "Updated Name",
            description: "Updated Description"
        }

        beforeEach(() => {
            // Mock findById for validation
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })
        })

        it("should update template", async () => {
            vi.mocked(client.execute)
                .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // For update
                .mockResolvedValueOnce({ rows: [{ ...mockRow, ...updateData }], rowCount: 1 }) // For final select

            const result = await templateRepository.update(mockTemplate.id, updateData)
            expect(result).toMatchObject(expect.objectContaining(updateData))
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("UPDATE templates SET"),
                args: expect.arrayContaining([
                    updateData.name,
                    updateData.description,
                    expect.any(String),
                    mockTemplate.id
                ])
            }))
        })

        it("should throw EntityNotFoundError when template not found", async () => {
            vi.mocked(client.execute).mockReset()
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            await expect(templateRepository.update("non-existent", updateData))
                .rejects
                .toThrow(EntityNotFoundError)
        })

        it("should throw ValidationError when update data is invalid", async () => {
            const invalidData = { name: "" }
            await expect(templateRepository.update(mockTemplate.id, invalidData))
                .rejects
                .toThrow(ValidationError)
        })
    })

    describe("delete", () => {
        it("should delete template", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            await templateRepository.delete(mockTemplate.id)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "DELETE FROM templates WHERE id = ?",
                args: [mockTemplate.id]
            })
        })
    })

    describe("findActive", () => {
        it("should return active templates", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await templateRepository.findActive()
            expect(result).toEqual([mockTemplate])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM templates WHERE is_active = true",
                args: []
            })
        })
    })

    describe("findByVersion", () => {
        it("should return templates by version", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await templateRepository.findByVersion(mockTemplate.version)
            expect(result).toEqual([mockTemplate])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM templates WHERE version = ?",
                args: [mockTemplate.version]
            })
        })
    })
}) 