import express from 'express';
import { registerUser } from '../controllers/UserController.js';
import { loginUser } from '../controllers/UserController.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
export default router;
