import { Router } from "express";
import {
  getAllQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from "../controllers/question.controller.js";
import { verifyUser, verifyAuthor } from "../middleware/authenticate.js";

const questionRouter = Router();

questionRouter.get('/', getAllQuestions);
questionRouter.post('/', verifyUser, createQuestion);
questionRouter.get('/:questionId', getQuestionById);
questionRouter.put('/:questionId', verifyUser, verifyAuthor, updateQuestion);
questionRouter.delete('/:questionId', verifyUser, verifyAuthor, deleteQuestion);

export { questionRouter };