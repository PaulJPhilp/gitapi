import { fetchApi } from "./api";

export interface CompletionRequest {
    modelId: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
}

export interface CompletionResponse {
    id: string;
    choices: Array<{
        message: {
            role: "assistant";
            content: string;
        };
        finishReason: string | null;
    }>;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export const CompletionsService = {
    complete: async (request: CompletionRequest): Promise<CompletionResponse> =>
        fetchApi<CompletionResponse>("/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }),
};
