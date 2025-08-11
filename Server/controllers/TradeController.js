import Trade from '../models/Trade.js';
import Conversation from '../models/Conversation.js';
export const createTrade = async (req, res) => {
	try {
		const { receivingUser, offeredCard, requestedCard } = req.body;

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
			.populate('proposingUser', 'userName')
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
export const updateTrade = async (req, res) => {
	const { tradeId, choice } = req.body;
	let newConversation;
	try {
		const trade = await Trade.findOne({
			_id: tradeId,
		});
		trade.status = choice;
		await trade.save();
		if (choice === 'accepted') {
			newConversation = new Conversation({
				relatedTrade: trade._id,
				participants: [trade.proposingUser, trade.receivingUser],
				messagges: [],
			});
		}
		await newConversation.save();
		res.status(200).json({ message: 'Trade status updated successfully' });
	} catch (error) {
		console.error('Error updating trade status:', error);
		res.status(500).json({ message: 'Failed to update trade status' });
	}
};
