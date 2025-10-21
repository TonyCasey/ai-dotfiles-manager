#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test the Windows compatibility features
async function testWindowsCompatibility() {
  console.log('🧪 Testing Windows compatibility features...\n');

  // Test 1: Check if sync script exists and runs
  const syncScriptPath = path.join(__dirname, '..', 'templates', 'claude', 'scripts', 'sync-rules.js');

  if (!fs.existsSync(syncScriptPath)) {
    console.error('❌ Sync script not found at:', syncScriptPath);
    return false;
  }

  console.log('✅ Sync script exists');

  // Test 2: Check if sync script can execute without errors
  try {
    execSync(`node -c "${syncScriptPath}"`, { stdio: 'pipe' });
    console.log('✅ Sync script syntax is valid');
  } catch (error) {
    console.error('❌ Sync script has syntax errors:', error.message);
    return false;
  }

  // Test 3: Check if setup script has the new Windows fallback code
  const setupScriptPath = path.join(__dirname, '..', 'bin', 'setup.js');
  const setupContent = fs.readFileSync(setupScriptPath, 'utf8');

  if (!setupContent.includes('copyDirectory')) {
    console.error('❌ Setup script missing copyDirectory function');
    return false;
  }

  if (!setupContent.includes('usedCopy')) {
    console.error('❌ Setup script missing copy fallback tracking');
    return false;
  }

  if (!setupContent.includes('sync-rules.js')) {
    console.error('❌ Setup script missing sync script generation');
    return false;
  }

  console.log('✅ Setup script has Windows fallback code');

  // Test 4: Check if README has Windows documentation
  const readmePath = path.join(__dirname, '..', 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  if (!readmeContent.includes('Automatic fallback')) {
    console.error('❌ README missing Windows fallback documentation');
    return false;
  }

  if (!readmeContent.includes('sync-rules.js')) {
    console.error('❌ README missing sync script documentation');
    return false;
  }

  console.log('✅ README has Windows compatibility documentation');

  console.log('\n🎉 All Windows compatibility tests passed!');
  return true;
}

// Run the test
testWindowsCompatibility()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });