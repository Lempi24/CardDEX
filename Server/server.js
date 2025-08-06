import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { scrapeCard, initializeBrowser, closeBrowser } from './scraper.js';

import authRoute from './routes/UserRoutes.js';
import cardsRoute from './routes/CardRoutes.js';
import { connectDB } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	})
);
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/cards', authenticateToken, cardsRoute);

//scrape samej ceny karty
app.post('/api/scrape-price', async (req, res) => {
	const { cardName, filter, language } = req.body;
	try {
		const result = await scrapeCard(
			cardName,
			filter || 'price trend',
			language || '1',
			{ price: true, image: false }
		);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: 'Failed to scrape price' });
	}
});
//scrape ceny i obrazka
app.post('/api/price', async (req, res) => {
	const { name, number, filter, language } = req.body;
	if (!name || !number) {
		return res.status(400).json({ error: 'Missing name or number' });
	}
	const fullName = `${name} ${number}`;
	try {
		const result = await scrapeCard(
			fullName,
			filter || 'price trend',
			language || '1',
			{ price: true, image: true }
		);
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
		const imageResponse = await fetch(imageUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.cardmarket.com/',
			},
		});
		if (!imageResponse.ok) {
			return res
				.status(imageResponse.status)
				.json({ error: 'Failed to fetch image' });
		}
		const contentType = imageResponse.headers.get('content-type');
		res.setHeader('Content-Type', contentType || 'image/jpeg');
		res.setHeader('Cache-Control', 'public, max-age=86400');

		const arrayBuffer = await imageResponse.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		res.send(buffer);
	} catch (err) {
		console.error('Proxy error:', err);
		res.status(500).json({ error: 'Image proxy failed' });
	}
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
	try {
		await connectDB();
		await initializeBrowser();
		app.listen(PORT, '0.0.0.0', () => {
			console.log(` Backend działa na http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error(' Nie udało się uruchomić serwera:', error);
		process.exit(1);
	}
};

const gracefulShutdown = async (signal) => {
	console.log(`\n Otrzymano sygnał ${signal}. Rozpoczynam zamykanie...`);

	await closeBrowser();

	await mongoose.connection.close(false);

	process.exit(0);
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
