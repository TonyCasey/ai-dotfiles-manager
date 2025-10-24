# Centralized Rules Directory

This directory contains **centralized rules** for all AI coding assistants, eliminating duplication across provider folders.

## Structure

```
.dev/rules/
├── shared/              # Language-agnostic rules (symlinked)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── typescript/          # Language-specific rules (symlinked)
│   ├── coding-standards.md
│   └── testing.md
└── .local/             # Project-specific overrides
    ├── custom-rules.md
    └── architecture.md   # Override shared rules
```

## How It Works

### Base Rules (Read-Only Symlinks)
- **Shared Rules**: Universal principles applicable to all projects
- **Language Rules**: Specific conventions for your programming language
- **Symlinked from**: Global package templates
- **Automatically updated**: Run `ai-dotfiles-manager update`

### Local Overrides (Writable)
- **Project-specific**: Custom rules for this project only
- **Override capability**: Files with same name replace base rules
- **Version control**: Commit these to share with your team
- **Survive updates**: Never affected by package updates

## Loading Priority

1. **Base shared rules** loaded first
2. **Language-specific rules** loaded next
3. **Local overrides** loaded last (highest priority)

This means your `.local/` rules always take precedence over base rules.

## Customization

### Adding Custom Rules
Create new files in `.local/`:
```bash
.dev/rules/.local/
├── api-standards.md      # Your API conventions
├── database-rules.md      # Database specific rules
└── deployment-guide.md    # Deployment procedures
```

### Overriding Base Rules
Create a file with the same name in `.local/`:
```bash
.dev/rules/.local/
└── clean-architecture.md  # Overrides shared/clean-architecture.md
```

### Referencing Base Rules
In your custom files, reference base rules:
```markdown
# Custom Architecture Rules

See base principles in `../shared/clean-architecture.md`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- Custom error handling pattern
- ...
```

## Provider Integration

All AI providers are configured to read from this centralized location:

- **Claude Code**: Points to `.dev/rules/` via settings.json
- **Cursor**: Includes rules via `.cursorrules` file references
- **Kilo Code**: Points to `.dev/rules/` via config.json
- **Roo Code**: Points to `.dev/rules/` via config.json

## Session Hooks

Session hooks automatically load these rules:

- **Session Start**: Loads all rules into AI context
- **Session End**: Commits completed todo items
- **Automatic**: No manual intervention required

## Benefits

1. **Single Source of Truth**: No more rule duplication
2. **Easy Updates**: Update once, applies to all providers
3. **Project Customization**: Override rules per project
4. **Team Consistency**: Same rules across all team members
5. **Version Control**: Base rules separate from customizations

---

*This centralized approach eliminates the need to maintain separate rule sets for each AI provider.*