import express from 'express';
import {
	fetchUserConversations,
	fetchMessages,
} from '../controllers/ConversationController.js';
const router = express.Router();

router.get('/fetch-conversations', fetchUserConversations);
router.get('/fetch-messages', fetchMessages);
export default router;
