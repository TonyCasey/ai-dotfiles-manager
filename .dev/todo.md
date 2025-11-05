# Developer Todo List

> Codex CLI + Managed Copies + Build improvements

## Codex CLI Integration

- [ ] Dynamically list actual rule files in the Codex guide (shared + language + .local) and refresh on update.
- [x] Auto-refresh Codex guide block on any `ai-dotfiles-manager` command (setup, update, review, commit-todo).
- [ ] Add `--no-codex-guide` flag to skip managing `AGENTS.md` for teams with custom workflows.
- [ ] Include a clear file reference example in the guide (path with optional :line; no ranges).
- [ ] Document JS→TS rules mapping note in the guide when language is JavaScript.

## Codex Manifest & Index

- [ ] Generate `.dev/codex-manifest.json` with explicit load order and precedence; reference it in `AGENTS.md`.
- [ ] Generate `.dev/context-index.md` summarizing key rules and project docs; link it from the guide.
- [ ] Add `templates/codex/prompts/*.md` and surface links in `AGENTS.md`.
- [ ] Inject discovered rule filenames (shared + language + .local) into the guide for quick navigation.

## Docs & DX

- [ ] Extend `.dev/rules/README.md` with Codex-specific loading/precedence notes and troubleshooting.
- [ ] Update `README.md` with Codex support overview and note auto-refresh (no separate script).
- [ ] Add CHANGELOG entry summarizing Codex guide features and flags.

## Codex Web

- [ ] Add “Start Here” section in `README.md` pointing to `.dev/context-index.md` and `.dev/architecture.md`.
- [ ] Add `CONTRIBUTING.md` with the Codex Working Agreement bullets for Web users.

## Testing & QA

- [ ] Unit tests: guide generator (language mapping, formatting) and block injection (idempotent replace, append-if-missing).
- [ ] E2E: run `setup`/`update` in a fixture project and assert `AGENTS.md` contains the managed Codex block.
- [ ] Validate Windows path handling with managed copies (no symlinks).

## MCP Integration (Optional)

- [ ] Add a minimal MCP server exposing `.dev/architecture.md`, `.dev/rules/**`, `.dev/context-index.md`, and `AGENTS.md`.
- [ ] Document how to enable this MCP server in Codex CLI.

## Managed Copies Migration

- [x] Remove symlink usage from setup and provider installers (copy-only).
- [x] Sweep docs to remove symlink references; align to managed copies.
- [x] Update migration script to copy shared/language rules (no symlinks).
- [x] Remove obsolete sync-rules script and references.
- [x] Add CI check to verify `.dev/rules` contains copied (non-symlink) dirs.

## Build & Release

- [x] Add TypeScript build (allowJs) to `dist/` and run on `prepare`.
- [ ] Optionally switch CLI bin to `dist/bin/setup.js` and harden template path resolution.

## CI & Diagnostics

- [ ] CI: Validate `AGENTS.md` contains the managed Codex block.
- [ ] CI: Validate `.dev/codex-manifest.json` exists and paths resolve.
- [ ] Add `npm run codex:doctor` to print manifest, guide status, and missing context files.

## Future Enhancements

- [ ] Optional MCP server to expose `.dev/architecture.md` and `.dev/rules/**` as resources for richer browsing.
- [ ] Enumerate top N rules in the guide with brief one-liners to prime Codex context further.
