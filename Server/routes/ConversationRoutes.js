import express from 'express';
import {
	fetchUserConversations,
	fetchMessages,
	deleteConversation,
} from '../controllers/ConversationController.js';
const router = express.Router();

router.get('/fetch-conversations', fetchUserConversations);
router.get('/fetch-messages', fetchMessages);
router.delete('/delete-conversation/:id', deleteConversation);
export default router;
