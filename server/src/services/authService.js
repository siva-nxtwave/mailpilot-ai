const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { logActivity } = require('./activityService');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

const register = async ({ name, email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.code = 'EMAIL_IN_USE';
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: (name || '').trim(),
    email: normalizedEmail,
    password,
    role: 'user',
    lastLogin: new Date()
  });

  const token = generateToken(user);

  await logActivity({
    owner: user._id,
    action: 'USER_REGISTERED',
    metadata: { email: user.email }
  }).catch(() => {});

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.code = 'AUTH_INVALID';
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.code = 'AUTH_INVALID';
    error.statusCode = 401;
    throw error;
  }

  const now = new Date();
  await User.updateOne({ _id: user._id }, { $set: { lastLogin: now } });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: now
    },
    token
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };
};

module.exports = {
  register,
  login,
  getCurrentUser,
  generateToken
};
