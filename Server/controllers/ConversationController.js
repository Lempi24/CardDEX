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
export const fetchMessages = async (req, res) => {
	try {
		const { room } = req.query;
		const conversation = await Conversation.findById(room);
		const messageArray = conversation.messages;

		res.status(200).json({ messagesArray: messageArray });
	} catch (error) {
		console.error("Error fetching user's messages:", error);
		res.status(500).json({ message: 'Server error while fetching messages.' });
	}
};
