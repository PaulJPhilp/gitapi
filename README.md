# GitAPI

A Next.js application for managing AI model providers and models, with a focus on Git-based workflows.

## Features

- Provider management (OpenAI, Anthropic, etc.)
- Model configuration and management
- Support for various AI capabilities (chat, completion, embedding, etc.)
- SQLite database for local development
- Modern UI with Shadcn/UI components

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- SQLite with Drizzle ORM
- Tailwind CSS
- Shadcn/UI components
- Bun for package management and running scripts

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd gitapi
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file with required environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
./scripts/magic-init.sh
```

5. Start the development server:
```bash
bun run dev
```

The application will be available at http://localhost:3000.

## Development

- `bun run dev` - Start the development server
- `bun run db:status` - Check database status
- `bun run db:reset` - Reset and seed the database
- `./scripts/magic-init.sh` - Initialize database with clean state

## License

MIT
