// cleanup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting project cleanup...');

// Delete cache directories
const directories = [
  '.expo',
  'node_modules/.cache',
  'node_modules/.expo'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
});

// Run nanoid fix
console.log('Running nanoid fix...');
try {
  require('./nanoid-fix');
} catch (error) {
  console.error('Error running nanoid fix:', error);
}

// Clear Metro bundler cache
console.log('Clearing Metro bundler cache...');
try {
  execSync('npx react-native start --reset-cache --no-open', { stdio: 'ignore' });
  execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
} catch (error) {
  // Ignore errors - the command might fail if Metro isn't running
}

console.log('Cleanup complete! Try running the app with:');
console.log('npm run clear');