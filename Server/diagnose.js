// diagnose.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====== DIAGNOSTYKA PUPPETEER =======');

// Sprawdź wersję Node.js
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// Sprawdź zainstalowane pakiety
console.log('\n== Zainstalowane pakiety ==');
try {
	const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
	console.log('Dependencies:');
	console.log(packageJson.dependencies);
} catch (err) {
	console.error('Error reading package.json:', err);
}

// Sprawdź lokalizację Chrome
console.log('\n== Lokalizacja Chrome ==');
const possibleChromePaths = [
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
	'/usr/bin/google-chrome',
	'/usr/bin/google-chrome-stable',
	'/opt/render/.cache/puppeteer',
];

for (const chromePath of possibleChromePaths) {
	try {
		if (fs.existsSync(chromePath)) {
			console.log(`✅ ${chromePath} - istnieje`);
			if (fs.lstatSync(chromePath).isDirectory()) {
				console.log(`   Jest to katalog, zawartość:`);
				const files = fs.readdirSync(chromePath);
				console.log(`   ${files.join(', ')}`);
			}
		} else {
			console.log(`❌ ${chromePath} - nie istnieje`);
		}
	} catch (err) {
		console.error(`Error checking ${chromePath}:`, err);
	}
}

// Sprawdź zainstalowane pakiety systemowe
console.log('\n== Zainstalowane pakiety systemowe ==');
try {
	const aptList = execSync(
		'apt list --installed | grep -E "chromium|chrome"'
	).toString();
	console.log(aptList);
} catch (err) {
	console.log('Nie można sprawdzić pakietów apt:', err.message);
}

// Sprawdź zmienne środowiskowe
console.log('\n== Zmienne środowiskowe ==');
console.log(
	'PUPPETEER_EXECUTABLE_PATH:',
	process.env.PUPPETEER_EXECUTABLE_PATH
);
console.log('PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR);
console.log('CHROMIUM_PATH:', process.env.CHROMIUM_PATH);

console.log('\n======= KONIEC DIAGNOSTYKI =======');
