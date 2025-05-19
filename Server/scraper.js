import fetch from 'node-fetch';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 * Scrapes card price trend from Cardmarket
 * @param {string} cardName - The name of the card to search for
 * @return {Promise<number|null>} - The card price in PLN or null if an error occurs
 */
async function scrapeCard(cardName) {
  if (!cardName) {
    throw new Error('Nazwa karty jest wymagana');
  }
  
  let browser = null;
  
  try {
    // Inicjalizacja przeglądarki
    browser = await puppeteer.launch({
      executablePath: '/opt/render/.cache/puppeteer/chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: 'new',
    });
    
    const page = await browser.newPage();

    // Ustawienie User Agent i nagłówków
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Blokowanie niepotrzebnych zasobów dla zwiększenia wydajności
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

    // Przejście do strony wyszukiwania
    const searchUrl = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(
      cardName
    )}&idLanguage=1`;
    
    console.log(`🔍 Wyszukiwanie: ${cardName}`);
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Akceptowanie plików cookie, jeśli potrzebne
    try {
      const cookieButton = await page.$(
        'button[data-testid="uc-accept-all-button"]'
      );
      if (cookieButton) {
        await cookieButton.click();
        console.log('🍪 Zaakceptowano pliki cookie');
      }
    } catch (e) {
      // Ignorujemy błędy związane z plikami cookie
    }

    // Sprawdzanie i korekta języka strony
    const currentUrl = page.url();
    if (!currentUrl.includes('/en/')) {
      console.log('⚠️ Przekierowano na wersję nie-angielską. Próba korekty...');
      const correctedUrl =
        currentUrl.replace(/\/([a-z]{2})\//, '/en/') + '&idLanguage=1';
      await page.goto(correctedUrl, { waitUntil: 'domcontentloaded' });
    }
    
    // Oczekiwanie na wyniki wyszukiwania
    await page
      .waitForSelector('a[href*="/Pokemon/Products/Singles/"]', {
        timeout: 5000,
      })
      .catch(() => {
        throw new Error('Nie znaleziono wyników wyszukiwania.');
      });

    // Pobranie pierwszego wyniku i przejście do strony karty
    const firstLinkHref = await page.$eval(
      'a[href*="/Pokemon/Products/Singles/"]',
      (el) => el.href
    );

    console.log(`➡️ Wchodzę na: ${firstLinkHref}`);
    await page.goto(firstLinkHref, { waitUntil: 'domcontentloaded' });

    // Oczekiwanie na załadowanie informacji o cenach
    await page.waitForSelector('dt', { timeout: 5000 }).catch(() => {
      throw new Error('Nie znaleziono informacji o cenie.');
    });

    // Funkcja pomocnicza do pobierania kursu wymiany
    async function getExchangeRate(base = 'EUR', target = 'PLN') {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        if (!response.ok) {
          throw new Error(`Błąd API kursu walut: ${response.status}`);
        }
        const data = await response.json();
        return data.rates[target];
      } catch (error) {
        console.error(`❌ Błąd pobierania kursu walut: ${error.message}`);
        // Wartości domyślne w przypadku błędu
        const defaultRates = {
          'EUR': 4.32,
          'USD': 3.95,
          'GBP': 5.02
        };
        return defaultRates[base] || 4.32;
      }
    }

    // Ekstrakcja ceny trendu ze strony
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

    // Parsowanie ceny i waluty
    let currencySymbol = trendPriceRaw.match(/[^\d.,\s]+/g)?.[0] || '€';
    let numericPrice = parseFloat(
      trendPriceRaw.replace(/[^\d.,]/g, '').replace(',', '.')
    );

    // Mapowanie symboli walut na kody ISO
    const currencyMap = {
      '€': 'EUR',
      '$': 'USD',
      '£': 'GBP',
    };

    // Konwersja ceny na PLN
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
    // Zamknięcie przeglądarki nawet w przypadku błędu
    if (browser) {
      await browser.close();
    }
  }
}

export default scrapeCard;