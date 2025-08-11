import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const conversationSchema = mongoose.Schema(
	{
		relatedTrade: {
			type: mongoose.Types.ObjectId,
			ref: 'Trade',
			required: true,
			unique: true,
		},
		participants: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		],
		messages: [messageSchema],
	},
	{ timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
