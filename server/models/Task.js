const mongoose = require('mongoose');

// Task Schema: Represents student assignments and tasks
// Demonstrates Mongoose schema definition with validation and enums
const taskSchema = new mongoose.Schema(
  {
    // Task title (e.g. 'Complete Math Assignment 3')
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    // Detailed instructions or notes
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional deadline for the task
    dueDate: {
      type: Date,
      default: null,
    },
    // Task progress status with allowed values
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    // Clerk User ID of the student assigned to this task
    assignedTo: {
      type: String,
      required: [true, 'Assigned student ID is required'],
    },
    // Friendly name or email for quick display in the frontend
    assignedToName: {
      type: String,
      default: '',
    },
    // Clerk User ID of the user (Admin or Student) who created this task
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
