import { Router } from "express";
import {
  getQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizWithCapitalQuestions,
  addQuestionToQuiz,
  addQuestionsToQuiz
} from "../controllers/quiz.controller.js";
import { verifyUser, verifyAdmin } from "../middleware/authenticate.js";

const quizRouter = Router();

quizRouter.get('/', getQuizzes);
quizRouter.post('/', verifyUser, verifyAdmin, createQuiz);
quizRouter.get('/:quizId', getQuizById);
quizRouter.put('/:quizId', verifyUser, verifyAdmin, updateQuiz);
quizRouter.delete('/:quizId', verifyUser, verifyAdmin, deleteQuiz);
quizRouter.get('/:quizId/populate', getQuizWithCapitalQuestions);
quizRouter.post('/:quizId/question', verifyUser, verifyAdmin, addQuestionToQuiz);
quizRouter.post('/:quizId/questions', verifyUser, verifyAdmin, addQuestionsToQuiz);

export { quizRouter };