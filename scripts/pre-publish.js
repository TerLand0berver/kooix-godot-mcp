#!/usr/bin/env node

/**
 * Pre-publish validation script
 * Ensures package is ready for NPM publication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Change to project root directory
process.chdir(path.join(__dirname, '..'));

console.log('🔍 Running pre-publish validation...\n');

const errors = [];
const warnings = [];

// Check package.json
console.log('📦 Validating package.json...');
const packageJson = require('./package.json');

if (!packageJson.name) errors.push('Missing package name');
if (!packageJson.version) errors.push('Missing package version');
if (!packageJson.description) errors.push('Missing package description');
if (!packageJson.keywords || packageJson.keywords.length === 0) warnings.push('No keywords defined');
if (!packageJson.repository) warnings.push('No repository URL defined');
if (!packageJson.author) warnings.push('No author defined');

// Check required files
console.log('📁 Checking required files...');
const requiredFiles = ['README.md', 'LICENSE', 'CHANGELOG.md'];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required file: ${file}`);
  }
});

// Check build output
console.log('🏗️  Validating build output...');
if (!fs.existsSync('dist')) {
  errors.push('Missing dist directory - run npm run build first');
} else {
  const distFiles = ['index.js', 'index.d.ts'];
  distFiles.forEach(file => {
    if (!fs.existsSync(path.join('dist', file))) {
      errors.push(`Missing dist file: ${file}`);
    }
  });
}

// Check TypeScript compilation
console.log('🔧 Running TypeScript compilation...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  errors.push('TypeScript compilation failed');
}

// Check linting
console.log('🧹 Running linter...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  errors.push('Linting failed - fix issues before publishing');
}

// Check tests (if any)
console.log('🧪 Checking tests...');
try {
  if (fs.existsSync('tests') || fs.existsSync('test') || packageJson.scripts.test !== 'echo "Error: no test specified" && exit 1') {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Tests passed');
  } else {
    warnings.push('No tests found - consider adding tests');
  }
} catch (error) {
  errors.push('Tests failed');
}

// Check CLI functionality
console.log('⚡ Testing CLI functionality...');
try {
  const helpOutput = execSync('node dist/index.js --help', { encoding: 'utf8', timeout: 5000 });
  if (helpOutput.includes('Usage:') || helpOutput.includes('Options:')) {
    console.log('✅ CLI help command works');
  } else {
    warnings.push('CLI help output might be incomplete');
  }
} catch (error) {
  errors.push('CLI functionality test failed');
}

// Check package size
console.log('📏 Checking package size...');
try {
  const packOutput = execSync('npm pack --dry-run', { encoding: 'utf8' });
  const sizeMatch = packOutput.match(/package size:\s*([^\n]+)/i);
  if (sizeMatch) {
    const size = sizeMatch[1];
    console.log(`📦 Package size: ${size}`);
    
    // Warn if package is very large
    if (size.includes('MB') && parseFloat(size) > 10) {
      warnings.push('Package size is quite large - consider optimizing');
    }
  }
} catch (error) {
  warnings.push('Could not determine package size');
}

// Summary
console.log('\n📋 Validation Summary:');
console.log(`✅ Checks passed: ${errors.length === 0 ? 'All' : 'Partial'}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors that must be fixed:');
  errors.forEach(error => console.log(`  - ${error}`));
  console.log('\n🚫 Publication blocked due to errors!');
  process.exit(1);
} else {
  console.log('\n🎉 Package is ready for publication!');
  console.log('\n🚀 To publish:');
  console.log('  npm publish');
  console.log('\n📦 After publishing, install with:');
  console.log(`  npm install -g ${packageJson.name}`);
}