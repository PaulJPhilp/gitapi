# Configuration Directory

This directory contains centralized configuration files for the application. These configurations manage environment-specific settings and provide consistent values across the codebase.

## Files

### `api.ts`
Manages API base URL configuration:
- Sets different base URLs for test and production environments
- Used across components and tests for API calls
- Example usage:
```typescript
import { API_BASE_URL } from "@/src/config/api"
```

### `database.ts`
Contains database and API endpoint configurations:
- Database connection settings
- API endpoint definitions
- Environment-specific configurations
- Example usage:
```typescript
import { DATABASE_URL, API_ENDPOINTS } from "@/src/config/database"
```

## Best Practices

1. Always import configuration values from these files instead of hardcoding values
2. Use environment variables with fallbacks for flexible deployment
3. Keep sensitive information in environment variables, not in these files
4. Add new configurations here when they need to be shared across multiple components 