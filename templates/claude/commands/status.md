Display the current session status with the following information:

1. Read and analyze the following files if they exist:
   - `.dev/todo.md` - parse to count pending [ ] and completed [x] tasks, and extract the first unchecked task under "Current Sprint" or similar section
   - Run `git status --porcelain` to check for uncommitted changes

2. Display the session status using this exact format:

```
╔════════════════════════════════════════════════════════════╗
║                  📊 Session Status                         ║
╚════════════════════════════════════════════════════════════╝

📁 Project: [project name from current directory]
⏰ Time: [current time]

📋 CONTEXT LOADED:
─────────────────────────────────────────────────────────
✅ todo.md ([X] pending, [Y] completed)
[✅ Working directory clean OR ⚠️  X uncommitted change(s)]

🎯 CURRENT TASK:
─────────────────────────────────────────────────────────
   [Current task from todo.md or "No active task"]

╔════════════════════════════════════════════════════════════╗
║  ✅ All context loaded - Ready to assist!                  ║
╚════════════════════════════════════════════════════════════╝
```

Use the actual project data to fill in the bracketed placeholders. Make the output visually appealing and easy to scan.
