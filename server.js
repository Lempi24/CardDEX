// Plik: server.js
import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - kolejność ma znaczenie!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// Obsługa OPTIONS (preflight requests)
app.options('*', cors());

// Health check endpoint dla Railway
app.get('/', (req, res) => {
	res.json({ status: 'ok', message: 'API działa poprawnie' });
});

// Diagnostyczny endpoint - sprawdza czy API działa
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Główny endpoint - obsługa obu metod
app.all('/api/price', async (req, res) => {
	console.log(`📥 Otrzymano ${req.method} request na /api/price`);

	// Jeśli to GET, zwróć informację
	if (req.method === 'GET') {
		return res.json({ message: 'Użyj metody POST do pobierania cen kart' });
	}

	// Dla metody POST, kontynuuj normalną logikę
	if (req.method === 'POST') {
		const { name, number } = req.body;

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
		return;
	}

	// Dla innych metod
	res.status(405).json({ error: 'Method not allowed' });
});

// Catch-all dla nieobsługiwanych ścieżek
app.use((req, res) => {
	console.log(`⚠️ Nieznana ścieżka: ${req.path}, metoda: ${req.method}`);
	res.status(404).json({ error: 'Not found', path: req.path });
});

// Obsługa błędów
app.use((err, req, res, next) => {
	console.error('❌ Błąd serwera:', err);
	res
		.status(500)
		.json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`🟢 Backend działa na porcie ${PORT}`);
});
