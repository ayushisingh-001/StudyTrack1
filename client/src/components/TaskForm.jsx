import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * TaskForm Component (Modal dialog)
 * Handles both "Create New Task" and "Edit Existing Task".
 * If user is Admin, allows selecting which student to assign the task to.
 */
const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  userRole = 'user',
  students = [],
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    assignedTo: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Populate form if editing existing task
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
        status: initialData.status || 'Pending',
        assignedTo: initialData.assignedTo || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Pending',
        assignedTo: students.length > 0 ? students[0].clerkUserId : '',
      });
    }
    setError('');
  }, [initialData, students, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = Boolean(initialData);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Read Chapter 4 - Data Structures"
                value={formData.title}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Add notes, study resources, or instructions..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Due Date & Status in a two-column row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Student Assignment (Visible to Admin only) */}
            {userRole === 'admin' && (
              <div className="form-group">
                <label className="form-label">Assign To Student</label>
                <select
                  name="assignedTo"
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  {students.map((student) => (
                    <option key={student.clerkUserId} value={student.clerkUserId}>
                      {student.name || student.email} ({student.email})
                    </option>
                  ))}
                  {students.length === 0 && (
                    <option value="">No other students found (assigned to you)</option>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
