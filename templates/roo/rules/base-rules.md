---
type: "manual"
---

# Development Standards and Best Practices

## Session Initialization Rules

### 1. Load Developer Workspace (.dev/)
**At the start of EVERY new session**, load these files for project context:
- `.dev/architecture.md` - Auto-generated project structure, technologies, patterns
- `.dev/todo.md` - Current tasks and priorities
- Any other `.md` files in `.dev/` - Developer notes, decisions

**Use this context to:**
- Understand what the developer is currently working on
- Provide project-aware suggestions
- Help prioritize tasks from the todo list
- Reference documented architectural decisions

### 2. Start of Session Checklist
- **LOAD** .dev/ folder contents (architecture.md, todo.md)
- **REVIEW** project architecture from .dev/architecture.md
- **CHECK** pending tasks in .dev/todo.md
- Understand the Clean Architecture layers and SOLID principles
- Verify the current branch and working directory state

### 3. Context Understanding
- **USE** .dev/architecture.md for project-specific patterns
- **REFERENCE** .dev/todo.md when suggesting what to work on
- Understand layer boundaries and dependencies
- Follow established patterns and conventions documented in .dev/

## File Management Rules

### 1. File Updates vs New Files
- **PREFER UPDATING** existing files over creating new ones
- **NEVER** create versioned files like `file-v2.ts`, `file-new.ts`
- If major restructuring is needed, discuss with the user first
- Use targeted edits and maintain consistency

### 2. TypeScript Compilation
- **NEVER** commit compiled `.js` files from TypeScript source
- Only `.ts` files should exist in the source tree
- Always ensure TypeScript compilation is passing
- Run `npx tsc --noEmit` to verify no errors

### 3. Documentation Updates
- **UPDATE** relevant documentation when making changes
- Include usage examples in code comments
- Keep documentation concise and practical
- Update interface documentation when contracts change

## Development Workflow

### 1. Before Implementation
- [ ] Understand the requirement
- [ ] Review architectural rules
- [ ] Check for existing patterns to follow
- [ ] Plan the implementation approach

### 2. During Development
- [ ] Follow SOLID principles
- [ ] Write tests first (TDD approach)
- [ ] Use dependency injection
- [ ] Implement proper error handling
- [ ] Follow existing patterns and conventions

### 3. Before Committing
- [ ] Run all tests to ensure nothing is broken
- [ ] Compile TypeScript to check for errors
- [ ] Review changes for architecture violations
- [ ] Update documentation if needed

## Quality Standards

### Code Quality
- **STRICTLY FOLLOW** SOLID principles in all implementations
- Use dependency injection for all service dependencies
- Implement interfaces for all external dependencies
- Use TypeScript strict mode and NEVER use `any` types

### Testing Requirements
- **WRITE TESTS** for new features and bug fixes
- Follow the testing pyramid (more unit tests, fewer integration tests)
- Mock external dependencies in unit tests
- Maintain high test coverage

### Error Handling
- **ALWAYS** handle errors appropriately
- Use domain-specific error classes
- Provide meaningful error messages
- Log errors with sufficient context

These rules ensure consistent, clean, and maintainable development practices while keeping the project organized and following Clean Architecture principles.
