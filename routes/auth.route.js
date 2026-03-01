import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { verifyUser } from '../middleware/authenticate.js';

const authRouter = Router();

// POST /auth/register - Register a new user
authRouter.post('/register', register);

// POST /auth/login - Login user
authRouter.post('/login', login);

// GET /auth/me - Get current user profile (requires authentication)
authRouter.get('/me', verifyUser, getProfile);

export { authRouter };
