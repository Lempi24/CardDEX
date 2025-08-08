import Trade from '../models/Trade.js';

export const createTrade = async (req, res) => {
	try {
		const { proposingUser, receivingUser, offeredCard, requestedCard } =
			req.body;

		const newTrade = new Trade({
			proposingUser: req.user._id,
			receivingUser: receivingUser,
			offeredCard: offeredCard,
			requestedCard: requestedCard,
			status: 'pending',
		});

		await newTrade.save();
		res
			.status(201)
			.json({ message: 'Trade offer created successfully!', trade: newTrade });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error while creating trade' });
	}
};

export const fetchTrade = async (req, res) => {
	try {
		const userId = req.user._id;

		const trades = await Trade.find({
			$or: [{ proposingUser: userId }, { receivingUser: userId }],
		})
			.populate('proposingUser', 'username')
			.populate('receivingUser', 'userName')
			.populate('offeredCard', 'imageUrl')
			.populate('requestedCard', 'imageUrl')
			.sort({ createdAt: -1 });

		res.status(200).json({ userTrades: trades });
	} catch (error) {
		console.error("Error fetching user's trades:", error);
		res.status(500).json({ message: 'Server error while fetching trades.' });
	}
};
