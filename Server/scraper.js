import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';
puppeteer.use(StealthPlugin());

const exchangeRateCache = new Map();

async function getExchangeRate(base = 'EUR', target = 'PLN') {
	const cacheKey = `${base}_${target}`;
	if (exchangeRateCache.has(cacheKey)) {
		return exchangeRateCache.get(cacheKey);
	}

	try {
		const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
		const data = await response.json();
		const rate = data.rates[target];
		exchangeRateCache.set(cacheKey, rate);
		return rate;
	} catch (error) {
		console.error(
			'Błąd pobierania kursu waluty, używam domyślnego 4.5:',
			error
		);
		return 4.5;
	}
}

function forceEnglishUrl(url) {
	// Zamień /fr/ na /en/ w URL
	return url.replace(
		'https://www.cardmarket.com/fr/',
		'https://www.cardmarket.com/en/'
	);
}

async function scrapeCard(cardName, filter, language) {
	console.log(`🔍 Szukam: ${cardName}`);
	const startTime = Date.now();

	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
	});

	try {
		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
			'Accept-Encoding': 'gzip, deflate, br',
		});

		await page.setRequestInterception(true);
		page.on('request', (req) => {
			const resourceType = req.resourceType();
			const blockedResources = ['font', 'media', 'stylesheet', 'image'];
			if (
				blockedResources.includes(resourceType) ||
				req.url().includes('google') ||
				req.url().includes('gstatic')
			) {
				req.abort();
			} else {
				req.continue();
			}
		});

		const exchangeRatePromise = getExchangeRate();

		const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
			cardName
		)}`;
		await page.goto(searchUrl, {
			waitUntil: 'domcontentloaded',
			timeout: 10000,
		});

		try {
			const cookieButton = await page.$(
				'button[data-testid="uc-accept-all-button"]'
			);
			if (cookieButton) {
				await cookieButton.click();
				await page.waitForTimeout(500); // Krótkie oczekiwanie zamiast waitForNavigation
			}
		} catch (e) {}

		const firstLinkHref = await page.evaluate(() => {
			const link = document.querySelector(
				'a[href*="/Pokemon/Products/Singles/"]'
			);
			return link ? link.href : null;
		});

		if (!firstLinkHref) throw new Error('Nie znaleziono wyników wyszukiwania.');

		// Wymusz angielski URL i od razu dodaj parametr języka
		const englishHref = forceEnglishUrl(firstLinkHref);
		const languageUrl = `${englishHref}?language=${language}`;

		console.log(`➡️ Wchodzę bezpośrednio na: ${languageUrl}`);

		await page.goto(languageUrl, {
			waitUntil: 'domcontentloaded',
			timeout: 10000,
		});

		const [imageUrl, priceData] = await Promise.all([
			findImageUrl(page),
			extractPriceData(page, filter),
		]);

		if (imageUrl) {
			console.log(`🖼️ Znaleziono obrazek: ${imageUrl}`);
		} else {
			console.log('⚠️ Nie znaleziono obrazka karty.');
		}

		// Extract currency symbol and numeric value
		const { priceValue, currencySymbol } = priceData;
		const numericPrice = parseFloat(
			priceValue.replace(/[^\d.,]/g, '').replace(',', '.')
		);

		let priceInPLN;
		const exchangeRate = await exchangeRatePromise;

		// Check currency symbol and convert if needed
		if (currencySymbol === '€' || currencySymbol === 'EUR') {
			priceInPLN = +(numericPrice * exchangeRate).toFixed(2);
			console.log(`💶 Trend price (EUR): ${numericPrice} → ${priceInPLN} PLN`);
		} else if (currencySymbol === '$' || currencySymbol === 'USD') {
			const usdRate = await getExchangeRate('USD', 'PLN');
			priceInPLN = +(numericPrice * usdRate).toFixed(2);
			console.log(`💵 Trend price (USD): ${numericPrice} → ${priceInPLN} PLN`);
		} else if (currencySymbol === '£' || currencySymbol === 'GBP') {
			const gbpRate = await getExchangeRate('GBP', 'PLN');
			priceInPLN = +(numericPrice * gbpRate).toFixed(2);
			console.log(`💷 Trend price (GBP): ${numericPrice} → ${priceInPLN} PLN`);
		} else {
			// If currency is PLN or unknown, use the value as is
			priceInPLN = +numericPrice.toFixed(2);
			console.log(
				`💸 Trend price (${currencySymbol || 'unknown'}): ${numericPrice} PLN`
			);
		}

		console.log(`⏱️ Czas wykonania: ${(Date.now() - startTime) / 1000}s`);

		return {
			price: priceInPLN,
			imageUrl: imageUrl,
			originalPrice: numericPrice,
			originalCurrency: currencySymbol,
		};
	} catch (error) {
		console.error(`❌ Błąd: ${error.message}`);
		return null;
	} finally {
		await browser.close();
	}
}

async function extractPriceData(page, filter) {
	console.log('filter: ' + filter);
	try {
		return await page.evaluate((filter) => {
			const allElements = Array.from(document.querySelectorAll('dt, dd'));
			for (let i = 0; i < allElements.length; i++) {
				const el = allElements[i];
				if (
					el.tagName === 'DT' &&
					(el.textContent.toLowerCase().includes(filter) ||
						el.textContent.toLowerCase().includes('tendance des prix'))
				) {
					const valueEl = allElements[i + 1];
					const priceText = valueEl?.textContent.trim() || '';

					// Extract currency symbol
					const currencyMatch = priceText.match(/[^\d.,\s]+/);
					const currencySymbol = currencyMatch ? currencyMatch[0] : '€';

					// Extract numeric value
					const priceValue = priceText.replace(/[^\d.,]/g, '').trim();

					return {
						priceValue,
						currencySymbol,
					};
				}
			}
			return {
				priceValue: '0',
				currencySymbol: '€',
			};
		}, filter);
	} catch (error) {
		console.error('Błąd podczas ekstrakcji ceny:', error);
		return {
			priceValue: '0',
			currencySymbol: '€',
		};
	}
}

async function findImageUrl(page) {
	try {
		return await page.evaluate(() => {
			const mainImage = document.querySelector(
				'img.image.card-image.is-pokemon.w-100'
			);
			if (mainImage?.src) return mainImage.src;

			const selectors = [
				'img.card-image',
				'img.is-pokemon',
				'.image.card-image.is-pokemon',
				'.tab-content img',
				'#tabContent-info img',
			];

			for (const selector of selectors) {
				const img = document.querySelector(selector);
				if (img?.src) return img.src;
			}

			const html = document.documentElement.outerHTML;
			const imgRegex =
				/(https:\/\/product-images\.(s3\.)?cardmarket\.com\/[^"']+\.jpg)/i;
			const match = html.match(imgRegex);
			return match ? match[0] : null;
		});
	} catch (error) {
		console.error('Błąd podczas wyszukiwania obrazka:', error);
		return null;
	}
}

export default scrapeCard;
