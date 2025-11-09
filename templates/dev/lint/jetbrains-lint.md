# JetBrains Inspectopedia: JavaScript & TypeScript Targets

JetBrains maintains 26 JavaScript/TypeScript inspection groups spanning assignment mistakes, async misuse, type safety, code style, security, testing, and more.citeturn3search6 Use this checklist to sanity-check Codex CLI output before handing code off to JetBrains tooling.

## Core Risk Buckets to Scan
- **Control flow & assignments** – Reject generated snippets that reassign function parameters or hide writes inside nested expressions; both patterns are explicitly flagged as confusing or error-prone.citeturn5search1turn5search2
- **General API & documentation hygiene** – Watch for duplicate declarations, invalid ECMAScript constructs, mismatched JSDoc, unresolved references, and non-strict files, all of which are highlighted in the General inspection family.citeturn3search7
- **Async discipline** – Ensure every `await` lives inside an `async` function, promises are awaited (or intentionally handled), redundant `await`s are removed, and top-level `await` is avoided unless modules support it.citeturn6search1turn6search6
- **TypeScript-specific correctness** – Enforce strict type resolution: surface duplicate union members, unresolved imports/references, explicit-type style breaks, and mismatched assignment/return types before code reaches the IDE.citeturn7search2turn4search4turn4search5turn4search3
- **Probable bug patterns** – Guard against loose equality that risks coercion and similar logic errors that JetBrains elevates in the Probable bugs group.citeturn7search0turn7search4
- **Dead/unused surface** – Eliminate unused globals and symbols to align with Inspectopedia’s unused symbol checks.citeturn3search11
- **External lint parity** – JetBrains can surface ESLint, StandardJS, or JSHint violations directly; keep generated code compatible with those linters.citeturn7search5

## Codex CLI Usage
1. Treat each bullet above as a “must confirm” item when proposing JS/TS changes. Inline comments should call out where the code satisfies or intentionally violates these inspections.
2. When a violation is unavoidable, annotate the snippet with the matching JetBrains suppression comment (for example, `// noinspection JSIgnoredPromiseFromCall`) so the intent remains explicit.citeturn6search0
3. Prefer running the project’s existing lint command (`npm run lint`, `pnpm lint`, etc.) after generation; this aligns with JetBrains’ Code quality tools integration and catches overlapping issues early.citeturn7search5
