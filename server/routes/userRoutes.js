const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const User = require('../models/User');

/**
 * POST /api/users/sync
 * Syncs the authenticated Clerk user into MongoDB.
 * Called by frontend right after Clerk signs in.
 *
 * Interview Tip:
 * "Clerk handles authentication, while our database stores application authorization
 * and user roles. This endpoint ensures our MongoDB User collection stays in sync."
 */
router.post('/sync', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
    }

    const { email, name } = req.body;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      // If this is the very first user in the system, automatically grant 'admin' role
      // This makes testing and demoing the project frictionless!
      const totalUsers = await User.countDocuments();
      const initialRole = totalUsers === 0 ? 'admin' : 'user';

      user = new User({
        clerkUserId: userId,
        email: email || 'user@studytrack.com',
        name: name || 'Student',
        role: initialRole,
      });

      await user.save();
    } else {
      // Update name/email if changed in Clerk
      let hasChanges = false;
      if (email && user.email !== email) {
        user.email = email;
        hasChanges = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server error while syncing user', error: error.message });
  }
});

/**
 * GET /api/users/me
 * Retrieves current user profile and role from MongoDB.
 */
router.get('/me', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found in database. Please sync.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/users
 * Returns list of all registered users (for Admin task assignment).
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch all users for dropdown selection
    const users = await User.find({}, 'clerkUserId name email role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PATCH /api/users/role
 * Demo helper endpoint: Switch between 'admin' and 'user' roles.
 * Allows quick role switching during portfolio presentations without touching MongoDB manually.
 */
router.patch('/role', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user or admin.' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { role },
      { new: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error toggling role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
