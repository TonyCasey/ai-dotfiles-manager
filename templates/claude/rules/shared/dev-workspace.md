# Developer Workspace (.dev/)

## Context Loading

At the **start of every new session**, load the contents of the `.dev/` folder:

1. **Load `.dev/architecture.md`**
   - Provides project structure overview
   - Lists key technologies and frameworks
   - Explains architectural patterns in use
   - Auto-generated and kept up-to-date

2. **Load `.dev/todo.md`**
   - Shows current tasks and priorities
   - Lists completed work (checked items)
   - Helps prioritize what to work on next

3. **Load any other `.md` files in `.dev/`**
   - Developer notes
   - Architectural decisions
   - Research and exploration

## Using .dev/ Context

**When starting a new session:**
- Read `.dev/architecture.md` to understand project structure
- Read `.dev/todo.md` to see current tasks
- Use this context to provide better, project-aware suggestions

**When helping with tasks:**
- Reference the todo list when suggesting what to work on
- Offer to help check off completed items
- Suggest adding new tasks based on the conversation

**When explaining architecture:**
- Reference the architecture.md for current state
- Suggest updates if architecture.md is outdated
- Use the documented patterns and conventions

## Todo List Format

The todo.md uses standard markdown checkboxes:

```markdown
## Current Sprint

- [ ] Pending task
- [x] Completed task
```

**When a task is completed:**
- Simply change `[ ]` to `[x]`
- No need to move to "Completed" section
- No need to add explanations or timestamps
- Keep it simple: just check it off

## File Locations

All .dev/ files are in the project root:
- `/Users/tony.casey/Repos/ai/.dev/architecture.md`
- `/Users/tony.casey/Repos/ai/.dev/todo.md`
- `/Users/tony.casey/Repos/ai/.dev/README.md`

## Purpose

The .dev/ folder provides **immediate project context** so AI assistants can:
- Understand the project structure instantly
- See what the developer is currently working on
- Provide more relevant and contextual suggestions
- Help manage tasks and track progress

Think of .dev/ as the **developer's personal workspace** that gives AI assistants the context they need to be truly helpful.
