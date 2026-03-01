import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /auth/register - Register a new user
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// POST /auth/login - Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// GET /auth/me - Get current user profile
export const getProfile = async (req, res) => {
  try {
    // User is already attached to req.user by verifyUser middleware
    return res.status(200).json({
      message: 'Profile fetched successfully',
      data: {
        _id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
