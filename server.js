import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
	})
);
app.use(express.json());

// Serwowanie plików statycznych z katalogu dist (lub build)
app.use(express.static(path.join(__dirname, 'dist')));

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
		console.error(err);
		res.status(500).json({ error: 'Scraping failed' });
	}
});

// Obsługa głównej ścieżki
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Obsługa dodatkowych ścieżek
app.get(['/index.html', '/main-page'], (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Obsługa specyficznych ścieżek, jeśli używasz routingu po stronie klienta
app.get('/index.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`🟢 Backend działa na http://localhost:${PORT}`);
	console.log(`🌐 Dostępny również na zewnętrznych interfejsach`);
});
