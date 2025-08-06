import express from 'express';
import {
	addCard,
	getUserCards,
	updateCardPrice,
	deleteCard,
	fetchUserCardsValue,
	shareCard,
	fetchCardsForTrade,
	fetchTradeSearchResults,
} from '../controllers/CardController.js';
const router = express.Router();

router.post('/addcard', addCard);
router.get('/', getUserCards);
router.get('/fetch-value', fetchUserCardsValue);
router.put('/update-price', updateCardPrice);
router.delete('/deletecard/:id', deleteCard);
router.put('/share', shareCard);
router.get('/cards-for-trade', fetchCardsForTrade);
router.get('/trade-results', fetchTradeSearchResults);
export default router;
