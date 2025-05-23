import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import scrapeCard from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cardImagesDir = path.join(__dirname, 'public', 'card-images');
if (!fs.existsSync(cardImagesDir)) {
	fs.mkdirSync(cardImagesDir, { recursive: true });
}

const app = express();

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
	})
);
app.use(express.json());

app.use(
	'/card-images',
	express.static(path.join(__dirname, 'public', 'card-images'))
);

app.post('/api/price', async (req, res) => {
	const { name, number, filter, language } = req.body;

	if (!name || !number) {
		return res.status(400).json({ error: 'Missing name or number' });
	}

	const fullName = `${name} ${number}`;
	console.log(`🔍 Zapytanie o kartę: ${fullName}`);

	try {
		const result = await scrapeCard(fullName, filter, language);

		if (!result) {
			return res.status(404).json({ error: 'Card data not found' });
		}

		const rounded = result.price.toFixed(2);
		res.json({
			price: `${rounded}`,
			imageUrl: result.imageUrl,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Scraping failed' });
	}
});

app.get('/api/card-image', async (req, res) => {
	const imageUrl = req.query.url;

	if (!imageUrl) {
		return res.status(400).json({ error: 'Missing image URL' });
	}

	try {
		console.log(`🖼️ Pobieranie obrazka z: ${imageUrl}`);

		const imageResponse = await fetch(imageUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.cardmarket.com/',
			},
		});

		if (!imageResponse.ok) {
			console.error(
				`❌ Błąd pobierania obrazka: ${imageResponse.status} ${imageResponse.statusText}`
			);
			return res
				.status(imageResponse.status)
				.json({ error: 'Failed to fetch image' });
		}

		const contentType = imageResponse.headers.get('content-type');

		res.setHeader('Content-Type', contentType || 'image/jpeg');
		res.setHeader('Cache-Control', 'public, max-age=86400');

		const imageBuffer = await imageResponse.buffer();
		res.send(imageBuffer);
	} catch (err) {
		console.error('❌ Błąd proxy obrazka:', err);
		res.status(500).json({ error: 'Image proxy failed' });
	}
});

app.post('/api/save-card-image', async (req, res) => {
	const { imageUrl, cardName } = req.body;

	if (!imageUrl || !cardName) {
		return res.status(400).json({ error: 'Missing image URL or card name' });
	}

	try {
		console.log(`💾 Zapisywanie obrazka dla: ${cardName}`);

		const imageResponse = await fetch(imageUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.cardmarket.com/',
			},
		});

		if (!imageResponse.ok) {
			console.error(`❌ Błąd pobierania obrazka: ${imageResponse.status}`);
			return res
				.status(imageResponse.status)
				.json({ error: 'Failed to fetch image' });
		}

		const imageBuffer = await imageResponse.buffer();

		const safeName = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
		const fileName = `${safeName}_${Date.now()}.jpg`;
		const filePath = path.join(cardImagesDir, fileName);

		fs.writeFileSync(filePath, imageBuffer);

		const publicUrl = `/card-images/${fileName}`;
		console.log(`✅ Obrazek zapisany jako: ${publicUrl}`);

		res.json({ imageUrl: publicUrl });
	} catch (err) {
		console.error('❌ Błąd zapisywania obrazka:', err);
		res.status(500).json({ error: 'Image save failed' });
	}
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`🟢 Backend działa na http://localhost:${PORT}`);
	console.log(`🌐 Dostępny również na zewnętrznych interfejsach`);
});
