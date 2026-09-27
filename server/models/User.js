const mongoose = require('mongoose');

// User Schema: Stores user metadata and role, linked to Clerk Authentication
// Clerk manages password, tokens, and sessions.
// MongoDB stores application-specific data like roles and profile details.
const userSchema = new mongoose.Schema(
  {
    // The unique ID provided by Clerk (e.g., 'user_2xABC...')
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    // User's email address synced from Clerk
    email: {
      type: String,
      required: true,
      trim: true,
    },
    // User's display name synced from Clerk
    name: {
      type: String,
      trim: true,
      default: '',
    },
    // Role for role-based access control (RBAC):
    // 'admin' = can view all tasks, assign tasks, delete any task
    // 'user'  = student, can view and update status of their own assigned tasks
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
