import express from 'express';
import { createTrade, fetchTrade } from '../controllers/TradeController.js';
const router = express.Router();

router.post('/create', createTrade);
router.get('/user-trades', fetchTrade);
export default router;
