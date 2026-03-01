import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token and attach user to request
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found, authorization denied'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Verify if user is an admin
export const verifyAdmin = (req, res, next) => {
  try {
    // Check if user exists from verifyUser middleware
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied, admin only'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Verify if user is the author of a question
export const verifyAuthor = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    // Check if user exists from verifyUser middleware
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Import Question model dynamically to avoid circular dependency
    const Question = (await import('../models/Question.js')).default;

    // Find the question
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    // Compare author ObjectId with user ObjectId
    if (question.author.toString() !== req.user._id.toString()) {
      const err = new Error('You are not the author of this question');
      err.status = 403;
      return next(err);
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
