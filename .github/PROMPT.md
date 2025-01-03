# AI Development Guidelines

This document defines the development guidelines and technology stack for our project. All AI assistants and developers should strictly follow these guidelines.

## Core Development Principles

You are an expert TypeScript developer specializing in Next.js App Router applications with a focus on type-safety and error handling. Follow these strict guidelines:

### Code Architecture:
- Organize code into clear layers: pages, components, services, hooks, and utilities
- Keep components focused and single-responsibility
- Use custom hooks for data fetching and state management
- Implement proper error boundaries and loading states

### TypeScript Best Practices:
- Define explicit interfaces for all data structures
- Use discriminated unions for state management
- Never use 'any' or 'unknown' without proper type narrowing
- Implement strict null checks
- Use type predicates for type narrowing

### Error Handling:
- Implement comprehensive error handling at all async boundaries
- Use custom error classes for different error types
- Provide meaningful error messages with context
- Log errors with appropriate detail levels
- Always handle both network and parsing errors

### Data Fetching:
- Implement retry logic for network requests
- Use proper loading and error states
- Handle race conditions in async operations
- Cache responses where appropriate
- Validate API responses against TypeScript interfaces

### UI Components:
- Use Shadcn UI components consistently
- Implement proper loading states with skeletons
- Handle empty states gracefully
- Provide clear feedback for user actions
- Use proper ARIA labels and roles

### State Management:
- Use React Query for server state
- Implement optimistic updates
- Handle concurrent modifications
- Use proper state initialization
- Implement proper cleanup in useEffect

### Testing:
- Write unit tests for utility functions
- Implement integration tests for API endpoints
- Test error scenarios and edge cases
- Mock external dependencies consistently
- Use proper test isolation

### Performance:
- Implement proper code splitting
- Use proper memoization
- Optimize re-renders
- Implement proper loading strategies
- Use proper caching strategies

### Security:
- Sanitize all user inputs
- Implement proper CSRF protection
- Use proper authentication checks
- Handle sensitive data appropriately
- Implement rate limiting

### Documentation:
- Document all interfaces and types
- Provide JSDoc comments for complex functions
- Document error handling strategies
- Document state management patterns
- Document component usage examples

## Technology Stack Requirements

### REQUIRED Technologies:

#### 1. Core:
   - TypeScript (strict mode)
   - Node.js LTS
   - Next.js 14+ (App Router only)
   - React 18+

#### 2. UI Layer:
   - Shadcn UI (latest)
   - Radix UI Primitives
   - Tailwind CSS
   - Lucide Icons

#### 3. Database:
   - SQLite (local-first)
   - SQLite WASM

#### 4. State Management:
   - React Context (app-wide state)
   - React useState/useReducer (local state)
   - TanStack Query (server state)

#### 5. Form Handling:
   - React Hook Form
   - Zod (validation)

#### 6. Testing:
   - Vitest
   - Testing Library
   - MSW (API mocking)

#### 7. Build Tools:
   - Biome (formatting & linting)
   - PNPM (package management)
   - Turborepo (monorepo)

#### 8. Development:
   - TypeScript ESLint
   - Husky (git hooks)
   - Changesets (versioning)

### EXPLICITLY PROHIBITED Technologies:

#### 1. State Management:
   ❌ Redux
   ❌ Zustand
   ❌ MobX
   ❌ Jotai
   ❌ Recoil

#### 2. UI Frameworks:
   ❌ Material UI
   ❌ Chakra UI
   ❌ Ant Design
   ❌ Bootstrap

#### 3. CSS Solutions:
   ❌ Styled Components
   ❌ Emotion
   ❌ CSS Modules
   ❌ SASS/SCSS

#### 4. Routing:
   ❌ React Router
   ❌ Next.js Pages Router

#### 5. Data Fetching:
   ❌ SWR
   ❌ Apollo Client
   ❌ Axios
   ❌ REST Clients

#### 6. Databases:
   ❌ PostgreSQL
   ❌ MongoDB
   ❌ Prisma
   ❌ TypeORM
   ❌ Drizzle

#### 7. Testing:
   ❌ Jest
   ❌ Cypress
   ❌ Playwright

#### 8. Build Tools:
   ❌ Webpack
   ❌ Vite
   ❌ ESLint
   ❌ Prettier

### Version Requirements:
- Node.js >= 18.17.0
- TypeScript >= 5.0.0
- Next.js >= 14.0.0
- React >= 18.2.0
- Tailwind >= 3.3.0

### Development Environment:
- VS Code with recommended extensions
- Biome configuration
- Strict TypeScript configuration
- Tailwind IntelliSense
- GitHub Copilot

This stack is optimized for:
- Local-first architecture
- Type safety
- Developer experience
- Performance
- Maintainability
- Testing

## Using This Guide

1. All AI assistants should follow these guidelines when generating or modifying code
2. All developers should reference this guide when making architectural decisions
3. Pull requests that introduce prohibited technologies will be rejected
4. Updates to this guide require team consensus and must be documented
5. Exceptions must be discussed and approved by the team 