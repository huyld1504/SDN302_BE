
import { Router } from "express";
import { quizRouter } from "./quiz.route.js";
import { questionRouter } from "./question.route.js";
import { userRouter } from "./user.route.js";
import { authRouter } from "./auth.route.js";

const appRouter = Router();

// Auth routes: /api/v1/auth
appRouter.use('/auth', authRouter);

// Quiz routes: /api/v1/quizzes
appRouter.use('/quizzes', quizRouter);

// Question routes: /api/v1/questions
appRouter.use('/questions', questionRouter);

// User routes: /api/v1/users
appRouter.use('/users', userRouter);

export { appRouter };