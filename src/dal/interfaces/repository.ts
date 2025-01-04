import type { Entity } from "@/domain/common/entity"

export interface Repository<T extends Entity, U> {
    list(): Promise<T[]>
    findById(id: string): Promise<T | null>
    create(data: U): Promise<T>
    update(id: string, data: Partial<U>): Promise<T | null>
    delete(id: string): Promise<void>
} 