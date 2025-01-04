# Database Management System (DBMS)

This directory contains all database management system related files and utilities. While the runtime data access layer lives in `src/dal`, this directory handles the database system itself.

## Directory Structure

```
data/
├── config.ts           # Database configuration and connection management
├── migrations/         # Database migration scripts and runner
├── schemas/           # Schema definitions and validation
└── utils/             # Database maintenance and operations utilities
```

## Components

### Configuration (`config.ts`)
- Database connection configuration
- Connection pool management
- Database settings and pragmas

### Migrations (`migrations/`)
- Database structure changes
- Version control for schema changes
- Migration runner utilities
- Each migration is a numbered SQL file

### Schemas (`schemas/`)
- Database schema definitions
- Schema validation utilities
- Table and index definitions
- Data type specifications

### Utilities (`utils/`)
- Database maintenance operations
- Performance monitoring
- Space management
- Integrity checks
- Statistics collection

## Usage

This directory is used for database administration tasks such as:
- Initial database setup
- Schema migrations
- Database maintenance
- Performance tuning
- Schema validation

The runtime data access layer (`src/dal`) interfaces with the database using the structure defined here. 