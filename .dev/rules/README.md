# Centralized Rules Directory

This directory contains **centralized rules** for all AI coding assistants, eliminating duplication across provider folders.

## Structure

```
.dev/rules/
├── shared/              # Language-agnostic rules (managed copies)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── typescript/          # Language-specific rules (managed copies)
│   ├── coding-standards.md
│   └── testing.md
└── .local/             # Project-specific overrides
    ├── custom-rules.md
    └── architecture.md   # Override shared rules
```

## How It Works

### Base Rules (Managed Copies)
- **Shared Rules**: Universal principles applicable to all projects
- **Language Rules**: Specific conventions for your programming language
- **Source**: Copied from global package templates
- **Updated via**: Run `ai-dotfiles-manager update`

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

---

*This centralized approach eliminates the need to maintain separate rule sets for each AI provider.*
