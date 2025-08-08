import express from 'express';
import {
	createTrade,
	fetchTrade,
	updateTrade,
} from '../controllers/TradeController.js';
const router = express.Router();

router.post('/create', createTrade);
router.get('/user-trades', fetchTrade);
router.put('/update-trade', updateTrade);
export default router;
