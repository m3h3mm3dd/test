// fix-dependencies.js
const fs = require('fs');
const path = require('path');

console.log('Running post-install fixes...');

// Fix nanoid issue
try {
  // Create path to non-secure directory if it doesn't exist
  const nonSecurePath = path.join(__dirname, 'node_modules', 'nanoid', 'non-secure');
  if (!fs.existsSync(nonSecurePath)) {
    console.log('Creating nanoid/non-secure directory...');
    fs.mkdirSync(nonSecurePath, { recursive: true });
  }

  // Create package.json in non-secure directory
  const packageJsonPath = path.join(nonSecurePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('Creating nanoid/non-secure/package.json...');
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        name: 'nanoid-non-secure',
        version: '4.0.2',
        main: '../index.js'
      })
    );
  }

  // Create an index.js in non-secure directory if it doesn't exist
  const indexPath = path.join(nonSecurePath, 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('Creating nanoid/non-secure/index.js...');
    fs.writeFileSync(
      indexPath,
      `// Fallback for nanoid non-secure
module.exports = require('../index.js');`
    );
  }

  console.log('Successfully fixed nanoid/non-secure module issue');
} catch (error) {
  console.error('Failed to fix nanoid issue:', error);
}

// Add any other dependency fixes here

console.log('Post-install fixes completed');