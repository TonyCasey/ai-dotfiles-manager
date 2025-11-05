# Local Rules Directory

This directory contains **project-specific custom rules** that override or extend the base rules.

## Purpose

- **Override base rules** with project-specific requirements
- **Add custom rules** unique to your project
- **Team customization** - commit to share with your team
- **Survive updates** - never affected by package updates

## How to Use

### Option 1: Override Base Rules
Create a file with the same name as a base rule:
```bash
.local/
└── clean-architecture.md    # Overrides shared/clean-architecture.md
```

### Option 2: Add New Rules
Create new markdown files for project-specific requirements:
```bash
.local/
├── api-standards.md      # Your API conventions
├── database-rules.md      # Database specific rules
└── deployment-guide.md    # Deployment procedures
```

### Option 3: Extend Base Rules
Reference and extend base rules in your custom files:
```markdown
# Custom Architecture Rules

See base principles in `../shared/clean-architecture.md`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- Custom error handling pattern
- Microservices architecture with service mesh
```

## Loading Priority

Rules are loaded in this order:
1. **Base shared rules** (`../shared/`)
2. **Language-specific rules** (`../typescript/`)
3. **Local overrides** (`.local/`) - **HIGHEST PRIORITY**

This means your `.local/` files always take precedence over base rules.

## Examples

### Custom API Standards
```markdown
# API Standards

## REST Conventions
- Use kebab-case for endpoints
- Return consistent error format
- Include request ID for tracing

## Authentication
- JWT tokens with 1-hour expiration
- Refresh token rotation
- Rate limiting per user
```

### Database Rules
```markdown
# Database Rules

## Naming Conventions
- Tables: snake_case, plural
- Columns: snake_case, descriptive
- Indexes: idx_table_column

## Migration Strategy
- Always reversible migrations
- Include rollback scripts
- Test in staging first
```

## Git Integration

**Commit these files** to share project-specific rules with your team:

```gitignore
# In your .gitignore:
# Ignore base rules copied from the package
.dev/rules/shared/
.dev/rules/typescript/

# But commit local customizations
!.dev/rules/.local/
```

## Best Practices

1. **Be Specific**: Write rules that apply to your project
2. **Reference Base**: Link to base rules for context
3. **Keep Organized**: Use clear file names and structure
4. **Document Changes**: Explain why rules differ from base
5. **Team Review**: Discuss custom rules with your team

---

*These local rules ensure your project follows both team standards and project-specific requirements.*
