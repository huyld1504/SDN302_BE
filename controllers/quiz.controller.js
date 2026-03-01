import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";

// GET /quizzes - Get all quizzes with populated questions
const getQuizzes = async (req, res) => {
  try {
    const { title } = req.query;
    let filter = {};

    if (title) {
      filter.title = {
        $regex: title,
        $options: 'i'
      };
    }

    const quizzes = await Quiz.find(filter).populate({
      path: 'questions',
      select: 'text options keywords correctAnswerIndex'
    });

    return res.status(200).json({
      message: 'Quizzes fetched successfully',
      data: quizzes
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /quizzes - Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    const quiz = new Quiz({
      title,
      description,
      author: req.user._id
    });

    await quiz.save();
    return res.status(201).json({
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /quizzes/:quizId - Get a specific quiz
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      select: 'text options keywords correctAnswerIndex'
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.status(200).json({
      message: 'Quiz fetched successfully',
      data: quiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /quizzes/:quizId - Update a quiz
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        title: title || quiz.title,
        description: description || quiz.description
      },
      { new: true }
    ).populate({
      path: 'questions',
      select: 'text options keywords correctAnswerIndex'
    });

    return res.status(200).json({
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /quizzes/:quizId - Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    await Question.deleteMany({ _id: { $in: deletedQuiz.questions } });

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /quizzes/:quizId/populate - Get quiz with questions containing "capital" keyword
const getQuizWithCapitalQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      match: { keywords: { $in: [/capital/i] } },
      select: 'text options keywords correctAnswerIndex'
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.status(200).json({
      message: 'Quiz with capital questions fetched successfully',
      data: quiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /quizzes/:quizId/question - Add a single question to quiz
const addQuestionToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
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

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = new Question({
      text,
      options,
      keywords: keywords || [],
      correctAnswerIndex,
      author: req.user._id
    });

    await question.save();

    quiz.questions.push(question._id);
    await quiz.save();

    const updatedQuiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      select: 'text options keywords correctAnswerIndex'
    });

    return res.status(201).json({
      message: 'Question added to quiz successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /quizzes/:quizId/questions - Add multiple questions to quiz
const addQuestionsToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: 'Questions array is required and must not be empty'
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Validate all questions before creating any
    for (const q of questions) {
      if (!q.text || !q.options || q.correctAnswerIndex === undefined) {
        return res.status(400).json({
          message: 'Each question must have text, options, and correctAnswerIndex'
        });
      }

      if (!Array.isArray(q.options) || q.options.length === 0) {
        return res.status(400).json({
          message: 'Each question\'s options must be a non-empty array'
        });
      }

      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
        return res.status(400).json({
          message: 'Each question\'s correctAnswerIndex must be a valid index in the options array'
        });
      }
    }

    const questionDocs = await Question.insertMany(questions.map(q => ({
      text: q.text,
      options: q.options,
      keywords: q.keywords || [],
      correctAnswerIndex: q.correctAnswerIndex,
      author: req.user._id
    })));

    quiz.questions.push(...questionDocs.map(q => q._id));
    await quiz.save();

    const updatedQuiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      select: 'text options keywords correctAnswerIndex'
    });

    return res.status(201).json({
      message: 'Questions added to quiz successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizWithCapitalQuestions,
  addQuestionToQuiz,
  addQuestionsToQuiz
};