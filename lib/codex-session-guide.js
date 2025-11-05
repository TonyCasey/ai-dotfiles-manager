const path = require('path');

function generateCodexGuide(language = 'typescript', options = {}) {
  const langDir = language === 'javascript' ? 'typescript' : language;
  const files = options.files || {};
  const listExamples = Array.isArray(files.shared) || Array.isArray(files.language) || Array.isArray(files.local);
  // Default to TS rules layout for JS since TS rules are generally applicable
  const lines = [];
  lines.push('<!-- ai-dotfiles-manager:codex-guide:start -->');
  lines.push('# Codex Session Guide');
  lines.push('');
  lines.push('On session start, load and keep the following files in working memory:');
  lines.push('');
  lines.push('- `.dev/architecture.md`');
  lines.push('- `.dev/todo.md` (if present)');
  lines.push('- `.dev/rules/shared/*.md`');
  lines.push(`- \`.dev/rules/${langDir}/*.md\` (if present)`);
  lines.push('- `.dev/rules/.local/*.md` (project-specific overrides)');
  lines.push('');
  lines.push('- Manifest: `.dev/codex-manifest.json` (authoritative load order)');
  lines.push('- Index: `.dev/context-index.md` (links to key context)');
  lines.push('');
  lines.push('Rules precedence: `.local` > language > shared.');
  lines.push('');
  lines.push('Codex working agreement (from CLI reference):');
  lines.push('- Start tool use with a 1–2 sentence preamble.');
  lines.push('- Use `update_plan` for multi-step tasks; keep steps short.');
  lines.push('- Prefer `rg` for search; read files in ≤250-line chunks.');
  lines.push('- Use `apply_patch` for edits; avoid destructive commands.');
  lines.push('- File references: backticked paths with optional :line, no ranges.');
  lines.push('- Final answers: concise, structured bullets; headers only when helpful.');
  lines.push('');
  lines.push('Key expectations for this repository:');
  lines.push('- Follow Clean Architecture and Repository Pattern from rules.');
  lines.push('- Prefer pure functions; isolate IO to scripts/ and bin/.');
  lines.push('- Maintain test coverage ≥ 70% (see `jest.config.js`).');
  lines.push('- Offer fixes that update docs or scripts when behavior changes.');
  lines.push('');
  lines.push('Assistant behavior:');
  lines.push('- Propose changes that align with loaded rules.');
  lines.push('- When generating files, mirror naming and folder conventions.');
  lines.push('- Surface any conflicts between `.local` and shared rules.');
  if (listExamples) {
    lines.push('');
    lines.push('Example rules (not exhaustive):');
    const maxItems = 6;
    const sample = [];
    (files.shared || []).slice(0, 2).forEach(p => sample.push(`- ${p}`));
    (files.language || []).slice(0, 2).forEach(p => sample.push(`- ${p}`));
    (files.local || []).slice(0, 2).forEach(p => sample.push(`- ${p}`));
    lines.push(...sample.slice(0, maxItems));
  }
  lines.push('');
  lines.push('Note: This section is managed by ai-dotfiles-manager. You may add content above or below; changes inside markers may be overwritten on update.');
  lines.push('<!-- ai-dotfiles-manager:codex-guide:end -->');
  return lines.join('\n');
}

module.exports = { generateCodexGuide };
