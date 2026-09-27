import React, { useState } from 'react';
import { Plus, Search, Filter, ShieldCheck, Users } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

/**
 * AdminPanel Page (Administrator View)
 * Allows administrators to oversee all tasks across all students,
 * create and assign tasks to specific students, edit assignments, and delete tasks.
 */
const AdminPanel = ({
  tasks,
  stats,
  loading,
  userRole,
  students,
  onStatusChange,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask) {
      await onEditTask(editingTask._id, formData);
    } else {
      await onCreateTask(formData);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#db2777" />
            <h1 className="page-title">Administrator Management Panel</h1>
          </div>
          <p className="page-subtitle">
            View all tasks across all registered students, assign new assignments, or edit existing records.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Assign New Task
        </button>
      </div>

      {/* System-Wide Task Completion Progress */}
      <ProgressBar stats={stats} title="System-Wide Student Completion Rate" />

      {/* Registered Students Info Box */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}>
          <Users size={16} />
          <span>
            <strong>{students.length}</strong> Registered Student(s) available for task assignment.
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        {/* Search by Title */}
        <div className="search-input-wrap">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search all tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter by Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List (Admin has full edit/delete privileges) */}
      <TaskList
        tasks={tasks}
        userRole={userRole}
        onStatusChange={onStatusChange}
        onEditTask={handleOpenEdit}
        onDeleteTask={onDeleteTask}
        loading={loading}
      />

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        userRole={userRole}
        students={students}
      />
    </div>
  );
};

export default AdminPanel;
