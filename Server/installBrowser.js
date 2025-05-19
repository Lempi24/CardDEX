// installBrowser.js
import { execSync } from 'child_process';

try {
  console.log('Installing Chrome browser for Puppeteer...');
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
  console.log('Chrome browser installed successfully.');
} catch (error) {
  console.error('Failed to install Chrome browser:', error);
  process.exit(1);
}