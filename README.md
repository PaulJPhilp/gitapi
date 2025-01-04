# Git API Service

A TypeScript-based service for managing AI model providers, prompts, and completions with support for multiple AI providers like OpenAI and Anthropic.

## Features

- 🤖 Multi-provider AI support (OpenAI, Anthropic)
- 🔑 Secure API key management
- 📝 Prompt management and versioning
- 📊 Completion tracking and history
- 🔍 Vector-based semantic search
- 🔄 GitHub integration for releases

## Tech Stack

- TypeScript
- Next.js App Router
- React
- Shadcn UI
- Radix UI
- Tailwind CSS

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/            # React components
├── src/
│   ├── dal/              # Data Access Layer
│   ├── domain/           # Domain models and schemas
│   ├── errors/           # Custom error types
│   ├── infrastructure/   # Infrastructure code
│   └── services/         # Core business logic
│       ├── auth/         # Authentication services
│       ├── providers/    # AI provider integrations
│       └── completions/  # Completion handling
```

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

4. Run the development server:
```bash
npm run dev
```

## Core Services

- **Providers Service**: Manages AI providers and their API keys
- **Models Service**: Handles model configurations and capabilities
- **Prompts Service**: Manages prompt templates and versions
- **Completions Service**: Processes completion requests across providers
- **Vector Store**: Implements semantic search functionality
- **GitHub Service**: Handles GitHub release management

## Development Guidelines

1. Use TypeScript for all new code
2. Follow functional programming patterns
3. Write descriptive variable names with auxiliary verbs
4. Structure components with exports, subcomponents, helpers
5. Use interfaces over types
6. Implement proper error handling
7. Write unit tests for new features

## Error Handling

The project uses custom error types for different scenarios:
- `ValidationError`: Input validation failures
- `ProviderAuthError`: API authentication issues
- `NetworkError`: Communication failures
- `EntityNotFoundError`: Resource not found

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

MIT
