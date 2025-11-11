<!-- ai-dotfiles-manager:codex-guide:start -->
# Codex Session Guide

On session start, load and keep the following files in working memory:

- `.dev/architecture.md`
- `.dev/codex-manifest.json`
- `.dev/feature.md`
- `.dev/todo.md` (if present)
- `.dev/rules/shared/*.md`
- `.dev/rules/typescript/*.md` (if present)
- `.dev/rules/.local/*.md` (project-specific overrides)
- `.dev/lint/*.md` (lint checklists & IDE parity notes)

- Manifest: `.dev/codex-manifest.json` (authoritative load order)
- Index: `.dev/context-index.md` (links to key context)

Rules precedence: `.local` > language > shared.

Codex working agreement (from CLI reference):
- Start tool use with a 1–2 sentence preamble.
- Use `update_plan` for multi-step tasks; keep steps short.
- Prefer `rg` for search; read files in ≤250-line chunks.
- Use `apply_patch` for edits; avoid destructive commands.
- File references: backticked paths with optional :line, no ranges.
- Final answers: concise, structured bullets; headers only when helpful.

Key expectations for this repository:
- Follow Clean Architecture and Repository Pattern from rules.
- Prefer pure functions; isolate IO to scripts/ and bin/.
- Maintain test coverage ≥ 70% (see `jest.config.js`).
- Offer fixes that update docs or scripts when behavior changes.
- Prompt templates live in `templates/codex/prompts/` for quick session kickoffs.

Assistant behavior:
- Propose changes that align with loaded rules.
- When generating files, mirror naming and folder conventions.
- Surface any conflicts between `.local` and shared rules.

Example rules (not exhaustive):
- .dev/rules/shared/clean-architecture.md
- .dev/rules/shared/code-quality-rules.md
- .dev/rules/typescript/coding-standards.md
- .dev/rules/typescript/testing.md
- .dev/rules/.local/README.md
- .dev/lint/jetbrains-lint.md

Note: This section is managed by ai-dotfiles-manager. You may add content above or below; changes inside markers may be overwritten on update.
<!-- ai-dotfiles-manager:codex-guide:end -->
