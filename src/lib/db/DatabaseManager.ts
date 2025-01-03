import { API_ENDPOINTS } from "@/src/config/database";

export class DatabaseManager {
    async initialize() {
        const response = await fetch(API_ENDPOINTS.dbInit, {
            method: 'POST'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.details || 'Failed to initialize database');
        }

        return response.json();
    }
} 