import { ErrorMessage } from "@/app/components/ui/error-message";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/domain";
import type { PromptExecutionResult } from "@/schemas/prompt-execution";
import { useState } from "react";

interface RunPromptButtonProps {
    prompt: Prompt;
    onComplete?: (result: PromptExecutionResult) => void;
}

export function RunPromptButton({ prompt, onComplete }: RunPromptButtonProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        try {
            setIsRunning(true);
            setError(null);

            // First create a new prompt run record
            const createRunResponse = await fetch('/api/prompt-runs', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    promptId: prompt.id,
                    modelId: prompt.modelId,
                    options: {
                        temperature: 0.7,
                        maxTokens: 1000,
                    },
                }),
            });

            if (!createRunResponse.ok) {
                const error = await createRunResponse.json();
                throw new Error(error.message || "Failed to create prompt run");
            }

            const promptRun = await createRunResponse.json();

            // Then execute the prompt
            const executeResponse = await fetch(`/api/prompts/${prompt.id}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelId: prompt.modelId,
                    options: {
                        temperature: 0.7,
                        maxTokens: 1000,
                    },
                }),
            });

            if (!executeResponse.ok) {
                const error = await executeResponse.json();
                throw new Error(error.message || "Failed to run prompt");
            }

            const result = await executeResponse.json();

            // Update the prompt run with the results
            await fetch(`/api/prompt-runs/${promptRun.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    result: result.text,
                    usage: result.usage,
                    status: "completed",
                }),
            });

            onComplete?.(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <>
            <Button onClick={handleRun} disabled={isRunning}>
                {isRunning ? "Running..." : "Run"}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
    );
}
