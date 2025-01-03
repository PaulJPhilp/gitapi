import {
    NetworkError,
    ProviderAuthError,
    ProviderNotEnabledError,
    ProviderNotFoundError,
    ValidationError,
} from "../errors";

import type {
    CompletionsRequest,
    CompletionsResponse,
} from "../schemas/endpoints";

import { modelsService } from "./models";
import { completeWithProvider } from "./providers/index";

// Define the union type for all possible errors
export type CompletionError =
    | ProviderAuthError
    | ProviderNotEnabledError
    | ProviderNotFoundError
    | ValidationError
    | NetworkError;

interface ProviderService {
    getApiKey(id: string): Promise<string | null>;
}

// Completions Service interface
export interface CompletionsService {
    readonly _tag: "CompletionsService";
    complete(request: CompletionsRequest): Promise<CompletionsResponse>;
}

// Implementation
export class DefaultCompletionsService implements CompletionsService {
    readonly _tag = "CompletionsService" as const;

    constructor(
        private readonly providersService: ProviderService
    ) { }

    async complete(request: CompletionsRequest): Promise<CompletionsResponse> {
        try {
            // Get and validate model
            const modelResult = await modelsService.getById(request.modelId);

            // Handle model not found
            if (!modelResult) {
                throw new ProviderNotFoundError({
                    message: `Model ${request.modelId} not found`,
                    providerId: "unknown"
                });
            }

            // Check if model is enabled
            if (!modelResult.isEnabled) {
                throw new ProviderNotEnabledError({
                    message: `Model ${request.modelId} is not enabled`,
                    providerId: modelResult.providerId,
                });
            }

            // Check if model supports completions
            if (!modelResult.supportedFeatures.completion) {
                throw new ValidationError(`Model ${request.modelId} does not support completions`, "modelId");
            }

            // Validate temperature if provided
            if (request.temperature !== undefined) {
                const minTemp = 0;
                const maxTemp = 1;
                if (request.temperature < minTemp || request.temperature > maxTemp) {
                    throw new ValidationError(`Temperature must be between ${minTemp} and ${maxTemp}`, "temperature");
                }
            }

            // Validate maxTokens if provided
            if (request.maxTokens !== undefined) {
                const modelMaxTokens = modelResult.maxTokens ?? modelResult.contextWindow;
                if (request.maxTokens > modelMaxTokens) {
                    throw new ValidationError(`maxTokens cannot exceed ${modelMaxTokens}`, "maxTokens");
                }
            }

            // Get API key
            const apiKey = await this.providersService.getApiKey(modelResult.providerId);
            if (!apiKey) {
                throw new ProviderAuthError({
                    message: `Failed to get API key for provider ${modelResult.providerId}`,
                    providerId: modelResult.providerId
                });
            }

            // Complete with provider
            return await completeWithProvider(
                request.prompt,
                {
                    ...modelResult,
                    maxTokens: modelResult.maxTokens ?? undefined,
                    modelFamily: modelResult.modelFamily ?? undefined,
                    inputPricePerToken: Number(modelResult.inputPricePerToken),
                    outputPricePerToken: Number(modelResult.outputPricePerToken),
                    releaseDate: modelResult.releaseDate ?? undefined
                },
                apiKey,
                request.temperature,
                request.maxTokens
            );
        } catch (error) {
            if (error instanceof ProviderAuthError ||
                error instanceof ProviderNotEnabledError ||
                error instanceof ProviderNotFoundError ||
                error instanceof ValidationError ||
                error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError("Failed to complete request", undefined, error);
        }
    }
}
