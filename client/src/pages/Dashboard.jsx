import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

/**
 * Dashboard Page (Student View)
 * Displays the student's assigned tasks, progress bar, search/filter controls,
 * and allows creating new study tasks.
 */
const Dashboard = ({
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
  studentName,
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
          <h1 className="page-title">Welcome back, {studentName}! 🎓</h1>
          <p className="page-subtitle">
            Manage your assignments, deadlines, and study goals in one place.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Progress Tracker Card */}
      <ProgressBar stats={stats} title="Study Progress" />

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        {/* Search by Title */}
        <div className="search-input-wrap">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
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

      {/* Task List */}
      <TaskList
        tasks={tasks}
        userRole={userRole}
        onStatusChange={onStatusChange}
        onEditTask={handleOpenEdit}
        onDeleteTask={onDeleteTask}
        loading={loading}
      />

      {/* Task Form Modal (Create or Edit) */}
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

export default Dashboard;
