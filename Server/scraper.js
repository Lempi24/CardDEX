import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';
puppeteer.use(StealthPlugin());

async function scrapeCard(cardName) {
	console.log(`🔍 Szukam: ${cardName}`);

	// Dodatkowe opcje dla Render
	const options = {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage', // Pomaga z niską ilością pamięci
			'--disable-gpu', // Wyłącza GPU
			'--disable-extensions', // Wyłącza rozszerzenia
			'--single-process', // Ogranicza ilość procesów
		],
	};

	// Szukamy Chrome/Chromium w różnych lokalizacjach
	const possiblePaths = [
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser',
		'/usr/bin/google-chrome',
		'/usr/bin/google-chrome-stable',
	];

	// Najpierw sprawdzamy zmienną środowiskową
	const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
	if (execPath) {
		console.log(`Używam ścieżki z PUPPETEER_EXECUTABLE_PATH: ${execPath}`);
		options.executablePath = execPath;
	} else {
		// Szukamy Chrome/Chromium w systemie
		console.log('Szukam chromium w systemie...');
		// Sprawdzamy dostępność plików
		const fs = require('fs');
		for (const path of possiblePaths) {
			try {
				if (fs.existsSync(path)) {
					console.log(`Znaleziono przeglądarkę w: ${path}`);
					options.executablePath = path;
					break;
				}
			} catch (err) {
				console.log(`Nie znaleziono w: ${path}`);
			}
		}

		if (!options.executablePath) {
			console.log(
				'Nie znaleziono Chrome/Chromium, używam domyślnej instalacji'
			);
		}
	}

	let browser;
	try {
		console.log('Uruchamiam przeglądarkę z opcjami:', JSON.stringify(options));
		browser = await puppeteer.launch(options);

		const page = await browser.newPage();
		console.log('Nowa strona otwarta');

		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);

		await page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
		});

		// Ograniczamy zasoby poprzez blokowanie niepotrzebnych zasobów
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			const resourceType = req.resourceType();
			if (
				resourceType === 'image' ||
				resourceType === 'font' ||
				resourceType === 'media' ||
				resourceType === 'stylesheet' || // Dodano blokowanie CSS
				resourceType === 'script' // Dodano blokowanie JS
			) {
				req.abort();
			} else {
				req.continue();
			}
		});

		const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
			cardName
		)}&idLanguage=1`;

		console.log(`Przechodzę na stronę: ${searchUrl}`);
		await page.goto(searchUrl, {
			waitUntil: 'domcontentloaded', // Mniej zasobożerne niż 'networkidle0'
			timeout: 30000, // Zwiększono timeout dla wolniejszego środowiska
		});
		console.log('Strona załadowana');

		// Obsługa ciasteczek
		try {
			const cookieButton = await page.$(
				'button[data-testid="uc-accept-all-button"]'
			);
			if (cookieButton) {
				await cookieButton.click();
				console.log('Zaakceptowano ciasteczka');
			}
		} catch (e) {
			console.log(
				'Nie znaleziono przycisku ciasteczek lub wystąpił błąd:',
				e.message
			);
		}

		// Sprawdzenie przekierowania
		const currentUrl = page.url();
		console.log(`Obecny URL: ${currentUrl}`);

		if (!currentUrl.includes('/en/')) {
			console.log('⚠️ Przekierowano na wersję nie-angielską. Próba korekty...');
			const correctedUrl =
				currentUrl.replace(/\/([a-z]{2})\//, '/en/') + '&idLanguage=1';
			await page.goto(correctedUrl, { waitUntil: 'domcontentloaded' });
			console.log(`Przekierowano na: ${correctedUrl}`);
		}

		// Sprawdzenie czy są wyniki
		console.log('Oczekiwanie na wyniki wyszukiwania...');
		const resultsExist = await page
			.$('a[href*="/Pokemon/Products/Singles/"]')
			.catch(() => null);

		if (!resultsExist) {
			console.log('Nie znaleziono wyników wyszukiwania.');
			throw new Error('Nie znaleziono wyników wyszukiwania.');
		}

		// Pobieranie linku do pierwszego wyniku
		const firstLinkHref = await page.$eval(
			'a[href*="/Pokemon/Products/Singles/"]',
			(el) => el.href
		);

		console.log(`➡️ Wchodzę na: ${firstLinkHref}`);
		await page.goto(firstLinkHref, {
			waitUntil: 'domcontentloaded',
			timeout: 30000,
		});
		console.log('Strona produktu załadowana');

		// Oczekiwanie na cenę
		console.log('Oczekiwanie na informacje o cenie...');
		const priceExists = await page.$('dt').catch(() => null);

		if (!priceExists) {
			console.log('Nie znaleziono informacji o cenie.');
			throw new Error('Nie znaleziono informacji o cenie.');
		}

		// Pobieranie kursu wymiany
		async function getExchangeRate(base = 'EUR', target = 'PLN') {
			console.log(`Pobieranie kursu wymiany ${base} -> ${target}`);
			try {
				const response = await fetch(
					`https://open.er-api.com/v6/latest/${base}`
				);
				const data = await response.json();
				console.log(`Kurs ${base} -> ${target}: ${data.rates[target]}`);
				return data.rates[target];
			} catch (error) {
				console.error(`Błąd pobierania kursu: ${error.message}`);
				// Fallback dla EUR-PLN, gdyby API nie działało
				return base === 'EUR' ? 4.32 : 1;
			}
		}

		// Pobieranie ceny
		const trendPriceRaw = await page.evaluate(() => {
			const allElements = Array.from(document.querySelectorAll('dt, dd'));
			for (let i = 0; i < allElements.length; i++) {
				const el = allElements[i];
				if (
					el.tagName === 'DT' &&
					(el.textContent.toLowerCase().includes('price trend') ||
						el.textContent.toLowerCase().includes('tendance des prix'))
				) {
					const valueEl = allElements[i + 1];
					return valueEl?.textContent.trim();
				}
			}
			return null;
		});

		console.log(`Znaleziona cena trend: ${trendPriceRaw}`);

		if (!trendPriceRaw) {
			throw new Error('Nie znaleziono trend price.');
		}

		// Parsowanie ceny
		let currencySymbol = trendPriceRaw.match(/[^\d.,\s]+/g)?.[0] || '€';
		let numericPrice = parseFloat(
			trendPriceRaw.replace(/[^\d.,]/g, '').replace(',', '.')
		);

		const currencyMap = {
			'€': 'EUR',
			$: 'USD',
			'£': 'GBP',
		};

		const currencyCode = currencyMap[currencySymbol] || 'EUR';
		const exchangeRate = await getExchangeRate(currencyCode, 'PLN');
		const priceInPLN = +(numericPrice * exchangeRate).toFixed(2);

		console.log(
			`💸 Trend price (${currencyCode}): ${numericPrice} → ${priceInPLN} PLN`
		);
		return priceInPLN;
	} catch (error) {
		console.error(`❌ Błąd: ${error.message}`);
		return null;
	} finally {
		if (browser) {
			console.log('Zamykam przeglądarkę');
			await browser
				.close()
				.catch((err) =>
					console.error('Błąd podczas zamykania przeglądarki:', err.message)
				);
		}
	}
}

export default scrapeCard;
