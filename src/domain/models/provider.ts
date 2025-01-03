import type { SupportedFeatures } from "./model";

export interface Provider {
    id: string;
    name: string;
    description: string;
    website: string;
    apiKeyRequired: boolean;
    baseUrl: string | null;
    isEnabled: boolean;
    releaseDate: string | null;
    supportedFeatures: SupportedFeatures;
    createdAt: string;
    updatedAt: string;
}

export interface NewProvider
    extends Omit<Provider, "id" | "createdAt" | "updatedAt"> { }
