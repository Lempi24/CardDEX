import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';

const app = express();

// Logowanie przychodzących żądań
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
	})
);
app.use(express.json());

// Endpoint testowy
app.get('/', (req, res) => {
	res.send('API działa poprawnie');
});

// Pełna ścieżka dla API
app.post('/api/price', async (req, res) => {
	const { name, number } = req.body;
	console.log('Otrzymano żądanie POST /api/price:', { name, number });

	if (!name || !number) {
		return res.status(400).json({ error: 'Missing name or number' });
	}

	const fullName = `${name} ${number}`;
	console.log(`🔍 Zapytanie o kartę: ${fullName}`);

	try {
		const priceInPLN = await scrapeCard(fullName);

		if (priceInPLN == null) {
			return res.status(404).json({ error: 'Price not found' });
		}

		const rounded = priceInPLN.toFixed(2);
		res.json({ price: `${rounded}` });
	} catch (err) {
		console.error(`Błąd podczas przetwarzania zapytania: ${err.message}`);
		res.status(500).json({ error: 'Scraping failed', message: err.message });
	}
});

// Używaj portu z zmiennej środowiskowej
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`🟢 Server running on port ${PORT}`);
	console.log(`🔗 Available endpoints:`);
	console.log(`   - GET  /`);
	console.log(`   - POST /api/price`);
});
