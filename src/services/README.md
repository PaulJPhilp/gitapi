# Services Directory

This directory contains core service modules that handle business logic, data access, and external integrations.

## Structure

```
services/
├── db/             # Database and vector store interactions
├── auth/           # Authentication and authorization services
├── api/            # External API integrations
│   ├── providers/  # Provider integrations (OpenAI, etc.)
│   └── github/     # GitHub API integration
├── ai/             # AI-related services (completions, prompts, etc.)
└── index.ts        # Service exports
```

Each subdirectory contains related services and their interfaces. The structure is organized by domain to improve maintainability and separation of concerns.