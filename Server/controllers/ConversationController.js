import Conversation from '../models/Conversation.js';
import { io, userSocketMap } from '../server.js';

export const fetchUserConversations = async (req, res) => {
	try {
		const userId = req.user._id;
		const conversations = await Conversation.find({
			participants: userId,
			hiddenFor: { $ne: userId },
		})
			.populate('participants', 'userName')
			.populate('participants', 'userName avatar')
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

export const deleteConversation = async (req, res) => {
	const relatedTradeId = req.params.id;
	const userId = req.user._id.toString();

	try {
		const conversation = await Conversation.findOneAndUpdate(
			{ relatedTrade: relatedTradeId },
			{ $addToSet: { hiddenFor: userId } },
			{ new: true }
		).populate('participants', '_id');

		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		const otherParticipant = conversation.participants.find(
			(p) => p._id.toString() !== userId
		);

		if (otherParticipant) {
			const otherUserId = otherParticipant._id.toString();
			const otherUserSocketId = userSocketMap.get(otherUserId);

			if (otherUserSocketId) {
				io.to(otherUserSocketId).emit('partner_left_conversation', {
					conversationId: conversation._id.toString(),
					userLeft: true,
				});
			}
		}
		res.status(200).json({ message: 'Conversation deleted successfully' });
	} catch (error) {
		console.error('Error deleting conversation:', error);
		res.status(500).json({ message: 'Failed to delete conversation' });
	}
};
