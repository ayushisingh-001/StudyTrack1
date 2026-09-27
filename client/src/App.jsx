import React, { useState, useEffect, useCallback } from 'react';
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import {
  syncUserWithBackend,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchUsers,
  switchUserRole,
} from './api';

/**
 * Main App Component
 * Demonstrates:
 * 1. Clerk Authentication integration (SignedIn / SignedOut gates)
 * 2. React Hooks for local state management (useState, useEffect, useCallback)
 * 3. Role-Based Access Control (RBAC) switching between Student and Admin views
 * 4. CRUD operations with backend Express API
 */
const AppContent = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // App State
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionRate: 0,
  });
  const [students, setStudents] = useState([]);
  const [currentRole, setCurrentRole] = useState('user');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Helper to show temporary alert banners
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // 1. Sync User to MongoDB upon login
  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!user) return;
        const email = user.primaryEmailAddress?.emailAddress || '';
        const name = user.fullName || user.firstName || email.split('@')[0];

        const res = await syncUserWithBackend(getToken, { email, name });
        if (res.success && res.user) {
          setCurrentRole(res.user.role);
          if (res.user.role === 'admin') {
            setActiveTab('admin');
          }
        }
      } catch (err) {
        console.error('Error syncing user with backend:', err);
      }
    };

    syncUser();
  }, [user, getToken]);

  // 2. Fetch Tasks from API (Filtered by search & status)
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTasks(getToken, searchQuery, statusFilter);
      if (res.success) {
        setTasks(res.tasks || []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.role) {
          setCurrentRole(res.role);
        }
      } else {
        showAlert(res.message || 'Failed to load tasks', 'danger');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showAlert('Unable to connect to server. Is the backend running?', 'danger');
    } finally {
      setLoading(false);
    }
  }, [getToken, searchQuery, statusFilter]);

  // 3. Fetch Registered Students (for Admin task assignment)
  const loadStudents = useCallback(async () => {
    try {
      const res = await fetchUsers(getToken);
      if (res.success) {
        setStudents(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [getToken]);

  // Load tasks whenever search, status filter, or active view changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Load students list
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 4. CRUD Handler: Change Status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTask(getToken, taskId, { status: newStatus });
      if (res.success) {
        showAlert(`Task marked as ${newStatus}`);
        loadTasks();
      } else {
        showAlert(res.message || 'Failed to update status', 'danger');
      }
    } catch (err) {
      showAlert('Server error while updating status', 'danger');
    }
  };

  // 5. CRUD Handler: Create Task
  const handleCreateTask = async (formData) => {
    try {
      const res = await createTask(getToken, formData);
      if (res.success) {
        showAlert('New task created successfully!');
        loadTasks();
      } else {
        showAlert(res.message || 'Failed to create task', 'danger');
      }
    } catch (err) {
      showAlert('Server error while creating task', 'danger');
    }
  };

  // 6. CRUD Handler: Edit Task
  const handleEditTask = async (taskId, formData) => {
    try {
      const res = await updateTask(getToken, taskId, formData);
      if (res.success) {
        showAlert('Task updated successfully!');
        loadTasks();
      } else {
        showAlert(res.message || 'Failed to update task', 'danger');
      }
    } catch (err) {
      showAlert('Server error while updating task', 'danger');
    }
  };

  // 7. CRUD Handler: Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTask(getToken, taskId);
      if (res.success) {
        showAlert('Task deleted successfully!');
        loadTasks();
      } else {
        showAlert(res.message || 'Failed to delete task', 'danger');
      }
    } catch (err) {
      showAlert('Server error while deleting task', 'danger');
    }
  };

  // 8. Demo Helper: Toggle Role between Admin and Student
  const handleToggleRole = async () => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await switchUserRole(getToken, nextRole);
      if (res.success) {
        setCurrentRole(nextRole);
        setActiveTab(nextRole === 'admin' ? 'admin' : 'dashboard');
        showAlert(`Switched to ${nextRole === 'admin' ? 'Admin' : 'Student'} role!`);
        loadTasks();
      }
    } catch (err) {
      showAlert('Failed to switch role', 'danger');
    }
  };

  const studentName = user?.firstName || user?.fullName || 'Student';

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleRole={handleToggleRole}
      />

      <main className="main-content">
        {/* Alert Notifications */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* View Switcher based on Active Tab */}
        {activeTab === 'admin' && currentRole === 'admin' ? (
          <AdminPanel
            tasks={tasks}
            stats={stats}
            loading={loading}
            userRole={currentRole}
            students={students}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        ) : (
          <Dashboard
            tasks={tasks}
            stats={stats}
            loading={loading}
            userRole={currentRole}
            students={students}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            studentName={studentName}
          />
        )}
      </main>
    </div>
  );
};

/**
 * Root App Component wrapped with Clerk Authentication check
 */
const App = () => {
  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <AppContent />
      </SignedIn>
    </>
  );
};

export default App;
