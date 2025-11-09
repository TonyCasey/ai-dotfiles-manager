# Contributing

To keep contributions aligned with the Codex working agreement, follow these practices during development sessions:

1. **Start with context.** Begin tool usage with a brief 1–2 sentence preamble describing the intent of the command or change.
2. **Plan before multi-step work.** Use `update_plan` when a task involves more than one action; keep each step short and focused.
3. **Edit safely.** Prefer `apply_patch` (or equivalent patch-based tooling) for modifying files; avoid destructive commands.
4. **Reference files clearly.** When mentioning files, use backticked paths such as `` `path/to/file.js` `` with optional `:line` suffixes (no ranges).
5. **Stay concise.** Provide final responses that are structured, direct, and only as long as necessary.

For project architecture, context indices, and detailed rules, review the documents in `.dev/`, especially `.dev/context-index.md` and `.dev/architecture.md`.
