import express from 'express';
import {
	addCard,
	getUserCards,
	updateCardPrice,
} from '../controllers/CardController.js';
const router = express.Router();

router.post('/addcard', addCard);
router.get('/', getUserCards);
router.put('/update-price', updateCardPrice);

export default router;
