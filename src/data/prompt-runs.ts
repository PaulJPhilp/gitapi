import type { PromptRun } from "../schemas/prompt-run"

export const promptRuns: PromptRun[] = [
    {
        id: "run1",
        promptId: "summarize",
        modelId: "gpt-4-turbo",
        providerId: "openai",
        content: "Please provide a concise summary of the following text:\n\nThe Internet of Things (IoT) refers to the network of physical objects embedded with sensors, software, and other technologies that enable them to collect and exchange data with other devices over the internet.",
        completion: "The Internet of Things (IoT) is a network of physical objects equipped with sensors and software that can collect and share data with other connected devices via the internet.",
        usage: {
            promptTokens: 45,
            completionTokens: 28,
            totalTokens: 73
        },
        createdAt: "2024-03-25T10:30:00Z"
    },
    {
        id: "run2",
        promptId: "analyze-code",
        modelId: "gpt-4-turbo",
        providerId: "openai",
        content: "Please analyze the following code and provide insights on potential improvements, bugs, and best practices:\n\n```typescript\nfunction fibonacci(n: number): number {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}```",
        completion: "The code implements a recursive Fibonacci sequence calculator. While functional, it has exponential time complexity O(2^n). Consider using dynamic programming or iteration for better performance. Also add input validation for negative numbers and consider memoization to cache results.",
        usage: {
            promptTokens: 52,
            completionTokens: 45,
            totalTokens: 97
        },
        createdAt: "2024-03-25T11:15:00Z"
    },
    {
        id: "run3",
        promptId: "translate",
        modelId: "gpt-3.5-turbo",
        providerId: "openai",
        content: "Please translate the following text from English to Spanish:\n\nHello, how are you? It's a beautiful day today.",
        completion: "¡Hola, cómo estás? Es un hermoso día hoy.",
        usage: {
            promptTokens: 20,
            completionTokens: 12,
            totalTokens: 32
        },
        createdAt: "2024-03-25T12:00:00Z"
    },
    {
        id: "run4",
        promptId: "explain-concept",
        modelId: "claude-3-sonnet",
        providerId: "anthropic",
        content: "Please explain the concept of quantum computing in simple terms that a high school student could understand.",
        completion: "Quantum computing is like having a super-powerful calculator that can solve many problems at once. While regular computers use bits (0s and 1s), quantum computers use quantum bits or 'qubits' that can be both 0 and 1 at the same time, like being in two places at once. This allows them to process huge amounts of information much faster than regular computers for certain types of problems.",
        usage: {
            promptTokens: 25,
            completionTokens: 82,
            totalTokens: 107
        },
        createdAt: "2024-03-25T13:45:00Z"
    }
] 