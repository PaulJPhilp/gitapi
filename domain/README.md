# Domain Models

This directory contains the core domain models for our AI provider management system. Each model is designed to be type-safe and follows a consistent pattern of extending the base `Entity` type.

## Structure

```
domain/
├── auth/         # Authentication and authorization models
├── common/       # Shared types and base models
├── model/        # AI model definitions
├── prompt/       # Prompt and prompt run models
├── provider/     # AI provider models
└── template/     # Template models
```

## Common Patterns

All domain models follow these patterns:

- Extend the base `Entity` interface which provides:
  - `id: string`
  - `createdAt: string`
  - `updatedAt: string`
- Define create/update parameter types using:
  - `CreateXParams = Omit<X, keyof Entity>`
  - `UpdateXParams = Partial<CreateXParams>`

## Domain Models

### Auth

- `AuthContext`: Authentication context with user info and permission checking
- `AuthPermission`: Permission model with action, resource, and resourceId
- `ProviderApiKey`: API key management for providers

### Model

- `Model`: Represents an AI model (e.g., GPT-4, Claude)
- `SupportedFeatures`: Feature flags for model capabilities
  - chat, completion, embedding
  - imageGeneration, imageAnalysis
  - functionCalling, streaming

### Prompt

- `Prompt`: Template-based prompt with parameters
- `PromptRun`: Record of a prompt execution
- `Usage`: Token usage tracking for prompt runs

### Provider

- `Provider`: AI service provider (e.g., OpenAI, Anthropic)
- `ProviderApiKey`: Provider authentication credentials
- Inherits `SupportedFeatures` from Model domain

### Template

- `Template`: Base prompt template
- `TemplateVersion`: Version control for templates

## Clients

The domain models are used by several layers of the application:

### Infrastructure Layer
- **Repositories**: Convert database rows to domain models
  ```typescript
  // Example: src/infrastructure/repositories/provider.ts
  function rowToProvider(row: Row): Provider {
    return {
      id: String(row.id),
      name: String(row.name),
      // ... other fields
    }
  }
  ```

### Service Layer
- **Business Logic**: Implements operations on domain models
  ```typescript
  // Example: src/services/providers.ts
  async create(data: CreateProviderParams): Promise<Provider> {
    const validatedData = validateProvider(data)
    return providerRepository.create(validatedData)
  }
  ```

### API Layer
- **Route Handlers**: Use domain models for request/response types
  ```typescript
  // Example: src/routes/providers.ts
  app.post('/providers', async (req: CreateProviderParams) => {
    const provider = await providersService.create(req)
    return provider
  })
  ```

### UI Layer
- **React Components**: Type props and state with domain models
  ```typescript
  // Example: app/components/ProvidersList.tsx
  interface ProvidersListProps {
    providers: Provider[]
    onProviderUpdated: (provider: Provider) => void
  }
  ```
- **Forms**: Use parameter types for input validation
  ```typescript
  // Example: app/components/AddProviderDialog.tsx
  const form = useForm<CreateProviderParams>({
    resolver: zodResolver(providerSchema)
  })
  ```

### Test Layer
- **Unit Tests**: Mock domain models for testing
  ```typescript
  // Example: src/__tests__/providers.test.ts
  const mockProvider: Provider = {
    id: 'test-id',
    name: 'Test Provider',
    // ... other fields
  }
  ```
- **Integration Tests**: Validate API responses match domain models
  ```typescript
  // Example: src/__tests__/api/providers.test.ts
  expect(response.body).toMatchObject<Provider>({
    id: expect.any(String),
    name: expect.any(String),
    // ... other fields
  })
  ```

## Usage Example

```typescript
import type { 
  Model,
  Provider,
  Prompt,
  PromptRun,
  CreatePromptParams,
  UpdateProviderParams 
} from '@/domain'

// Creating a new prompt
const createPrompt = async (params: CreatePromptParams): Promise<Prompt> => {
  // Entity fields (id, createdAt, updatedAt) are handled by the repository
  return await promptRepository.create(params)
}

// Updating a provider
const updateProvider = async (
  id: string, 
  params: UpdateProviderParams
): Promise<Provider> => {
  return await providerRepository.update(id, params)
}
```

## Type Safety

The domain models ensure type safety through:
- Strict interfaces for all models
- Discriminated unions for status fields
- Proper typing for create/update operations
- Shared types for common features

## Best Practices

1. Always import types from the root domain:
   ```typescript
   import type { Model, Provider } from '@/domain'
   ```

2. Use parameter types for operations:
   ```typescript
   import type { CreateModelParams, UpdateModelParams } from '@/domain'
   ```

3. Leverage shared types:
   ```typescript
   import type { SupportedFeatures } from '@/domain'
   ```

4. Handle optional fields appropriately:
   ```typescript
   const template: Template = {
     // Required fields
     name: 'Example',
     content: 'Content',
     // Optional fields
     parameters?: { key: 'value' }
   }
   ```

## Relationships

- `Provider` -> `Model`: One-to-many
- `Model` -> `Prompt`: One-to-many
- `Template` -> `Prompt`: One-to-many
- `Prompt` -> `PromptRun`: One-to-many

## Contributing

When adding new domain models:
1. Create a new directory under `domain/`
2. Define interfaces extending `Entity`
3. Create parameter types using `Omit`
4. Export from `domain/index.ts`
5. Update this README 