import Card from '../models/Card.js';

export const addCard = async (req, res) => {
	const { pokemonName, cardNumber, cardPrice, cardURL } = req.body;
	try {
		const newCard = new Card({
			name: pokemonName,
			price: cardPrice,
			number: cardNumber,
			imageUrl: cardURL,
			ownerId: req.user._id,
		});
		await newCard.save();
		res.status(201).json({ message: 'Card added', card: newCard });
	} catch (error) {
		res.status(500).json({ message: 'Failed to add card' });
	}
};

export const getUserCards = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 9;
		const skip = (page - 1) * limit;

		const totalCards = await Card.countDocuments({ ownerId: req.user._id });
		const cards = await Card.find({ ownerId: req.user._id })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		res.status(200).json({
			message: 'Cards retrieved successfully',
			cards,
			currentPage: page,
			totalPages: Math.ceil(totalCards / limit),
		});
	} catch (error) {
		console.error('Error getting user cards:', error);
		res.status(500).json({ message: 'Failed to get cards' });
	}
};

export const updateCardPrice = async (req, res) => {
	const { cardId, newPrice } = req.body;

	try {
		const card = await Card.findOne({
			_id: cardId,
			ownerId: req.user._id,
		});

		if (!card) {
			return res.status(404).json({ message: 'Card not found' });
		}

		card.price = newPrice;
		await card.save();

		res.status(200).json({
			message: 'Card price updated successfully',
			card,
		});
	} catch (error) {
		console.error('Error updating card price:', error);
		res.status(500).json({ message: 'Failed to update card price' });
	}
};
