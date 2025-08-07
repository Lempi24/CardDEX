import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
	{
		proposingUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		receivingUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		offeredCard: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Card',
			required: true,
		},
		requestedCard: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Card',
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'denied'],
			required: true,
		},
	},
	{ timestamps: true }
);
const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;
