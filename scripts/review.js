#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

/**
 * Code Review Analysis Engine
 * Analyzes TypeScript projects for Clean Architecture violations
 */

class CodeReviewer {
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      detailed: options.detailed || false,
      fix: options.fix || false,
      format: options.format || 'console', // console, json, html
    };

    this.violations = {
      errors: [],
      warnings: [],
      info: [],
    };

    this.stats = {
      filesScanned: 0,
      totalViolations: 0,
    };

    this.srcPath = path.join(projectRoot, 'src');
    this.fileCache = new Map(); // Cache parsed files
  }

  /**
   * Main entry point for code review
   */
  async analyze() {
    console.log('🔍 Starting code review analysis...\n');

    // Check if src directory exists
    if (!fs.existsSync(this.srcPath)) {
      console.error(`❌ Error: src directory not found at ${this.srcPath}`);
      process.exit(1);
    }

    // Step 1: Traverse and collect all TypeScript files
    const files = this.collectTypeScriptFiles(this.srcPath);
    console.log(`📁 Found ${files.length} TypeScript files\n`);

    // Step 2: Parse all files and build AST cache
    await this.parseFiles(files);

    // Step 3: Run all checks
    await this.runChecks(files);

    // Step 4: Generate report
    this.generateReport();

    return this.violations;
  }

  /**
   * Recursively collect all TypeScript files
   */
  collectTypeScriptFiles(dir) {
    const files = [];

    const traverse = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules, dist, build, etc.
          if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry.name)) {
            traverse(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          // Skip declaration files
          if (!entry.name.endsWith('.d.ts')) {
            files.push(fullPath);
          }
        }
      }
    };

    traverse(dir);
    return files;
  }

  /**
   * Parse all TypeScript files and cache their ASTs
   */
  async parseFiles(files) {
    console.log('🔧 Parsing TypeScript files...\n');

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const sourceFile = ts.createSourceFile(
          file,
          content,
          ts.ScriptTarget.Latest,
          true
        );

        this.fileCache.set(file, {
          sourceFile,
          content,
          imports: this.extractImports(sourceFile),
          exports: this.extractExports(sourceFile),
          classes: this.extractClasses(sourceFile),
          interfaces: this.extractInterfaces(sourceFile),
        });

        this.stats.filesScanned++;
      } catch (error) {
        this.addViolation('error', file, null, 'PARSE_ERROR', `Failed to parse file: ${error.message}`);
      }
    }
  }

  /**
   * Extract import statements from AST
   */
  extractImports(sourceFile) {
    const imports = [];

    const visit = (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          imports.push({
            module: moduleSpecifier.text,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return imports;
  }

  /**
   * Extract export statements from AST
   */
  extractExports(sourceFile) {
    const exports = [];

    const visit = (node) => {
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        exports.push({
          node,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        });
      } else if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        const name = node.name?.getText(sourceFile) || 'unknown';
        exports.push({
          name,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        });
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return exports;
  }

  /**
   * Extract class declarations from AST
   */
  extractClasses(sourceFile) {
    const classes = [];

    const visit = (node) => {
      if (ts.isClassDeclaration(node)) {
        const name = node.name?.getText(sourceFile) || 'anonymous';
        const hasConstructor = node.members.some(m => ts.isConstructorDeclaration(m));
        const constructor = node.members.find(m => ts.isConstructorDeclaration(m));

        classes.push({
          name,
          node,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          hasConstructor,
          constructor,
          implements: node.heritageClauses?.find(c => c.token === ts.SyntaxKind.ImplementsKeyword)?.types || [],
          extends: node.heritageClauses?.find(c => c.token === ts.SyntaxKind.ExtendsKeyword)?.types || [],
        });
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return classes;
  }

  /**
   * Extract interface declarations from AST
   */
  extractInterfaces(sourceFile) {
    const interfaces = [];

    const visit = (node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText(sourceFile);
        interfaces.push({
          name,
          node,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          extends: node.heritageClauses || [],
        });
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return interfaces;
  }

  /**
   * Run all architecture checks
   */
  async runChecks(files) {
    console.log('✅ Running architecture checks...\n');

    // Check 1: Layer violations
    this.checkLayerViolations(files);

    // Check 2: Interface conventions
    this.checkInterfaceConventions(files);

    // Check 3: Repository pattern
    this.checkRepositoryPattern(files);

    // Check 4: Service pattern
    this.checkServicePattern(files);

    // Check 5: Domain errors
    this.checkDomainErrors(files);

    // Check 6: TypeScript quality
    this.checkTypeScriptQuality(files);

    console.log('✅ Analysis complete\n');
  }

  /**
   * Check for layer violations (domain importing infrastructure, etc.)
   */
  checkLayerViolations(files) {
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      const layer = this.getLayer(file);
      if (!layer) continue;

      for (const imp of cached.imports) {
        const importedLayer = this.getLayerFromImport(imp.module, file);

        // Domain cannot import from application or infrastructure
        if (layer === 'domain' && (importedLayer === 'application' || importedLayer === 'infrastructure')) {
          this.addViolation(
            'error',
            file,
            imp.line,
            'LAYER_VIOLATION',
            `Domain layer cannot import from ${importedLayer} layer (import: ${imp.module})`
          );
        }

        // Application cannot import from infrastructure
        if (layer === 'application' && importedLayer === 'infrastructure') {
          this.addViolation(
            'error',
            file,
            imp.line,
            'LAYER_VIOLATION',
            `Application layer cannot import from infrastructure layer (import: ${imp.module})`
          );
        }
      }
    }
  }

  /**
   * Check interface naming conventions
   */
  checkInterfaceConventions(files) {
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      for (const iface of cached.interfaces) {
        // Check if interface starts with 'I'
        if (!iface.name.startsWith('I')) {
          this.addViolation(
            'warning',
            file,
            iface.line,
            'INTERFACE_NAMING',
            `Interface '${iface.name}' should be prefixed with 'I' (e.g., I${iface.name})`
          );
        }

        // Check if file name matches interface name
        const fileName = path.basename(file, '.ts');
        if (cached.interfaces.length === 1 && fileName !== iface.name) {
          this.addViolation(
            'warning',
            file,
            iface.line,
            'FILE_NAMING',
            `File name '${fileName}.ts' should match interface name '${iface.name}.ts'`
          );
        }

        // Check for multiple interfaces in one file
        if (cached.interfaces.length > 1) {
          this.addViolation(
            'info',
            file,
            null,
            'MULTIPLE_INTERFACES',
            `File contains ${cached.interfaces.length} interfaces. Consider splitting into separate files.`
          );
          break; // Only report once per file
        }
      }
    }
  }

  /**
   * Check repository pattern implementation
   */
  checkRepositoryPattern(files) {
    const repositoryInterfaces = [];
    const repositoryImplementations = [];

    // Find all repository interfaces and implementations
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      // Find repository interfaces
      for (const iface of cached.interfaces) {
        if (iface.name.includes('Repository')) {
          repositoryInterfaces.push({ file, interface: iface });

          // Check if repository interface is in domain layer
          if (!file.includes('/domain/')) {
            this.addViolation(
              'error',
              file,
              iface.line,
              'REPOSITORY_LOCATION',
              `Repository interface '${iface.name}' should be in domain/interfaces/`
            );
          }
        }
      }

      // Find repository implementations
      for (const cls of cached.classes) {
        if (cls.name.includes('Repository')) {
          repositoryImplementations.push({ file, class: cls });

          // Check if repository implementation is in infrastructure layer
          if (!file.includes('/infrastructure/repositories/')) {
            this.addViolation(
              'error',
              file,
              cls.line,
              'REPOSITORY_LOCATION',
              `Repository implementation '${cls.name}' should be in infrastructure/repositories/`
            );
          }

          // Check if repository uses constructor injection
          if (!cls.hasConstructor) {
            this.addViolation(
              'warning',
              file,
              cls.line,
              'REPOSITORY_DI',
              `Repository '${cls.name}' should use constructor injection for dependencies`
            );
          }
        }
      }
    }
  }

  /**
   * Check service pattern implementation
   */
  checkServicePattern(files) {
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      // Find service interfaces
      for (const iface of cached.interfaces) {
        if (iface.name.includes('Service')) {
          // Check if service interface is in application layer
          if (!file.includes('/application/')) {
            this.addViolation(
              'warning',
              file,
              iface.line,
              'SERVICE_LOCATION',
              `Service interface '${iface.name}' should typically be in application/interfaces/`
            );
          }
        }
      }

      // Find service implementations
      for (const cls of cached.classes) {
        if (cls.name.includes('Service')) {
          // Check for constructor injection
          if (!cls.hasConstructor) {
            this.addViolation(
              'warning',
              file,
              cls.line,
              'SERVICE_DI',
              `Service '${cls.name}' should use constructor injection for dependencies`
            );
          }
        }
      }
    }
  }

  /**
   * Check domain error implementation
   */
  checkDomainErrors(files) {
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      for (const cls of cached.classes) {
        if (cls.name.includes('Error')) {
          // Check if error extends DomainError or Error
          const extendsDomainError = cls.extends.some(e =>
            e.expression?.getText(cached.sourceFile)?.includes('DomainError')
          );
          const extendsError = cls.extends.some(e =>
            e.expression?.getText(cached.sourceFile) === 'Error'
          );

          if (!extendsDomainError && !extendsError) {
            this.addViolation(
              'error',
              file,
              cls.line,
              'ERROR_INHERITANCE',
              `Error class '${cls.name}' should extend DomainError or Error`
            );
          }

          // Recommend using DomainError instead of Error
          if (extendsError && !extendsDomainError && file.includes('/domain/')) {
            this.addViolation(
              'warning',
              file,
              cls.line,
              'USE_DOMAIN_ERROR',
              `Error class '${cls.name}' should extend DomainError instead of Error`
            );
          }
        }
      }
    }
  }

  /**
   * Check TypeScript code quality
   */
  checkTypeScriptQuality(files) {
    for (const file of files) {
      const cached = this.fileCache.get(file);
      if (!cached) continue;

      // Check for usage of 'any' type
      const anyMatches = cached.content.match(/:\s*any(\s|;|,|\))/g);
      if (anyMatches) {
        this.addViolation(
          'warning',
          file,
          null,
          'ANY_TYPE',
          `Found ${anyMatches.length} usage(s) of 'any' type. Consider using specific types.`
        );
      }
    }
  }

  /**
   * Determine which layer a file belongs to
   */
  getLayer(file) {
    const relativePath = path.relative(this.srcPath, file);
    if (relativePath.startsWith('domain/')) return 'domain';
    if (relativePath.startsWith('application/')) return 'application';
    if (relativePath.startsWith('infrastructure/')) return 'infrastructure';
    if (relativePath.startsWith('utils/')) return 'utils';
    return null;
  }

  /**
   * Determine layer from import path
   */
  getLayerFromImport(importPath, currentFile) {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(currentFile);
      const resolvedPath = path.resolve(currentDir, importPath);
      return this.getLayer(resolvedPath);
    }

    // Handle absolute imports from src
    if (importPath.includes('/domain/')) return 'domain';
    if (importPath.includes('/application/')) return 'application';
    if (importPath.includes('/infrastructure/')) return 'infrastructure';
    if (importPath.includes('/utils/')) return 'utils';

    return null; // External package
  }

  /**
   * Add a violation to the report
   */
  addViolation(severity, file, line, code, message) {
    const violation = {
      file: path.relative(this.projectRoot, file),
      line,
      code,
      message,
    };

    this.violations[severity === 'error' ? 'errors' : severity === 'warning' ? 'warnings' : 'info'].push(violation);
    this.stats.totalViolations++;
  }

  /**
   * Generate and display the report
   */
  generateReport() {
    const chalk = require('chalk');

    console.log(chalk.blue.bold('\n📊 Code Review Report\n'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log('');

    // Summary statistics
    console.log(chalk.bold('Summary:'));
    console.log(chalk.gray(`  Files scanned: ${this.stats.filesScanned}`));
    console.log(chalk.red(`  Errors: ${this.violations.errors.length}`));
    console.log(chalk.yellow(`  Warnings: ${this.violations.warnings.length}`));
    console.log(chalk.blue(`  Info: ${this.violations.info.length}`));
    console.log(chalk.gray(`  Total violations: ${this.stats.totalViolations}`));
    console.log('');

    // Display errors
    if (this.violations.errors.length > 0) {
      console.log(chalk.red.bold('❌ Errors:\n'));
      for (const v of this.violations.errors) {
        const location = v.line ? `${v.file}:${v.line}` : v.file;
        console.log(chalk.red(`  ${location}`));
        console.log(chalk.gray(`    [${v.code}] ${v.message}`));
        console.log('');
      }
    }

    // Display warnings
    if (this.violations.warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠️  Warnings:\n'));
      for (const v of this.violations.warnings) {
        const location = v.line ? `${v.file}:${v.line}` : v.file;
        console.log(chalk.yellow(`  ${location}`));
        console.log(chalk.gray(`    [${v.code}] ${v.message}`));
        console.log('');
      }
    }

    // Display info
    if (this.options.detailed && this.violations.info.length > 0) {
      console.log(chalk.blue.bold('ℹ️  Info:\n'));
      for (const v of this.violations.info) {
        const location = v.line ? `${v.file}:${v.line}` : v.file;
        console.log(chalk.blue(`  ${location}`));
        console.log(chalk.gray(`    [${v.code}] ${v.message}`));
        console.log('');
      }
    }

    console.log(chalk.gray('─'.repeat(80)));

    // Final result
    if (this.violations.errors.length === 0 && this.violations.warnings.length === 0) {
      console.log(chalk.green.bold('\n✅ No violations found! Code looks good.\n'));
    } else {
      console.log(chalk.yellow.bold(`\n⚠️  Found ${this.stats.totalViolations} violation(s)\n`));
    }
  }
}

module.exports = CodeReviewer;
