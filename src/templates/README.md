# Templates Module

This module manages the templating system for prompt generation and versioning. It provides a robust infrastructure for creating, managing, and versioning prompt templates with parameter validation.

## Directory Structure

```
templates/
├── domain/           # Domain models and business logic
├── types/           # TypeScript type definitions
├── repositories/    # Data access layer implementations
├── errors/         # Custom error definitions
├── services/       # Business service implementations
├── infrastructure/ # Infrastructure concerns
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Key Features

- Template versioning with semantic versioning (major.minor.patch)
- Parameter validation and change detection
- Breaking change detection
- Template deprecation management
- Template migration support
- Authentication and authorization checks

## Core Concepts

### Templates
- Templates are the base structure for prompts
- Each template has a unique ID, name, content, and version
- Template content can include parameters in the format `{{parameterName}}`

### Versioning
- Patch (1.0.x): Non-breaking changes to template content
- Minor (1.x.0): Added parameters (backward compatible)
- Major (x.0.0): Breaking changes (removed/renamed parameters)

### Parameters
- Parameters are defined using double curly braces: `{{parameter}}`
- Parameters are validated during template updates
- Breaking changes are detected automatically

## Usage Example

```typescript
// Creating a new template
const template = await templateService.createTemplate({
  name: "Example Template",
  content: "Hello {{name}}, welcome to {{service}}"
});

// Creating a new version
const newVersion = await templateService.createNewVersion(
  templateId,
  "Hello {{name}}, welcome to {{service}}! {{greeting}}",
  "Added optional greeting parameter"
);
```

## Best Practices

1. Always validate template changes before applying them
2. Use semantic versioning appropriately
3. Document breaking changes clearly
4. Test templates with various parameter combinations
5. Keep templates modular and focused

## Error Handling

The module includes specific error types for common scenarios:
- Authentication errors
- Permission errors
- Validation errors
- Template not found errors

## Testing

Tests are located in the `__tests__` directory. Run them using:
```bash
bun test
``` 