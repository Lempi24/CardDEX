import express from 'express';
import {
	addCard,
	getUserCards,
	updateCardPrice,
	deleteCard,
} from '../controllers/CardController.js';
const router = express.Router();

router.post('/addcard', addCard);
router.get('/', getUserCards);
router.put('/update-price', updateCardPrice);
router.delete('/deletecard/:id', deleteCard);
export default router;
