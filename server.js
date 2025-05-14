import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';

const app = express();

// Middleware
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route dla root path - sprawdzenie czy serwer działa
app.get('/', (req, res) => {
	res.json({ status: 'ok', message: 'API działa poprawnie' });
});

// Route GET dla /api/price - dla testów i Railway health checks
app.get('/api/price', (req, res) => {
	res.json({ message: 'Użyj metody POST do pobierania cen kart' });
});

// Główny endpoint do pobierania cen kart
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

// Obsługa nieistniejących endpointów
app.use((req, res) => {
	res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`🟢 Backend działa na porcie ${PORT}`);
});
