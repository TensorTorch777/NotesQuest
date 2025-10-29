const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Debug logging
    console.log('Registration request received:', { 
      firstName: firstName?.substring(0, 10), 
      lastName: lastName?.substring(0, 10),
      email, 
      phoneNumber: phoneNumber?.substring(0, 15),
      passwordLength: password?.length 
    });

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required: firstName, lastName, email, phoneNumber, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password
    });

    // Validate before saving
    try {
      await user.validate();
    } catch (validationError) {
      console.error('Validation error:', validationError.errors);
      const errorMessages = Object.values(validationError.errors).map(err => err.message).join(', ');
      return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
    }
    res.status(500).json({ 
      error: 'Failed to register user',
      message: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ error: 'Account is deactivated' });
    }

    // Update last active
    await user.updateLastActive();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: user.usage
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login',
      message: error.message 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fullName: req.user.fullName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        preferences: req.user.preferences,
        subscription: req.user.subscription,
        usage: req.user.usage,
        authProvider: req.user.authProvider
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      message: error.message 
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, preferences } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: user.usage
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message 
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password',
      message: error.message 
    });
  }
});

// Logout user (optional endpoint for server-side session management)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. This endpoint can be used for server-side
    // session cleanup if needed in the future.
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Failed to logout',
      message: error.message 
    });
  }
});

module.exports = router;





