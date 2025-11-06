# Project Status – ai-dotfiles-manager

Updated: 2025-11-05

Summary
- Managed copies: symlinks removed; all installs copy base rules.
- Codex support: generates `.dev/codex-manifest.json` and `.dev/context-index.md`; AGENTS.md Codex block auto-refreshes with references and sample files.
- CI: verifies no symlinks and validates codex manifest.
- Build: TypeScript allowJs build to `dist/` on `prepare`.

Delegated to Claude Cloud (in flight)
- Add `--no-codex-guide` flag (skip AGENTS/manifest/index updates).
- Docs polish: README “Start Here” + CONTRIBUTING with Codex Working Agreement.
- Prompt library: `templates/codex/prompts/` and link from AGENTS.

How to resume locally
- Inspect manifest/index: `npm run codex:doctor`
- Refresh setup: `node bin/setup.js update --yes`
- Run tests: `npm test`

Notes
- Work in small PRs; keep edits minimal and scoped.
- CI must remain green (managed-copies + manifest checks).

