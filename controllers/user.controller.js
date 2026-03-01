import User from '../models/User.js';

// GET /users - Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    return res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
