import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		number: { type: String, required: true },
		imageUrl: { type: String, required: true },
		price: { type: String },
		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);
const Card = mongoose.model('Card', cardSchema);
export default Card;
