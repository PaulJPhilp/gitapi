export const API_BASE_URL = process.env.NODE_ENV === 'test'
    ? 'http://localhost:9001/api'
    : '/api' 