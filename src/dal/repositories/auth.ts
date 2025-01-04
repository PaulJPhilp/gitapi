import type { AuthPermission, AuthUser } from "@/domain"
import { client } from "../db"
import { DatabaseError, EntityNotFoundError } from "../errors"
import { validateAuthUser } from "../validation/auth"
import type { Repository } from "./types"

export interface AuthRepository extends Repository<AuthUser, Omit<AuthUser, "id" | "createdAt" | "updatedAt">> {
    findByEmail(email: string): Promise<AuthUser | null>
    findActive(): Promise<AuthUser[]>
    getUserPermissions(userId: string): Promise<AuthPermission[]>
    updateLastLogin(userId: string): Promise<void>
}

export const authRepository: AuthRepository = {
    async findAll(): Promise<AuthUser[]> {
        const result = await client.execute({
            sql: "SELECT * FROM auth_users",
            args: []
        })
        return result.rows.map(mapRowToAuthUser)
    },

    async findById(id: string): Promise<AuthUser | null> {
        const result = await client.execute({
            sql: "SELECT * FROM auth_users WHERE id = ?",
            args: [id]
        })
        return result.rows[0] ? mapRowToAuthUser(result.rows[0]) : null
    },

    async create(data: Omit<AuthUser, "id" | "createdAt" | "updatedAt">): Promise<AuthUser> {
        try {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()

            const user: AuthUser = {
                id,
                createdAt: now,
                updatedAt: now,
                ...data
            }

            validateAuthUser(user)

            await client.execute({
                sql: `INSERT INTO auth_users (
                    id, email, name, roles, is_active,
                    last_login_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id, data.email, data.name,
                    JSON.stringify(data.roles), data.isActive,
                    data.lastLoginAt, now, now
                ]
            })

            return user
        } catch (error) {
            throw new DatabaseError('create', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async update(id: string, data: Partial<Omit<AuthUser, "id" | "createdAt" | "updatedAt">>): Promise<AuthUser> {
        try {
            const existing = await this.findById(id)
            if (!existing) {
                throw new EntityNotFoundError('AuthUser', id)
            }

            const sets: string[] = []
            const values: (string | boolean | Date | null)[] = []
            const now = new Date().toISOString()

            if (data.email !== undefined) {
                sets.push("email = ?")
                values.push(data.email)
            }

            if (data.name !== undefined) {
                sets.push("name = ?")
                values.push(data.name)
            }

            if (data.roles !== undefined) {
                sets.push("roles = ?")
                values.push(JSON.stringify(data.roles))
            }

            if (data.isActive !== undefined) {
                sets.push("is_active = ?")
                values.push(data.isActive)
            }

            if (data.lastLoginAt !== undefined) {
                sets.push("last_login_at = ?")
                values.push(data.lastLoginAt)
            }

            if (sets.length > 0) {
                const updatedUser: AuthUser = {
                    ...existing,
                    ...data,
                    updatedAt: now
                }
                validateAuthUser(updatedUser)

                sets.push("updated_at = ?")
                values.push(now)
                values.push(id)

                await client.execute({
                    sql: `UPDATE auth_users SET ${sets.join(", ")} WHERE id = ?`,
                    args: values
                })
            }

            const result = await client.execute({
                sql: "SELECT * FROM auth_users WHERE id = ?",
                args: [id]
            })

            if (!result.rows[0]) {
                throw new EntityNotFoundError('AuthUser', id)
            }

            return mapRowToAuthUser(result.rows[0])
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error
            }
            throw new DatabaseError('update', error instanceof Error ? error.message : 'Unknown error')
        }
    },

    async delete(id: string): Promise<void> {
        await client.execute({
            sql: "DELETE FROM auth_users WHERE id = ?",
            args: [id]
        })
    },

    async findByEmail(email: string): Promise<AuthUser | null> {
        const result = await client.execute({
            sql: "SELECT * FROM auth_users WHERE email = ?",
            args: [email]
        })
        return result.rows[0] ? mapRowToAuthUser(result.rows[0]) : null
    },

    async findActive(): Promise<AuthUser[]> {
        const result = await client.execute({
            sql: "SELECT * FROM auth_users WHERE is_active = true",
            args: []
        })
        return result.rows.map(mapRowToAuthUser)
    },

    async getUserPermissions(userId: string): Promise<AuthPermission[]> {
        const result = await client.execute({
            sql: `SELECT p.* FROM auth_permissions p
                  JOIN auth_user_permissions up ON p.id = up.permission_id
                  WHERE up.user_id = ?`,
            args: [userId]
        })
        return result.rows.map(mapRowToPermission)
    },

    async updateLastLogin(userId: string): Promise<void> {
        const now = new Date().toISOString()
        await client.execute({
            sql: "UPDATE auth_users SET last_login_at = ?, updated_at = ? WHERE id = ?",
            args: [now, now, userId]
        })
    }
}

function mapRowToAuthUser(row: Record<string, unknown>): AuthUser {
    return {
        id: String(row.id),
        email: String(row.email),
        name: String(row.name),
        roles: JSON.parse(String(row.roles)),
        isActive: Boolean(row.is_active),
        lastLoginAt: row.last_login_at ? new Date(String(row.last_login_at)) : undefined,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    }
}

function mapRowToPermission(row: Record<string, unknown>): AuthPermission {
    return {
        action: String(row.action) as AuthPermission["action"],
        resource: String(row.resource) as AuthPermission["resource"],
        resourceId: row.resource_id ? String(row.resource_id) : undefined
    }
} 