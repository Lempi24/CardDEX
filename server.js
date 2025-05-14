import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import scrapeCard from './scraper.js';

// Fixy do __dirname w ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// API endpoint
app.post('/api/price', async (req, res) => {
	const { name, number } = req.body;

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
		console.error('❌ Błąd scrapu:', err);
		res.status(500).json({ error: 'Scraping failed' });
	}
});

// Serwowanie frontendu z dist/
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: React router fallback
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start serwera
app.listen(port, '0.0.0.0', () => {
	console.log(`🟢 Serwer działa na http://localhost:${port}`);
});
