import Card from '../models/Card.js';

export const addCard = async (req, res) => {
	const { pokemonName, cardNumber, cardURL } = req.body;
	try {
		const newCard = new Card({
			name: pokemonName,
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
