// nanoid-fix.js
const fs = require('fs');
const path = require('path');

console.log('Fixing nanoid non-secure module...');

// Paths
const nanoidPath = path.join(__dirname, 'node_modules', 'nanoid');
const nonSecurePath = path.join(nanoidPath, 'non-secure');

// Create non-secure directory if it doesn't exist
if (!fs.existsSync(nonSecurePath)) {
  console.log('Creating non-secure directory...');
  fs.mkdirSync(nonSecurePath, { recursive: true });
}

// Create package.json in non-secure directory
const packageJsonContent = {
  name: "nanoid-non-secure",
  version: "4.0.0",
  main: "index.js"
};

fs.writeFileSync(
  path.join(nonSecurePath, 'package.json'),
  JSON.stringify(packageJsonContent, null, 2)
);
console.log('Created package.json in non-secure directory');

// Create index.js that imports from the parent module
const indexContent = `
// This is a fix for expo-router's dependency on nanoid/non-secure
const { nanoid, customAlphabet } = require('../index.js');
module.exports = { nanoid, customAlphabet };
`;

fs.writeFileSync(path.join(nonSecurePath, 'index.js'), indexContent);
console.log('Created index.js in non-secure directory');

console.log('nanoid non-secure module fix completed successfully!');