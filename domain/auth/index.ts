import type { Entity } from "../common/entity";

export interface ProviderApiKey extends Entity {
    providerId: string;
    apiKey: string;
    name: string;
    expiresAt?: Date;
    lastUsedAt?: Date;
    isEnabled: boolean;
}

export interface AuthContext {
    isAuthenticated: boolean;
    userId: string;
    roles: string[];
    permissions: AuthPermission[];
    hasPermission(params: {
        action: AuthAction;
        resource: string;
        resourceId?: string;
    }): Promise<boolean>;
    hasRole(role: string): boolean;
}

export type AuthAction = "create" | "read" | "update" | "delete";

export type AuthResource =
    | "provider"
    | "model"
    | "prompt"
    | "template"
    | "template_version"
    | "api_key";

export interface AuthPermission {
    action: AuthAction;
    resource: AuthResource;
    resourceId?: string;
}

export interface AuthUser extends Entity {
    email: string;
    name: string;
    roles: string[];
    isActive: boolean;
    lastLoginAt?: Date;
}

export type CreateProviderApiKeyParams = Omit<ProviderApiKey, keyof Entity>;
export type UpdateProviderApiKeyParams = Partial<CreateProviderApiKeyParams>;

export type CreateAuthUserParams = Omit<AuthUser, keyof Entity>;
export type UpdateAuthUserParams = Partial<CreateAuthUserParams>;
