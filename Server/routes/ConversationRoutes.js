import express from 'express';
import { fetchUserConversations } from '../controllers/ConversationController.js';
const router = express.Router();

router.get('/fetch-conversations', fetchUserConversations);
export default router;
