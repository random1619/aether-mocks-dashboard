const { execSync } = require('child_process');
const path = require('path');

console.log('Compiling SCSS to CSS...');
try {
  execSync('npx sass assets/scss/main.scss assets/css/main.css', { stdio: 'inherit' });
  console.log('Compilation successful: assets/css/main.css created.');
} catch (error) {
  console.error('Compilation failed:', error);
  process.exit(1);
}
