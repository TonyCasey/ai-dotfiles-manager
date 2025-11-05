const path = require('path');

function generateCodexGuide(language = 'typescript') {
  const langDir = language === 'javascript' ? 'typescript' : language;
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
  lines.push('');
  lines.push('Note: This section is managed by ai-dotfiles-manager. You may add content above or below; changes inside markers may be overwritten on update.');
  lines.push('<!-- ai-dotfiles-manager:codex-guide:end -->');
  return lines.join('\n');
}

module.exports = { generateCodexGuide };
