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
export const shareCard = async (req, res) => {
	const { cardId } = req.body;
	try {
		const card = await Card.findOne({
			_id: cardId,
			ownerId: req.user._id,
		});
		if (!card) {
			return res.status(404).json({ message: 'Card not found' });
		}
		card.isForTrade = !card.isForTrade;
		const updatedCard = await card.save();
		res.status(200).json(updatedCard);
	} catch (error) {
		console.error('Error updating share status:', error);
		res.status(500).json({ message: 'Failed to update share status' });
	}
};
export const deleteCard = async (req, res) => {
	const cardId = req.params.id;
	try {
		await Card.findByIdAndDelete(cardId);
		res.status(200).json({ message: 'Card deleted successfully' });
	} catch (error) {
		console.error('Error deleting card:', error);
		res.status(500).json({ message: 'Failed to delete card' });
	}
};
export const fetchUserCardsValue = async (req, res) => {
	try {
		const cards = await Card.find({ ownerId: req.user._id });
		const totalValue = cards.reduce(
			(sum, card) => sum + parseFloat(card.price || 0),
			0
		);
		res.status(200).json({ cards, totalValue });
	} catch (error) {
		console.error('Error fetching user cards value:', error);
		res.status(500).json({ message: 'Failed to fetch user cards value' });
	}
};
export const fetchCardsForTrade = async (req, res) => {
	try {
		const cards = await Card.find({
			ownerId: req.user._id,
			isForTrade: true,
		});
		res.status(200).json({ cardsForTrade: cards });
	} catch (error) {
		console.error('Error fetching user cards for trade:', error);
		res.status(500).json({ message: 'Failed to fetch user cards for trade' });
	}
};
export const fetchTradeSearchResults = async (req, res) => {
	try {
		const { searchInput } = req.query;
		if (!searchInput) {
			return res.status(200).json({ cardsForTradeSearchResults: [] });
		}
		const cards = await Card.find({
			ownerId: { $ne: req.user._id },
			isForTrade: true,
			name: { $regex: searchInput, $options: 'i' },
		})
			.populate('ownerId', 'userName')
			.limit(20);
		const results = cards.map((card) => ({
			_id: card._id,
			name: card.name,
			imageUrl: card.imageUrl,
			ownerName: card.ownerId.userName,
			ownerId: card.ownerId._id.toString(),
		}));
		res.status(200).json({ cardsForTradeSearchResults: results });
	} catch (error) {
		console.error('Error fetching search results:', error);
		res.status(500).json({ message: 'Failed to fetch search results' });
	}
};
