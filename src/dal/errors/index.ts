export class DalError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DalError'
    }
}

export class EntityNotFoundError extends DalError {
    constructor(entityType: string, id: string) {
        super(`${entityType} with id ${id} not found`)
        this.name = 'EntityNotFoundError'
    }
}

export class DatabaseError extends DalError {
    constructor(operation: string, detail: string) {
        super(`Database error during ${operation}: ${detail}`)
        this.name = 'DatabaseError'
    }
}

export class ValidationError extends DalError {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
} 