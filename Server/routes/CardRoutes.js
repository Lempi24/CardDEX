import express from 'express';
import {
	addCard,
	getUserCards,
	updateCardPrice,
	deleteCard,
	fetchUserCardsValue,
} from '../controllers/CardController.js';
const router = express.Router();

router.post('/addcard', addCard);
router.get('/', getUserCards);
router.get('/fetch-value', fetchUserCardsValue);
router.put('/update-price', updateCardPrice);
router.delete('/deletecard/:id', deleteCard);
export default router;
