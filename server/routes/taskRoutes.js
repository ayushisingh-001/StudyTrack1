const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * HELPER FUNCTION: Get authenticated user record from MongoDB
 * Validates Clerk token and loads the application role ('admin' or 'user').
 */
const getAuthenticatedUser = async (req) => {
  const { userId } = getAuth(req);
  if (!userId) return null;

  // Find user in MongoDB to check their role
  const user = await User.findOne({ clerkUserId: userId });
  return { clerkUserId: userId, user };
};

/**
 * GET /api/tasks
 * Retrieves tasks with search & status filters, with Role-Based Access Control (RBAC):
 * - Admin: Sees all tasks across all students.
 * - Student (user): Sees ONLY tasks assigned to their Clerk user ID.
 *
 * Query params:
 * - search: filters tasks by title (case-insensitive)
 * - status: filters by status ('All', 'Pending', 'In Progress', 'Completed')
 */
router.get('/', async (req, res) => {
  try {
    const authData = await getAuthenticatedUser(req);
    if (!authData || !authData.clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { clerkUserId, user } = authData;
    const userRole = user?.role || 'user';

    const { search, status } = req.query;

    // Build Mongoose filter query
    const filter = {};

    // RBAC: If student, restrict to their own assigned tasks
    if (userRole !== 'admin') {
      filter.assignedTo = clerkUserId;
    }

    // Title search filter (case-insensitive regex)
    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Fetch tasks sorted by newest first
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // Calculate progress stats for the current view
    // (Completed / Total)
    const baseFilter = userRole === 'admin' ? {} : { assignedTo: clerkUserId };
    const allUserTasks = await Task.find(baseFilter);
    const totalCount = allUserTasks.length;
    const completedCount = allUserTasks.filter((t) => t.status === 'Completed').length;
    const pendingCount = allUserTasks.filter((t) => t.status === 'Pending').length;
    const inProgressCount = allUserTasks.filter((t) => t.status === 'In Progress').length;

    const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    res.status(200).json({
      success: true,
      role: userRole,
      tasks,
      stats: {
        total: totalCount,
        completed: completedCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completionRate,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks', error: error.message });
  }
});

/**
 * POST /api/tasks
 * Creates a new task.
 * - Admin can assign a task to any registered student.
 * - Student can create a task for themselves.
 */
router.post('/', async (req, res) => {
  try {
    const authData = await getAuthenticatedUser(req);
    if (!authData || !authData.clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { clerkUserId, user } = authData;
    const userRole = user?.role || 'user';

    const { title, description, dueDate, status, assignedTo } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Determine target assignee:
    // Admin can choose any student; Students can only assign to themselves.
    let targetAssignee = clerkUserId;
    let targetAssigneeName = user?.name || user?.email || 'Student';

    if (userRole === 'admin' && assignedTo) {
      targetAssignee = assignedTo;
      // Look up student name for display convenience
      const assignedUser = await User.findOne({ clerkUserId: assignedTo });
      if (assignedUser) {
        targetAssigneeName = assignedUser.name || assignedUser.email;
      }
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDate || null,
      status: status || 'Pending',
      assignedTo: targetAssignee,
      assignedToName: targetAssigneeName,
      createdBy: clerkUserId,
    });

    const savedTask = await newTask.save();
    res.status(201).json({ success: true, task: savedTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task', error: error.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Updates an existing task:
 * - Admin: Can edit all fields (title, description, dueDate, status, assignedTo).
 * - Student: Can ONLY update the status ('Pending', 'In Progress', 'Completed') of their own task.
 */
router.put('/:id', async (req, res) => {
  try {
    const authData = await getAuthenticatedUser(req);
    if (!authData || !authData.clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { clerkUserId, user } = authData;
    const userRole = user?.role || 'user';

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Role-based authorization check:
    if (userRole === 'admin') {
      // Admin has full edit permissions
      const { title, description, dueDate, status, assignedTo } = req.body;

      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (status !== undefined) task.status = status;

      if (assignedTo !== undefined && assignedTo !== task.assignedTo) {
        task.assignedTo = assignedTo;
        const assigneeUser = await User.findOne({ clerkUserId: assignedTo });
        task.assignedToName = assigneeUser ? assigneeUser.name || assigneeUser.email : 'Student';
      }
    } else {
      // Student: check if task is assigned to this student
      if (task.assignedTo !== clerkUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own assigned tasks' });
      }

      // Student can only modify the status
      const { status } = req.body;
      if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update' });
      }

      task.status = status;
    }

    const updatedTask = await task.save();
    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task', error: error.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task.
 * - Admin can delete any task.
 * - Students are restricted from deleting tasks (interviews love this RBAC distinction!).
 */
router.delete('/:id', async (req, res) => {
  try {
    const authData = await getAuthenticatedUser(req);
    if (!authData || !authData.clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { clerkUserId, user } = authData;
    const userRole = user?.role || 'user';

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admin can delete any task; students cannot delete assignments
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only administrators can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task', error: error.message });
  }
});

module.exports = router;
