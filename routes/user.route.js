import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { verifyUser, verifyAdmin } from '../middleware/authenticate.js';

const userRouter = Router();

// GET /users - Get all users (Admin only)
userRouter.get('/', verifyUser, verifyAdmin, getAllUsers);

export { userRouter };
