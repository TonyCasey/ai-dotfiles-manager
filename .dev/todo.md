# Developer Todo List

> Codex CLI + Managed Copies + Build improvements

## Codex CLI Integration

- [ ] Dynamically list actual rule files in the Codex guide (shared + language + .local) and refresh on update.
- [x] Auto-refresh Codex guide block on any `ai-dotfiles-manager` command (setup, update, review, commit-todo).
- [ ] Add `--no-codex-guide` flag to skip managing `AGENTS.md` for teams with custom workflows.
- [ ] Include a clear file reference example in the guide (path with optional :line; no ranges).
- [ ] Document JS→TS rules mapping note in the guide when language is JavaScript.

## Docs & DX

- [ ] Extend `.dev/rules/README.md` with Codex-specific loading/precedence notes and troubleshooting.
- [ ] Update `README.md` with Codex support overview and note auto-refresh (no separate script).
- [ ] Add CHANGELOG entry summarizing Codex guide features and flags.

## Testing & QA

- [ ] Unit tests: guide generator (language mapping, formatting) and block injection (idempotent replace, append-if-missing).
- [ ] E2E: run `setup`/`update` in a fixture project and assert `AGENTS.md` contains the managed Codex block.
- [ ] Validate Windows path handling with managed copies (no symlinks).

## Managed Copies Migration

- [x] Remove symlink usage from setup and provider installers (copy-only).
- [x] Sweep docs to remove symlink references; align to managed copies.
- [x] Update migration script to copy shared/language rules (no symlinks).
- [x] Remove obsolete sync-rules script and references.
- [x] Add CI check to verify `.dev/rules` contains copied (non-symlink) dirs.

## Build & Release

- [x] Add TypeScript build (allowJs) to `dist/` and run on `prepare`.
- [ ] Optionally switch CLI bin to `dist/bin/setup.js` and harden template path resolution.

## Future Enhancements

- [ ] Optional MCP server to expose `.dev/architecture.md` and `.dev/rules/**` as resources for richer browsing.
- [ ] Enumerate top N rules in the guide with brief one-liners to prime Codex context further.
