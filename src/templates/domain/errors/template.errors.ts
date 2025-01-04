export interface TemplateError extends Error {
    code: 'TEMPLATE_NOT_FOUND' | 'VERSION_NOT_FOUND' | 'INVALID_TEMPLATE'
} 