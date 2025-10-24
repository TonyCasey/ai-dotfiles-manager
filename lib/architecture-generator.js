/**
 * Architecture Document Generator
 * 
 * Generates project architecture documentation based on project structure
 * and dependencies. Used by session hooks and setup process.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate architecture documentation for the current project
 * @param {string} language - Programming language (typescript, javascript, python, etc.)
 * @returns {string} Generated architecture markdown content
 */
function generateArchitectureDoc(language) {
  const projectName = path.basename(process.cwd());

  // Analyze project structure
  const hasPackageJson = fs.existsSync(path.join(process.cwd(), 'package.json'));
  const hasSrc = fs.existsSync(path.join(process.cwd(), 'src'));
  const hasTests = fs.existsSync(path.join(process.cwd(), 'tests')) ||
                   fs.existsSync(path.join(process.cwd(), 'test')) ||
                   fs.existsSync(path.join(process.cwd(), '__tests__'));

  let framework = 'Unknown';
  let dependencies = [];

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
      dependencies = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {})
      ];

      // Detect framework
      if (dependencies.includes('next')) framework = 'Next.js';
      else if (dependencies.includes('react')) framework = 'React';
      else if (dependencies.includes('vue')) framework = 'Vue';
      else if (dependencies.includes('express')) framework = 'Express';
      else if (dependencies.includes('nestjs')) framework = 'NestJS';
      else if (dependencies.includes('fastify')) framework = 'Fastify';
      else if (dependencies.includes('angular')) framework = 'Angular';
      else if (dependencies.includes('svelte')) framework = 'Svelte';
    } catch (error) {
      // Ignore parse errors
    }
  }

  // Scan directory structure
  const srcDirs = [];
  if (hasSrc) {
    try {
      const srcContents = fs.readdirSync(path.join(process.cwd(), 'src'));
      srcDirs.push(...srcContents.filter(item => {
        const stat = fs.statSync(path.join(process.cwd(), 'src', item));
        return stat.isDirectory();
      }));
    } catch (error) {
      // Ignore read errors
    }
  }

  // Check for Clean Architecture layers
  const hasDomain = srcDirs.includes('domain');
  const hasApplication = srcDirs.includes('application');
  const hasInfrastructure = srcDirs.includes('infrastructure');

  return `# ${projectName} - Architecture Overview

> Auto-generated architecture overview for AI context loading

## Project Information

- **Language**: ${language}
- **Framework**: ${framework}
- **Architecture**: ${hasDomain && hasApplication && hasInfrastructure ? 'Clean Architecture (3-layer)' : 'Custom'}
- **Last Updated**: ${new Date().toISOString().split('T')[0]}

## Directory Structure

\`\`\`
${projectName}/
${hasSrc ? '├── src/                    # Source code' : ''}
${srcDirs.includes('domain') ? '│   ├── domain/              # Core business logic' : ''}
${srcDirs.includes('application') ? '│   ├── application/         # Use cases & services' : ''}
${srcDirs.includes('infrastructure') ? '│   ├── infrastructure/      # External integrations' : ''}
${srcDirs.includes('interfaces') ? '│   ├── interfaces/           # API interfaces' : ''}
${srcDirs.includes('components') ? '│   ├── components/           # UI components' : ''}
${srcDirs.includes('utils') ? '│   ├── utils/                 # Utility functions' : ''}
${srcDirs.includes('services') ? '│   ├── services/              # Business services' : ''}
${srcDirs.includes('controllers') ? '│   ├── controllers/          # Request handlers' : ''}
${srcDirs.includes('models') ? '│   ├── models/                # Data models' : ''}
${srcDirs.includes('config') ? '│   ├── config/                # Configuration' : ''}
${hasTests ? '├── tests/                  # Test files' : ''}
${hasPackageJson ? '├── package.json           # Dependencies' : ''}
${fs.existsSync('.dev/') ? '├── .dev/                   # Developer workspace' : ''}
${fs.existsSync('.gitignore') ? '├── .gitignore              # Git ignore rules' : ''}
\`\`\`

## Key Technologies

${dependencies.length > 0 ? dependencies.slice(0, 10).map(dep => `- ${dep}`).join('\n') : '- (Add key technologies here)'}

## Architecture Principles

${hasDomain && hasApplication && hasInfrastructure ? `
This project follows **Clean Architecture** with three layers:

1. **Domain Layer** (src/domain/)
   - Business entities and interfaces
   - Domain errors
   - No external dependencies

2. **Application Layer** (src/application/)
   - Business logic and use cases
   - Service implementations
   - Depends only on Domain

3. **Infrastructure Layer** (src/infrastructure/)
   - External integrations (databases, APIs)
   - Repository implementations
   - Depends on Application and Domain
` : `
This project follows a **custom architecture** pattern.
Consider adopting Clean Architecture for better separation of concerns.
`}

## Key Patterns

${hasDomain && hasApplication && hasInfrastructure ? `
- **Repository Pattern**: All data access through repositories
- **Dependency Injection**: Constructor injection for all dependencies
- **Interface Segregation**: One focused interface per file
- **Domain Errors**: Specific error classes with HTTP status codes
` : `
- **Modular Design**: Separate concerns into different modules
- **Single Responsibility**: Each module has a single purpose
- **Dependency Management**: Clear dependencies between modules
`}

## Development Workflow

### Session Management
- **Session Start**: Rules and context loaded from \`.dev/rules/\`
- **Session End**: Completed tasks automatically committed
- **Todo Tracking**: Use \`.dev/todo.md\` for task management

### Code Quality
- **Clean Code**: Follow established coding standards
- **Testing**: Write tests for all new features
- **Documentation**: Keep documentation up to date

## Notes

*Use this document to add project-specific architectural decisions, conventions, and important context for AI assistants.*

### Custom Rules
- Project-specific rules are in \`.dev/rules/.local/\`
- These override the shared rules from templates
- Add custom architectural decisions here

### AI Context
- All rules in \`.dev/rules/\` are automatically loaded
- Project structure is analyzed and documented here
- Todo items are tracked and committed automatically

---

*This document is automatically updated when the project structure changes.*
`;
}

/**
 * Detect project language based on files and dependencies
 * @returns {string} Detected language
 */
function detectLanguage() {
  // Detect TypeScript
  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    return 'typescript';
  }

  // Detect from package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
        return 'typescript';
      }
      // If no TypeScript, assume JavaScript
      return 'javascript';
    } catch (error) {
      // Ignore parse errors
    }
  }

  // Detect Python
  if (fs.existsSync(path.join(process.cwd(), 'requirements.txt')) ||
      fs.existsSync(path.join(process.cwd(), 'pyproject.toml')) ||
      fs.existsSync(path.join(process.cwd(), 'setup.py')) ||
      fs.existsSync(path.join(process.cwd(), 'Pipfile'))) {
    return 'python';
  }

  // Detect Go
  if (fs.existsSync(path.join(process.cwd(), 'go.mod'))) {
    return 'go';
  }

  // Default to JavaScript
  return 'javascript';
}

module.exports = {
  generateArchitectureDoc,
  detectLanguage
};