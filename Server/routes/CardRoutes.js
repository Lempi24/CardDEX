import express from 'express';
import { addCard, getUserCards } from '../controllers/CardController.js';
const router = express.Router();

router.post('/addcard', addCard);
router.get('/', getUserCards);
export default router;
