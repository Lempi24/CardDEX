import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';

const app = express();

// Podstawowe middleware
app.use(cors());
app.use(express.json());

// Testowy endpoint główny
app.get('/', (req, res) => {
	res.send('API działa poprawnie');
});

// Obsługa zdrowia aplikacji
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Endpoint do pobierania cen - dodaję obsługę GET
app.get('/api/price', (req, res) => {
	res.json({ message: 'Użyj metody POST aby sprawdzić cenę karty' });
});

// Główny endpoint POST
app.post('/api/price', async (req, res) => {
	const { name, number } = req.body;

	console.log('📥 Otrzymano request:');
	console.log('📱 User-Agent:', req.headers['user-agent']);
	console.log('🧾 Body:', req.body);

	if (!name || !number) {
		console.warn('⛔ Brak name lub number');
		return res.status(400).json({ error: 'Missing name or number' });
	}

	const fullName = `${name} ${number}`;
	console.log(`🔍 Zapytanie o kartę: ${fullName}`);

	try {
		const priceInPLN = await scrapeCard(fullName);

		if (priceInPLN == null) {
			console.warn('⚠️ Cena nieznaleziona');
			return res.status(404).json({ error: 'Price not found' });
		}

		const rounded = priceInPLN.toFixed(2);
		console.log(`✅ Cena znaleziono: ${rounded} PLN`);
		res.json({ price: `${rounded}` });
	} catch (err) {
		console.error('❌ Błąd serwera:', err);
		res.status(500).json({ error: 'Scraping failed', message: err.message });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`🟢 Backend działa na porcie ${PORT}`);
});
