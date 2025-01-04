export abstract class Entity {
    constructor(
        public readonly id: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    equals(other: Entity): boolean {
        if (!(other instanceof Entity)) return false
        return this.id === other.id
    }
} 