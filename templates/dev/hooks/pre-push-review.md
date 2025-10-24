# Pre-Push Review Hook

**IMPORTANT: This hook is automatically triggered when a user asks Claude to push changes to the remote repository.**

## When This Hook Triggers

This hook activates when the user requests any of the following:
- "Push my changes"
- "Push to remote"
- "git push"
- "Can you push this?"
- "Push to origin"
- Any similar push-related requests

## Hook Behavior

Before executing a push command, Claude must:

1. **Run the Pre-PR Review**
   ```
   Execute the /review-changes command (or the content from review-changes.md)
   ```

2. **Analyze the Review Results**
   - Identify any critical issues (🔴)
   - Note warnings (🟡)
   - Check for breaking changes
   - Verify tests pass

3. **Decision Point**

   **If Critical Issues Found (🔴):**
   - ❌ **DO NOT PUSH**
   - Present the issues to the user
   - Explain why the push should be blocked
   - Offer to fix the issues first
   - Example: "I found [X] critical issues that should be fixed before pushing. Would you like me to fix them first?"

   **If Warnings Found (🟡):**
   - ⚠️ **ASK USER**
   - Present the warnings
   - Ask user if they want to proceed or fix first
   - Example: "I found [X] warnings. Would you like to proceed with the push or address them first?"

   **If No Issues (✅):**
   - ✅ **PROCEED WITH PUSH**
   - Show a summary of what will be pushed
   - Execute the push command
   - Example: "Review looks good! Pushing [X] commits with [Y] changes."

4. **Present Review Summary**

   Before pushing, always show:
   ```
   📊 Pre-Push Review Summary:
   • Files Changed: [count]
   • Commits: [count]
   • Tests: [Pass/Fail/Unknown]
   • Critical Issues: [count]
   • Warnings: [count]
   • Architecture: [✅/⚠️/❌]
   ```

5. **Execute Push (if approved)**
   ```bash
   git push [options]
   ```

6. **Post-Push Actions**
   - Confirm push success
   - Show the remote URL
   - Suggest creating a PR if applicable

## Critical Issue Examples

Block push if any of these are found:
- 🔴 Exposed secrets or API keys
- 🔴 Failing tests
- 🔴 TypeScript/linting errors
- 🔴 Breaking changes without documentation
- 🔴 Security vulnerabilities
- 🔴 Incomplete implementations (TODO/FIXME in critical paths)
- 🔴 Architecture violations (wrong dependency flow)

## Warning Examples

Ask user before pushing if these are found:
- 🟡 Missing tests for new features
- 🟡 Missing documentation
- 🟡 console.log or debug statements
- 🟡 Commented-out code
- 🟡 Large refactoring without tests
- 🟡 Dependency updates without testing
- 🟡 Missing CHANGELOG entries

## User Override

If the user insists on pushing despite issues:
- Confirm they want to proceed: "Are you sure you want to push with [X] issues?"
- If confirmed, proceed with push
- Log a warning in the output

## Edge Cases

### No Remote Configured
```
⚠️ No remote repository configured. Would you like to add one first?
```

### Uncommitted Changes
```
⚠️ You have uncommitted changes. Would you like to commit them first?
```

### Branch Not Tracking Remote
```
⚠️ Current branch doesn't track a remote branch.
Would you like to set upstream with: git push -u origin [branch]?
```

### Behind Remote
```
⚠️ Your branch is behind the remote. Would you like to pull first?
```

### Merge Conflicts
```
❌ Merge conflicts detected. Please resolve conflicts before pushing.
```

## Example Workflow

```
User: "Can you push my changes?"

Claude:
1. "Let me review the changes before pushing..."
2. [Executes /review-changes command]
3. [Analyzes results]
4. [Shows summary]
5. Decision:
   - If issues: "Found [X] issues. Here's what I found: ..."
   - If clean: "Review looks good! Pushing now..."
6. [Executes push if approved]
7. "✅ Successfully pushed [X] commits to origin/[branch]"
```

## Configuration

This hook is enabled by default when using `ai-dotfiles-manager setup`.

To disable this hook, users can modify their `.claude/settings.json`:
```json
{
  "hooks": {
    "prePush": {
      "enabled": false
    }
  }
}
```

## Technical Details

**Implementation Location:** This hook is implemented as part of Claude's command processing logic.

**Review Command:** References `/review-changes` command at `.claude/commands/review-changes.md`

**Execution Order:**
1. User request detected
2. Pre-push hook triggered
3. Review executed
4. Results analyzed
5. User prompt (if needed)
6. Push executed (if approved)

---

## Developer Notes

This hook helps prevent:
- Pushing broken code
- Exposing secrets
- Creating PRs with obvious issues
- Forgetting to update documentation
- Bypassing code quality checks

The goal is to catch issues before they reach the PR review stage, saving time and improving code quality.
