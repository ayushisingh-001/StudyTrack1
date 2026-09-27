import React from 'react';
import { Calendar, User, Trash2, Edit3, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * TaskList Component
 * Renders individual task items with status indicators, metadata,
 * role-aware action buttons (Edit, Delete, Quick Status change).
 */
const TaskList = ({
  tasks,
  userRole,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  loading,
}) => {
  // Helper to format due date nicely (e.g. "Oct 12, 2026")
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="status-badge badge-completed">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="status-badge badge-progress">
            <Clock size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span className="status-badge badge-pending">
            <AlertCircle size={12} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-text">Loading tasks...</div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <div className="empty-text">No tasks found</div>
        <p style={{ fontSize: '0.88rem' }}>
          Try clearing your search query or create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isCompleted = task.status === 'Completed';
        const isProgress = task.status === 'In Progress';
        const cardClass = isCompleted
          ? 'task-item is-completed'
          : isProgress
          ? 'task-item is-progress'
          : 'task-item is-pending';

        return (
          <div key={task._id} className={cardClass}>
            <div className="task-main-row">
              {/* Task Details */}
              <div className="task-info">
                <div className="task-title-row">
                  <h3 className={`task-title ${isCompleted ? 'completed-text' : ''}`}>
                    {task.title}
                  </h3>
                  {renderStatusBadge(task.status)}
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                {/* Metadata Row: Due date and Assignee */}
                <div className="task-meta-row">
                  <div className="task-meta-item">
                    <Calendar size={14} />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>

                  <div className="task-meta-item">
                    <User size={14} />
                    <span>Assigned to: {task.assignedToName || 'Student'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="task-actions">
                {/* Quick Status Dropdown (Accessible to both Student & Admin) */}
                <select
                  className="status-quick-select"
                  value={task.status}
                  onChange={(e) => onStatusChange(task._id, e.target.value)}
                  title="Change status"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Admin Actions: Edit and Delete */}
                {userRole === 'admin' && (
                  <>
                    <button
                      className="btn btn-sm btn-outline"
                      title="Edit task"
                      onClick={() => onEditTask(task)}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete task"
                      onClick={() => onDeleteTask(task._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
