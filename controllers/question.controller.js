import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";

// GET /questions - Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    return res.status(200).json({
      message: 'Questions fetched successfully',
      data: questions
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /questions - Create a new question
const createQuestion = async (req, res) => {
  try {
    const { text, options, keywords, correctAnswerIndex } = req.body;

    if (!text || !options || correctAnswerIndex === undefined) {
      return res.status(400).json({
        message: 'Text, options, and correctAnswerIndex are required'
      });
    }

    if (!Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        message: 'Options must be a non-empty array'
      });
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return res.status(400).json({
        message: 'CorrectAnswerIndex must be a valid index in the options array'
      });
    }

    const question = new Question({
      text,
      options,
      keywords: keywords || [],
      correctAnswerIndex,
      author: req.user._id
    });

    await question.save();
    return res.status(201).json({
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /questions/:questionId - Get a specific question
const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json({
      message: 'Question fetched successfully',
      data: question
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /questions/:questionId - Update a question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, options, keywords, correctAnswerIndex } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (options && (!Array.isArray(options) || options.length === 0)) {
      return res.status(400).json({
        message: 'Options must be a non-empty array'
      });
    }

    if (correctAnswerIndex !== undefined) {
      const optionsArray = options || question.options;
      if (correctAnswerIndex < 0 || correctAnswerIndex >= optionsArray.length) {
        return res.status(400).json({
          message: 'CorrectAnswerIndex must be a valid index in the options array'
        });
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        text: text || question.text,
        options: options || question.options,
        keywords: keywords || question.keywords,
        correctAnswerIndex: correctAnswerIndex !== undefined ? correctAnswerIndex : question.correctAnswerIndex
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /questions/:questionId - Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Quiz.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    await Question.findByIdAndDelete(questionId);

    return res.status(200).json({
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getAllQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};