import express from 'express';
import { registerUser } from '../controllers/UserController.js';
import { loginUser } from '../controllers/UserController.js';
import { getUserData } from '../controllers/UserController.js';
import { updateUserAvatar } from '../controllers/UserController.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/fetch-user-data', getUserData);
router.put('/update-avatar', updateUserAvatar);
export default router;
