# Local Rules Directory

This directory contains **project-specific custom rules** that override or extend the base rules.

## How to customize

### Override specific rules
Create a file with the same name as a base rule to override it:
```
.local/
  └── clean-architecture.md    # Overrides shared/clean-architecture.md
```

### Add new rules
Add new markdown files for project-specific requirements:
```
.local/
  └── custom-api-standards.md
  └── database-conventions.md
```

### Extend existing rules
Reference and extend base rules in your custom files:
```markdown
<!-- In .local/custom-architecture.md -->
# Custom Architecture Rules

See base rules in `../shared/clean-architecture.md`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- ...
```

## Updating base rules

When you run `ai-dotfiles-manager update`, the copied base rule directories are refreshed with the latest templates, but your .local files remain untouched.

## Git

**Commit .local files** to share project-specific rules with your team:
```gitignore
# In your .gitignore:
# Ignore base rules copied from the package
.dev/rules/shared/
.dev/rules/typescript/

# But commit local customizations
!.dev/rules/.local/
```
