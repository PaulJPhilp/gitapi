// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db'
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9001'

// API endpoints
export const API_ENDPOINTS = {
    dbInit: `${API_BASE_URL}/api/db/init`,
    providers: `${API_BASE_URL}/api/providers`,
    models: `${API_BASE_URL}/api/models`
}

