Run comprehensive TypeScript and code quality checks on the project, including TypeScript compiler, ESLint, and IntelliJ IDEA inspections.

**IMPORTANT**: Before writing any new TypeScript code, check this first to ensure you understand the existing type issues.

Execute the following steps:

1. **Run TypeScript Compiler Check**:
   ```bash
   npx tsc --noEmit
   ```

2. **Run ESLint Check** (catches issues IntelliJ shows):
   ```bash
   npx eslint "src/**/*.ts" --format compact || npx eslint . --ext .ts --format compact
   ```

   If ESLint is not installed, skip this step and note it in the output.

3. **Check for IntelliJ IDEA Project**:
   - Look for `.idea/` directory in the project root
   - If found, note that IntelliJ inspections can be run via:
     - **Manual**: Code → Inspect Code in IntelliJ
     - **CLI**: Using IntelliJ's `inspect` command (if available)

4. If there are errors, analyze and categorize them:
   - Count total number of errors
   - Identify the most common error types (TS2532, TS2345, etc.)
   - List the files with the most errors
   - Provide specific examples of the errors

5. Display results in this format:

```
╔════════════════════════════════════════════════════════════╗
║         TypeScript & Code Quality Check Results           ║
╚════════════════════════════════════════════════════════════╝

📊 TYPESCRIPT COMPILER (tsc):
─────────────────────────────────────────────────────────
Total Errors: [X]

🔴 TS ERROR BREAKDOWN:
  TS2532 (Object possibly undefined): [X] errors
  TS2345 (Type not assignable): [X] errors
  [Other error codes...]: [X] errors

📊 ESLINT:
─────────────────────────────────────────────────────────
Total Issues: [X] errors, [Y] warnings
[or "ESLint not configured" if not installed]

🔴 ESLINT ERROR BREAKDOWN:
  @typescript-eslint/no-explicit-any: [X] issues
  @typescript-eslint/no-unused-vars: [X] issues
  [Other rules...]: [X] issues

📊 INTELLIJ IDEA:
─────────────────────────────────────────────────────────
[If .idea/ directory found:]
  ✓ IntelliJ project detected
  💡 Additional inspections available via:
     - IntelliJ UI: Code → Inspect Code
     - CLI: See below for command

[If .idea/ not found:]
  ⓘ Not an IntelliJ project

📁 FILES WITH MOST ISSUES:
─────────────────────────────────────────────────────────
1. [file-path]: [X] TypeScript + [Y] ESLint errors
2. [file-path]: [X] TypeScript + [Y] ESLint errors
3. [file-path]: [X] TypeScript + [Y] ESLint errors

🔧 SAMPLE ERRORS:
─────────────────────────────────────────────────────────
[Show 3-5 example errors from both tsc and ESLint with file:line]

💡 RECOMMENDATIONS:
─────────────────────────────────────────────────────────
[Based on error types, suggest fixes:]
- Add null checks before accessing potentially undefined values
- Use optional chaining (?.) for nested property access
- Add type guards for union types
- Remove unused variables/imports
- Replace 'any' types with specific types
- etc.

📋 INTELLIJ INSPECTION COMMAND (if needed):
─────────────────────────────────────────────────────────
To run full IntelliJ inspections from CLI:
  idea inspect <project-path> <inspection-profile> <output-path>

Or view current Problems in IntelliJ:
  View → Tool Windows → Problems (Alt+6)
```

6. If NO errors found in either check, display:
```
✅ TypeScript compilation successful - no type errors!
✅ ESLint checks passed - no code quality issues!
```

**IMPORTANT NOTES**:
- **TypeScript (tsc)**: Catches type errors, null/undefined issues
- **ESLint**: Catches code quality issues, unused vars, 'any' usage, etc.
- **IntelliJ**: May show additional inspections not caught by tsc/ESLint

After seeing these errors, I will write code that:
1. Properly handles undefined/null values
2. Avoids 'any' types
3. Removes unused imports/variables
4. Follows all patterns in .dev/rules/typescript/coding-standards.md

**Configuration Reference:**
- See `.dev/rules/typescript/typescript-config-guide.md` for comprehensive configuration guidance
- Learn when to use relaxed vs. strict TypeScript settings
- Understand common configuration issues that cause 300+ errors

**For IntelliJ Users**:
The Problems view (Alt+6) in IntelliJ shows:
- All TypeScript errors (same as `tsc`)
- ESLint errors/warnings (if configured)
- IntelliJ-specific inspections (code smells, optimizations)

Running this command covers most issues IntelliJ shows. For IntelliJ-specific inspections, check the Problems view directly.
