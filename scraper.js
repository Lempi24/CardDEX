import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';
require('dotenv').config();

puppeteer.use(StealthPlugin());

async function scrapeCard(cardName) {
	console.log(`🔍 Szukam: ${cardName}`);

	const browser = await puppeteer.launch({
		executablePath:
			process.env.NODE_ENV === 'production'
				? process.env.PUPPETEER_EXECUTABLE_PATH
				: puppeteer.executablePath(),
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--single-process',
			'--disable-gpu',
			'--no-zygote',
		],
	});

	try {
		const page = await browser.newPage();

		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
		});

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

		const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
			cardName
		)}&idLanguage=1`;
		await page.goto(searchUrl, {
			waitUntil: 'domcontentloaded',
			timeout: 15000,
		});

		try {
			const cookieButton = await page.$(
				'button[data-testid="uc-accept-all-button"]'
			);
			if (cookieButton) {
				await cookieButton.click();
			}
		} catch (e) {}

		const currentUrl = page.url();
		if (!currentUrl.includes('/en/')) {
			console.log('⚠️ Przekierowano na wersję nie-angielską. Próba korekty...');
			const correctedUrl =
				currentUrl.replace(/\/([a-z]{2})\//, '/en/') + '&idLanguage=1';
			await page.goto(correctedUrl, { waitUntil: 'domcontentloaded' });
		}
		await page
			.waitForSelector('a[href*="/Pokemon/Products/Singles/"]', {
				timeout: 5000,
			})
			.catch(() => {
				throw new Error('Nie znaleziono wyników wyszukiwania.');
			});

		const firstLinkHref = await page.$eval(
			'a[href*="/Pokemon/Products/Singles/"]',
			(el) => el.href
		);

		console.log(`➡️ Wchodzę na: ${firstLinkHref}`);
		await page.goto(firstLinkHref, { waitUntil: 'domcontentloaded' });

		await page.waitForSelector('dt', { timeout: 5000 }).catch(() => {
			throw new Error('Nie znaleziono informacji o cenie.');
		});

		async function getExchangeRate(base = 'EUR', target = 'PLN') {
			const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
			const data = await response.json();
			return data.rates[target];
		}

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

		if (!trendPriceRaw) throw new Error('Nie znaleziono trend price.');

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
		await browser.close();
	}
}

export default scrapeCard;
