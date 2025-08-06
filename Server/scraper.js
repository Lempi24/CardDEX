import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';

puppeteer.use(StealthPlugin());

let browserInstance = null;

export async function initializeBrowser() {
	if (browserInstance) {
		return;
	}
	try {
		browserInstance = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
		});
	} catch (error) {
		console.error('Nie udało się uruchomić przeglądarki:', error);
		process.exit(1);
	}
}

export async function closeBrowser() {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
}

async function getBrowser() {
	if (!browserInstance) {
		await initializeBrowser();
	}
	return browserInstance;
}

async function scrapeCard(
	cardName,
	filter,
	language,
	options = { price: true, image: true }
) {
	const browser = await getBrowser();
	const page = await browser.newPage();

	try {
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
			const blockedResources = ['font', 'media', 'stylesheet'];
			if (!options.image) {
				blockedResources.push('image');
			}
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

		const exchangeRatePromise = options.price
			? getExchangeRate()
			: Promise.resolve(null);
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
				await page.waitForTimeout(500);
			}
		} catch (e) {}

		const firstLinkHref = await page.evaluate(() => {
			const link = document.querySelector(
				'a[href*="/Pokemon/Products/Singles/"]'
			);
			return link ? link.href : null;
		});
		if (!firstLinkHref) throw new Error('Nie znaleziono wyników wyszukiwania.');

		const englishHref = forceEnglishUrl(firstLinkHref);
		const languageUrl = `${englishHref}?language=${language}`;
		await page.goto(languageUrl, {
			waitUntil: 'domcontentloaded',
			timeout: 10000,
		});

		const scrapingPromises = [];
		if (options.image) scrapingPromises.push(findImageUrl(page));
		if (options.price) scrapingPromises.push(extractPriceData(page, filter));

		const results = await Promise.all(scrapingPromises);
		const finalResult = {};
		let resultIndex = 0;

		if (options.image) {
			finalResult.imageUrl = results[resultIndex++];
		}
		if (options.price) {
			const priceData = results[resultIndex];
			finalResult.price = await calculatePriceInPLN(priceData);
		}

		return finalResult;
	} catch (error) {
		console.error(`Błąd podczas scrapowania "${cardName}": ${error.message}`);
		return null;
	} finally {
		if (page) {
			await page.close();
		}
	}
}

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
	return url.replace(
		'https://www.cardmarket.com/fr/',
		'https://www.cardmarket.com/en/'
	);
}

async function extractPriceData(page, filter) {
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
					const currencyMatch = priceText.match(/[^\d.,\s]+/);
					const currencySymbol = currencyMatch ? currencyMatch[0] : '€';
					const priceValue = priceText.replace(/[^\d.,]/g, '').trim();
					return { priceValue, currencySymbol };
				}
			}
			return { priceValue: '0', currencySymbol: '€' };
		}, filter);
	} catch (error) {
		return { priceValue: '0', currencySymbol: '€' };
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
		return null;
	}
}

async function calculatePriceInPLN(priceData) {
	if (!priceData || !priceData.priceValue) {
		return 0;
	}
	const { priceValue, currencySymbol } = priceData;
	const numericPrice = parseFloat(
		priceValue.replace(/[^\d.,]/g, '').replace(',', '.')
	);
	let priceInPLN;

	if (currencySymbol === '€' || currencySymbol === 'EUR') {
		const exchangeRate = await getExchangeRate('EUR', 'PLN');
		priceInPLN = +(numericPrice * exchangeRate).toFixed(2);
	} else if (currencySymbol === '$' || currencySymbol === 'USD') {
		const usdRate = await getExchangeRate('USD', 'PLN');
		priceInPLN = +(numericPrice * usdRate).toFixed(2);
	} else if (currencySymbol === '£' || currencySymbol === 'GBP') {
		const gbpRate = await getExchangeRate('GBP', 'PLN');
		priceInPLN = +(numericPrice * gbpRate).toFixed(2);
	} else {
		priceInPLN = +numericPrice.toFixed(2);
	}
	return priceInPLN;
}

export { scrapeCard };
