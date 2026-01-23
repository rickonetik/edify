#!/usr/bin/env node

/**
 * Quality Gates Verification Script
 * Runs all automated checks for the repository.
 */

import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function runCommand(command, description, silent = false) {
  try {
    info(`Running: ${description}`);
    if (silent) {
      execSync(command, { stdio: 'pipe', cwd: process.cwd() });
    } else {
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    }
    success(`${description} passed`);
    return true;
  } catch (err) {
    error(`${description} failed`);
    return false;
  }
}

function checkCommandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function verifyWorkspace() {
  log('\n📦 Checking workspace...', colors.blue);
  try {
    info('Running: Workspace list');
    const output = execSync('pnpm -r list --depth 0', { encoding: 'utf-8', stdio: 'pipe' });
    const packages = output.match(/@tracked\/\w+/g) || [];
    const uniquePackages = [...new Set(packages)];
    
    if (uniquePackages.length < 4) {
      error(`Expected 4 packages, found ${uniquePackages.length}: ${uniquePackages.join(', ')}`);
      return false;
    }
    
    success(`Workspace list passed (found ${uniquePackages.length} packages)`);
    return true;
  } catch (err) {
    error('Workspace list failed');
    return false;
  }
}

function verifyDeepImports() {
  log('\n🔍 Checking for deep imports...', colors.blue);

  const pattern = '@tracked/shared/src';
  let command;
  let tool;

  if (checkCommandExists('rg')) {
    tool = 'ripgrep (rg)';
    // Only check TS/JS files, exclude docs, comments, and build artifacts
    command = `rg "${pattern}" -n -t ts -t tsx -t js -t jsx --glob '!**/*.md' --glob '!**/*.mdc' --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/.turbo/**'`;
  } else if (checkCommandExists('grep')) {
    tool = 'grep';
    command = `grep -R "${pattern}" . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.turbo --exclude-dir=.git -n`;
  } else {
    error('Neither ripgrep (rg) nor grep found. Please install ripgrep: brew install ripgrep');
    process.exit(1);
  }

  try {
    info(`Using ${tool} to check for deep imports in TS/JS files`);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    const matches = output.trim();

    if (matches) {
      // Filter out comments and string literals (basic check)
      const lines = matches.split('\n').filter((line) => {
        // Skip lines that are clearly comments or documentation
        const trimmed = line.trim();
        return (
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('/*') &&
          trimmed.includes("from '@tracked/shared/src") ||
          trimmed.includes('from "@tracked/shared/src')
        );
      });

      if (lines.length > 0) {
        error('Deep imports found in code:');
        console.log(lines.join('\n'));
        error('\nDeep imports are forbidden. Use @tracked/shared instead of @tracked/shared/src/*');
        return false;
      }
    }

    success('No deep imports found');
    return true;
  } catch (err) {
    // grep/rg exit code 1 means "no matches" - that's success
    if (err.status === 1) {
      success('No deep imports found');
      return true;
    }
    // Other errors are real problems
    error(`Failed to check deep imports: ${err.message}`);
    return false;
  }
}

function verifyLint() {
  log('\n🔧 Running lint...', colors.blue);
  return runCommand('pnpm -w lint', 'Lint');
}

function verifyTypecheck() {
  log('\n📝 Running typecheck...', colors.blue);
  return runCommand('pnpm -w typecheck', 'Typecheck');
}

function verifyBuild() {
  log('\n🏗️  Running build...', colors.blue);
  return runCommand('pnpm -w build', 'Build');
}

// Main execution
function main() {
  log('\n🚀 Quality Gates Verification\n', colors.blue);

  const checks = [
    { name: 'Workspace', fn: verifyWorkspace },
    { name: 'Deep Imports', fn: verifyDeepImports },
    { name: 'Lint', fn: verifyLint },
    { name: 'Typecheck', fn: verifyTypecheck },
    { name: 'Build', fn: verifyBuild },
  ];

  const results = [];

  for (const check of checks) {
    const passed = check.fn();
    results.push({ name: check.name, passed });

    if (!passed) {
      log(`\n❌ Quality gate "${check.name}" failed. Fix errors before proceeding.`, colors.red);
      process.exit(1);
    }
  }

  log('\n✨ All quality gates passed!\n', colors.green);
  process.exit(0);
}

main();
