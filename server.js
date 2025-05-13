import express from 'express';
import cors from 'cors';
import scrapeCard from './scraper.js';

const app = express();

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
	})
);
app.use(express.json());

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`🟢 Backend działa na porcie ${PORT}`);
});
