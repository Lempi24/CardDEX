import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';

// Użyj pluginu StealthPlugin dla lepszego ukrywania automatyzacji
puppeteer.use(StealthPlugin());

async function scrapeCard(cardName) {
	console.log(`🔍 Szukam: ${cardName}`);

	// Konfiguracja przeglądarki
	const options = {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--window-size=1280,1024', // Większy rozmiar okna dla lepszej widoczności elementów
		],
	};

	// Używamy ścieżki z zmiennej środowiskowej lub standardowej ścieżki w Debian
	if (process.env.PUPPETEER_EXECUTABLE_PATH) {
		options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
		console.log(`Używam Chrome z: ${options.executablePath}`);
	}

	const browser = await puppeteer.launch(options);

	try {
		// Otwieramy nową kartę
		const page = await browser.newPage();

		// Ustawiamy userAgent bardziej przypominający prawdziwą przeglądarkę
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);

		// Dodajemy dodatkowe nagłówki aby lepiej udawać prawdziwego użytkownika
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
			Accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
			'sec-ch-ua':
				'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'none',
			'Sec-Fetch-User': '?1',
			'Upgrade-Insecure-Requests': '1',
		});

		// Blokujemy niepotrzebne zasoby dla przyspieszenia
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			const resourceType = req.resourceType();
			if (
				resourceType === 'image' ||
				resourceType === 'font' ||
				resourceType === 'media'
			) {
				req.abort();
			} else {
				req.continue();
			}
		});

		// Przygotowujemy URL wyszukiwania
		const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
			cardName
		)}&idLanguage=1`;
		console.log(`Otwieram URL: ${searchUrl}`);

		// Przejdź do strony wyszukiwania z dłuższym timeoutem, używając networkidle2
		await page.goto(searchUrl, {
			waitUntil: 'networkidle2',
			timeout: 30000,
		});

		// Obsługa cookies jeśli się pojawią
		try {
			const cookieButton = await page.$(
				'button[data-testid="uc-accept-all-button"]'
			);
			if (cookieButton) {
				console.log('Akceptacja cookies');
				await cookieButton.click();
				// Krótkie oczekiwanie po kliknięciu
				await page.waitForTimeout(500);
			}
		} catch (e) {
			console.log(
				'Nie znaleziono przycisku cookies lub wystąpił błąd:',
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
			await page.goto(correctedUrl, { waitUntil: 'networkidle2' });
		}

		// Czekamy na wyniki wyszukiwania z dłuższym timeoutem
		console.log('Czekam na wyniki wyszukiwania...');
		try {
			await page.waitForSelector('a[href*="/Pokemon/Products/Singles/"]', {
				timeout: 15000,
			});
		} catch (error) {
			console.error('Timeout podczas czekania na wyniki wyszukiwania');
			// Dodatkowy debug - sprawdź zawartość strony
			const pageContent = await page.content();
			console.log(
				'Fragment HTML strony:',
				pageContent.substring(0, 500) + '...'
			);

			const pageUrl = page.url();
			console.log('URL po timeout:', pageUrl);

			throw new Error('Nie znaleziono wyników wyszukiwania.');
		}

		// Pobieramy link do pierwszego wyniku
		console.log('Pobieram link do pierwszego wyniku');
		const firstLinkHref = await page.$eval(
			'a[href*="/Pokemon/Products/Singles/"]',
			(el) => el.href
		);

		console.log(`➡️ Wchodzę na: ${firstLinkHref}`);
		// Przejdź do strony karty z ustawieniem networkidle2 dla pewności załadowania
		await page.goto(firstLinkHref, {
			waitUntil: 'networkidle2',
			timeout: 30000,
		});

		// Czekamy na informacje o cenie
		console.log('Czekam na informacje o cenie');
		await page.waitForSelector('dt', { timeout: 15000 }).catch(() => {
			throw new Error('Nie znaleziono informacji o cenie.');
		});

		// Funkcja do pobierania kursu wymiany
		async function getExchangeRate(base = 'EUR', target = 'PLN') {
			try {
				console.log(`Pobieranie kursu wymiany ${base} -> ${target}`);
				const response = await fetch(
					`https://open.er-api.com/v6/latest/${base}`
				);
				const data = await response.json();
				console.log(`Otrzymany kurs: ${data.rates[target]}`);
				return data.rates[target];
			} catch (error) {
				console.error(
					`Błąd pobierania kursu: ${error.message}, używam wartości domyślnej`
				);
				// Domyślne kursy w przypadku awarii API
				const defaultRates = {
					EUR: 4.32,
					USD: 3.95,
					GBP: 5.1,
				};
				return defaultRates[base] || 4.32;
			}
		}

		// Pobieranie ceny trendu
		console.log('Szukam Price Trend');
		const trendPriceRaw = await page.evaluate(() => {
			// Zapis HTML do konsoli dla debugowania
			console.log(
				'HTML sekcji cen:',
				document.body.innerHTML.substring(0, 1000)
			);

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

		console.log(`Znaleziona raw cena: ${trendPriceRaw}`);

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
