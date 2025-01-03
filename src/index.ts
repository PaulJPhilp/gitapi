import { Hono } from "hono";
import { authService } from "./services/auth";
import { DefaultCompletionsService } from "./services/completions";
import { promptRunsService } from "./services/promptRuns";
import { providersService } from "./services/providers";

export const app = new Hono();

const completionsService = new DefaultCompletionsService(providersService);

// Prompt Runs Endpoints
app.get("/prompt-runs", async (c) => {
    try {
        const promptRuns = await promptRunsService.list();
        return c.json(promptRuns);
    } catch (error) {
        console.error("Failed to list prompt runs:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.get("/prompt-runs/:id", async (c) => {
    const { id } = c.req.param();
    try {
        const promptRun = await promptRunsService.getById(id);
        if (!promptRun) {
            return c.json({ error: "Prompt run not found" }, 404);
        }
        return c.json(promptRun);
    } catch (error) {
        console.error(`Failed to get prompt run ${id}:`, error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.post("/prompt-runs", async (c) => {
    try {
        const data = await c.req.json();
        const promptRun = await promptRunsService.create(data);
        return c.json(promptRun, 201);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "ValidationError") {
                return c.json({ error: error.message }, 400);
            }
        }
        console.error("Failed to create prompt run:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.delete("/prompt-runs/:id", async (c) => {
    const { id } = c.req.param();
    try {
        await promptRunsService.delete(id);
        return c.json(null, 204);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
        }
        console.error(`Failed to delete prompt run ${id}:`, error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.get("/prompts/:promptId/runs", async (c) => {
    const { promptId } = c.req.param();
    try {
        const promptRuns = await promptRunsService.findByPrompt(promptId);
        return c.json(promptRuns);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "ValidationError") {
                return c.json({ error: error.message }, 400);
            }
        }
        console.error(`Failed to get prompt runs for prompt ${promptId}:`, error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.get("/models/:modelId/runs", async (c) => {
    const { modelId } = c.req.param();
    try {
        const promptRuns = await promptRunsService.findByModel(modelId);
        return c.json(promptRuns);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "ValidationError") {
                return c.json({ error: error.message }, 400);
            }
        }
        console.error(`Failed to get prompt runs for model ${modelId}:`, error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.get("/providers/:providerId/runs", async (c) => {
    const { providerId } = c.req.param();
    try {
        const promptRuns = await promptRunsService.findByProvider(providerId);
        return c.json(promptRuns);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "ValidationError") {
                return c.json({ error: error.message }, 400);
            }
        }
        console.error(`Failed to get prompt runs for provider ${providerId}:`, error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// GET /models/:modelId
app.get("/models/:modelId", async (c) => {
    const { modelId } = c.req.param();

    try {
        const model = await providersService.getById(modelId);
        return c.json(model);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
            console.error("Unhandled error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
        console.error("Unhandled error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// GET /providers/:providerId/models
app.get("/providers/:providerId/models", async (c) => {
    const { providerId } = c.req.param();

    try {
        const provider = await providersService.getById(providerId);
        return c.json(provider);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
            console.error("Unhandled error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
        console.error("Unhandled error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// POST /providers/:providerId/auth
app.post("/providers/:providerId/auth", async (c) => {
    const { providerId } = c.req.param();
    const body = await c.req.json();

    if (!body.apiKey || typeof body.apiKey !== "string") {
        return c.json({ error: "API key is required" }, 400);
    }

    try {
        await authService.setApiKey(providerId, body.apiKey);
        return c.json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
            console.error("Unhandled error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
        console.error("Unhandled error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// GET /providers/:providerId/auth/validate
app.get("/providers/:providerId/auth/validate", async (c) => {
    const { providerId } = c.req.param();
    const apiKey = c.req.header("x-api-key");

    if (!apiKey || typeof apiKey !== "string") {
        return c.json({ error: "API key is required in X-API-Key header" }, 400);
    }

    try {
        const isValid = await authService.validateApiKey(providerId, apiKey);
        return c.json({ isValid });
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
            console.error("Unhandled error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
        console.error("Unhandled error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// POST /completions
app.post("/completions", async (c) => {
    const body = await c.req.json();

    try {
        const result = await completionsService.complete(body);
        return c.json(result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.constructor.name === "NotFoundError") {
                return c.json({ error: error.message }, 404);
            }
            if (error.constructor.name === "ValidationError") {
                return c.json({ error: error.message }, 400);
            }
            console.error("Unhandled error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
        console.error("Unhandled error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export * from "./domain";
export * from "./services";
export * from "./types";

