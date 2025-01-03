import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ValidationError } from "../errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({
            error: "Validation error",
            details: err.errors,
        });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(400).json({
            error: err.message,
        });
        return;
    }

    res.status(500).json({
        error: "Internal server error",
    });
    return;
};
