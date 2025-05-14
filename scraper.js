import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';
puppeteer.use(StealthPlugin());

async function scrapeCard(cardName) {
	console.log(`🔍 Start scrapowania dla: ${cardName}`);

	let browser;
	try {
		console.log('🚀 Uruchamiam Puppeteer...');
		browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		console.log('✅ Puppeteer uruchomiony');

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
			if (['image', 'font', 'media'].includes(resourceType)) {
				req.abort();
			} else {
				req.continue();
			}
		});

		const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
			cardName
		)}&idLanguage=1`;

		console.log(`🌐 Przechodzę do: ${searchUrl}`);
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
				console.log('🍪 Kliknięto cookies');
			}
		} catch (e) {
			console.log('⚠️ Nie znaleziono przycisku cookies');
		}

		const currentUrl = page.url();
		if (!currentUrl.includes('/en/')) {
			console.log('⚠️ Zła wersja językowa, próbuję przekierować na en...');
			const correctedUrl =
				currentUrl.replace(/\/([a-z]{2})\//, '/en/') + '&idLanguage=1';
			await page.goto(correctedUrl, { waitUntil: 'domcontentloaded' });
		}

		await page.waitForSelector('a[href*="/Pokemon/Products/Singles/"]', {
			timeout: 5000,
		});

		const firstLinkHref = await page.$eval(
			'a[href*="/Pokemon/Products/Singles/"]',
			(el) => el.href
		);

		console.log(`➡️ Wchodzę w produkt: ${firstLinkHref}`);
		await page.goto(firstLinkHref, { waitUntil: 'domcontentloaded' });

		await page.waitForSelector('dt', { timeout: 5000 });

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

		if (!trendPriceRaw) throw new Error('Nie znaleziono "Price Trend"');

		console.log(`💶 Trend Price znaleziony: ${trendPriceRaw}`);

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

		console.log(`💱 Kurs ${currencyCode} → PLN: ${exchangeRate}`);

		const priceInPLN = +(numericPrice * exchangeRate).toFixed(2);
		console.log(`✅ Cena końcowa: ${priceInPLN} PLN`);

		return priceInPLN;
	} catch (error) {
		console.error(`❌ Błąd w scraperze: ${error.message}`);
		return null;
	} finally {
		if (browser) {
			await browser.close();
			console.log('🧹 Puppeteer zamknięty');
		}
	}
}

async function getExchangeRate(base = 'EUR', target = 'PLN') {
	try {
		const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
		const data = await response.json();
		return data.rates[target];
	} catch (e) {
		console.error('❌ Błąd pobierania kursu walut:', e.message);
		return 4.5; // fallback
	}
}

export default scrapeCard;
