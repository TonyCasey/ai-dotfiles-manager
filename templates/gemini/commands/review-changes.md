# Pre-PR Review Command

You are performing a comprehensive pre-PR review of code changes before they are pushed to the remote repository.

## Objectives

Analyze all changes in the current branch compared to the main branch and provide:
1. A summary of changes
2. Code quality assessment
3. Architecture compliance check
4. Potential issues and risks
5. Recommendations for improvements

## Review Process

### Step 1: Get the Changes

Run these commands in parallel to gather information:
```bash
# Get the base branch name (usually main or master)
git remote show origin | grep "HEAD branch" | cut -d ":" -f 2 | xargs

# Get current branch name
git branch --show-current

# Get list of changed files
git diff --name-status origin/main...HEAD

# Get the full diff
git diff origin/main...HEAD

# Get commit messages for this branch
git log origin/main..HEAD --oneline

# Check for uncommitted changes
git status --short
```

### Step 2: Analyze File Categories

Categorize changes by type:
- **Source Code**: New features, bug fixes, refactoring
- **Tests**: New tests, test updates, test coverage
- **Configuration**: Config file changes, dependencies
- **Documentation**: README, comments, docs
- **Build/CI**: Build scripts, workflows, pipelines

### Step 3: Code Quality Assessment

Review for:
- [ ] **Clean Architecture Compliance**: Verify layer separation (domain  application  infrastructure)
- [ ] **Type Safety**: Check for `any` types, proper type annotations
- [ ] **Error Handling**: Proper error handling and domain errors
- [ ] **Code Duplication**: Look for repeated code patterns
- [ ] **Naming Conventions**: Consistent naming (interfaces with `I` prefix, etc.)
- [ ] **Comments**: Adequate documentation for complex logic
- [ ] **Magic Numbers**: No hardcoded values without explanation
- [ ] **Function Size**: Functions are focused and not too long
- [ ] **Dependency Injection**: Proper DI usage in constructors

### Step 4: Testing Assessment

Check:
- [ ] **Test Coverage**: Are new features/changes covered by tests?
- [ ] **Test Quality**: Do tests follow AAA pattern (Arrange, Act, Assert)?
- [ ] **Mock Quality**: Are mocks complete and realistic?
- [ ] **Edge Cases**: Are edge cases tested?
- [ ] **Integration Tests**: Are integration points tested?

### Step 5: Breaking Changes Detection

Identify:
- [ ] **API Changes**: Modified interfaces, function signatures
- [ ] **Database Changes**: Schema modifications, migrations needed
- [ ] **Configuration Changes**: New environment variables, config requirements
- [ ] **Dependency Changes**: Updated versions, new dependencies
- [ ] **Removed Features**: Deprecated or removed functionality

### Step 6: Documentation Check

Verify:
- [ ] **README Updates**: Does README reflect new features?
- [ ] **CHANGELOG**: Are changes documented in CHANGELOG?
- [ ] **API Documentation**: Are new APIs documented?
- [ ] **Comments**: Is complex logic explained?
- [ ] **Migration Guides**: Are breaking changes documented?

### Step 7: Security & Performance

Look for:
- [ ] **Security Issues**: Exposed secrets, injection vulnerabilities, unsafe operations
- [ ] **Performance Issues**: N+1 queries, inefficient loops, memory leaks
- [ ] **Resource Leaks**: Unclosed connections, file handles
- [ ] **Rate Limiting**: Proper rate limiting for APIs
- [ ] **Input Validation**: Proper validation of user inputs

## Output Format

Provide a structured review in this format:

```markdown
# Pre-PR Review Report

## Summary
- **Branch**: [current-branch]  [base-branch]
- **Files Changed**: [count]
- **Lines Added**: [count]
- **Lines Removed**: [count]
- **Commits**: [count]

## Changes by Category

### Source Code Changes
- List significant code changes with file paths

### Test Changes
- List test additions/modifications

### Configuration Changes
- List config/dependency changes

### Documentation Changes
- List documentation updates

## Code Quality Assessment

###  Strengths
- List positive aspects of the changes

###  Issues Found
- List issues with severity (=4 Critical, = Warning, =5 Info)

### = Recommendations
- List recommended improvements

## Architecture Compliance

### Clean Architecture
- [/L] Layer separation maintained
- [/L] Dependency flow correct (infra  app  domain)
- [/L] No domain dependencies on external libraries

### Design Patterns
- [/L] Repository pattern followed
- [/L] Dependency injection used correctly
- [/L] Interface segregation maintained

## Testing Assessment

- **Test Coverage**: [Adequate/Insufficient/Missing]
- **Test Quality**: [High/Medium/Low]
- **Missing Tests**: List areas that need tests

## Breaking Changes

- [List any breaking changes found]
- [Migration steps if needed]

## Security & Performance

### Security
- [List security concerns or  No issues found]

### Performance
- [List performance concerns or  No issues found]

## Documentation Status

- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API docs updated
- [ ] Comments adequate

## Pre-Push Checklist

Before pushing, ensure:
- [ ] All tests pass locally
- [ ] Code is linted and formatted
- [ ] No console.log or debug statements
- [ ] No commented-out code
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main
- [ ] No merge conflicts

## Final Recommendation

**[APPROVED / NEEDS CHANGES / BLOCKED]**

[Explanation of recommendation]

---

## Next Steps

[Provide specific action items if changes are needed]
```

## Important Notes

- Be thorough but constructive in your feedback
- Focus on significant issues, not nitpicks
- Provide specific file paths and line numbers when pointing out issues
- Suggest concrete improvements, not just problems
- Consider the context and purpose of the changes
- If you find critical issues (security, breaking changes), highlight them prominently
- Always run the review commands even if the diff is large

## Edge Cases

- **No changes**: If there are no changes, inform the user
- **Uncommitted changes**: Warn about uncommitted changes that won't be in the PR
-- **Large diffs**: Summarize large changes, don't analyze every line
- **Merge conflicts**: Check for and report any conflicts with main branch
- **Failed commands**: If git commands fail, explain what might be wrong (not in a git repo, no remote, etc.)
