# Data Access Layer (DAL)

Runtime database access layer that provides type-safe interfaces for database operations. This layer abstracts database interactions and enforces data consistency rules.

## Structure

```
dal/
├── models/            # Data models and type definitions
├── repositories/      # CRUD operations for each entity
├── queries/          # Complex query builders
└── transactions/     # Transaction management
```

## Usage

```typescript
import { ProviderRepository } from "@/src/dal/repositories"

// Type-safe database operations
const providers = await ProviderRepository.findEnabled()
```

## Key Concepts

### Repositories
- One repository per entity
- CRUD operations
- Query builders
- Type-safe returns

### Transactions
- Atomic operations
- Rollback support
- Nested transactions
- Error handling

### Query Builders
- Type-safe queries
- Composable filters
- Optimized joins
- Pagination support

## Best Practices

1. Always use repositories instead of direct SQL
2. Keep business logic out of DAL
3. Use transactions for multi-step operations
4. Handle database errors at repository level 