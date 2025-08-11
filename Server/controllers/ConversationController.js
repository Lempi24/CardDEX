import Conversation from '../models/Conversation.js';

export const fetchUserConversations = async (req, res) => {
	try {
		const userId = req.user._id;
		const conversations = await Conversation.find({
			participants: userId,
		})
			.populate('participants', 'userName')
			.sort({ createdAt: -1 });

		res.status(200).json({ fetchedConversations: conversations });
	} catch (error) {
		console.error("Error fetching user's conversations:", error);
		res
			.status(500)
			.json({ message: 'Server error while fetching conversations.' });
	}
};
