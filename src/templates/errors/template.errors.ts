export interface TemplateError extends Error {
    code: 'TEMPLATE_NOT_FOUND' | 'INVALID_TEMPLATE' | 'VERSION_CONFLICT'
} 