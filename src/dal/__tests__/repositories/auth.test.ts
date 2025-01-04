import type { AuthPermission, AuthUser } from "@/domain"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { client } from "../../db"
import { DatabaseError, EntityNotFoundError, ValidationError } from "../../errors"
import { authRepository } from "../../repositories"

vi.mock("../../db", () => ({
    client: {
        execute: vi.fn()
    }
}))

describe("authRepository", () => {
    const mockUser: AuthUser = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        isActive: true,
        lastLoginAt: new Date("2024-01-04T00:00:00.000Z"),
        createdAt: "2024-01-04T00:00:00.000Z",
        updatedAt: "2024-01-04T00:00:00.000Z"
    }

    const mockPermission: AuthPermission = {
        action: "read",
        resource: "template",
        resourceId: "test-resource"
    }

    const mockRow = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        roles: JSON.stringify(mockUser.roles),
        is_active: mockUser.isActive,
        last_login_at: mockUser.lastLoginAt?.toISOString(),
        created_at: mockUser.createdAt,
        updated_at: mockUser.updatedAt
    }

    const mockPermissionRow = {
        action: mockPermission.action,
        resource: mockPermission.resource,
        resource_id: mockPermission.resourceId
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe("findAll", () => {
        it("should return all users", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await authRepository.findAll()
            expect(result).toEqual([mockUser])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM auth_users",
                args: []
            })
        })

        it("should return empty array when no users exist", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await authRepository.findAll()
            expect(result).toEqual([])
        })
    })

    describe("findById", () => {
        it("should return user by id", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await authRepository.findById(mockUser.id)
            expect(result).toEqual(mockUser)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM auth_users WHERE id = ?",
                args: [mockUser.id]
            })
        })

        it("should return null when user not found", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            const result = await authRepository.findById("non-existent")
            expect(result).toBeNull()
        })
    })

    describe("create", () => {
        const createData = {
            email: mockUser.email,
            name: mockUser.name,
            roles: mockUser.roles,
            isActive: mockUser.isActive,
            lastLoginAt: mockUser.lastLoginAt
        }

        it("should create new user", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            const result = await authRepository.create(createData)
            expect(result).toMatchObject(createData)
            expect(result.id).toBeDefined()
            expect(result.createdAt).toBeDefined()
            expect(result.updatedAt).toBeDefined()
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("INSERT INTO auth_users"),
                args: expect.arrayContaining([
                    expect.any(String),
                    createData.email,
                    createData.name,
                    JSON.stringify(createData.roles),
                    createData.isActive,
                    createData.lastLoginAt,
                    expect.any(String),
                    expect.any(String)
                ])
            }))
        })

        it("should throw ValidationError when data is invalid", async () => {
            const invalidData = { ...createData, email: "invalid" }
            await expect(authRepository.create(invalidData))
                .rejects
                .toThrow(ValidationError)
        })

        it("should throw DatabaseError on database failure", async () => {
            vi.mocked(client.execute).mockRejectedValueOnce(new Error("DB Error"))
            await expect(authRepository.create(createData))
                .rejects
                .toThrow(DatabaseError)
        })
    })

    describe("update", () => {
        const updateData = {
            name: "Updated Name",
            isActive: false
        }

        beforeEach(() => {
            // Mock findById for validation
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })
        })

        it("should update user", async () => {
            vi.mocked(client.execute)
                .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // For update
                .mockResolvedValueOnce({ rows: [{ ...mockRow, ...updateData }], rowCount: 1 }) // For final select

            const result = await authRepository.update(mockUser.id, updateData)
            expect(result).toMatchObject(expect.objectContaining(updateData))
            expect(client.execute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining("UPDATE auth_users SET"),
                args: expect.arrayContaining([
                    updateData.name,
                    updateData.isActive,
                    expect.any(String),
                    mockUser.id
                ])
            }))
        })

        it("should throw EntityNotFoundError when user not found", async () => {
            vi.mocked(client.execute).mockReset()
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            })

            await expect(authRepository.update("non-existent", updateData))
                .rejects
                .toThrow(EntityNotFoundError)
        })
    })

    describe("findByEmail", () => {
        it("should return user by email", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await authRepository.findByEmail(mockUser.email)
            expect(result).toEqual(mockUser)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM auth_users WHERE email = ?",
                args: [mockUser.email]
            })
        })
    })

    describe("findActive", () => {
        it("should return active users", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockRow],
                rowCount: 1
            })

            const result = await authRepository.findActive()
            expect(result).toEqual([mockUser])
            expect(client.execute).toHaveBeenCalledWith({
                sql: "SELECT * FROM auth_users WHERE is_active = true",
                args: []
            })
        })
    })

    describe("getUserPermissions", () => {
        it("should return user permissions", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [mockPermissionRow],
                rowCount: 1
            })

            const result = await authRepository.getUserPermissions(mockUser.id)
            expect(result).toEqual([mockPermission])
            expect(client.execute).toHaveBeenCalledWith({
                sql: expect.stringContaining("SELECT p.* FROM auth_permissions p"),
                args: [mockUser.id]
            })
        })
    })

    describe("updateLastLogin", () => {
        it("should update last login timestamp", async () => {
            vi.mocked(client.execute).mockResolvedValueOnce({
                rows: [],
                rowCount: 1
            })

            await authRepository.updateLastLogin(mockUser.id)
            expect(client.execute).toHaveBeenCalledWith({
                sql: "UPDATE auth_users SET last_login_at = ?, updated_at = ? WHERE id = ?",
                args: expect.arrayContaining([
                    expect.any(String),
                    expect.any(String),
                    mockUser.id
                ])
            })
        })
    })
}) 