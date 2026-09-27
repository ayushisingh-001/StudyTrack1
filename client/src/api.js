/**
 * API Service for StudyTrack
 * Centralized fetch functions for communicating with the Node.js + Express backend.
 * Uses Clerk session token for Bearer Authorization.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to build authorization headers with Clerk JWT token
 */
const getHeaders = async (getToken) => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Sync user profile to MongoDB after Clerk login
 */
export const syncUserWithBackend = async (getToken, userData) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/users/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify(userData),
  });
  return response.json();
};

/**
 * Fetch tasks with optional title search & status filter
 */
export const fetchTasks = async (getToken, search = '', status = 'All') => {
  const headers = await getHeaders(getToken);
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'All') params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, {
    method: 'GET',
    headers,
  });
  return response.json();
};

/**
 * Create a new task (Admin can assign to any student; Student assigns to self)
 */
export const createTask = async (getToken, taskData) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(taskData),
  });
  return response.json();
};

/**
 * Update a task (Admin can edit all; Student updates status)
 */
export const updateTask = async (getToken, taskId, updateData) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData),
  });
  return response.json();
};

/**
 * Delete a task (Admin only)
 */
export const deleteTask = async (getToken, taskId) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers,
  });
  return response.json();
};

/**
 * Get all registered students (used by Admin to assign tasks)
 */
export const fetchUsers = async (getToken) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers,
  });
  return response.json();
};

/**
 * Quick role switcher for demo/interview presentations
 */
export const switchUserRole = async (getToken, newRole) => {
  const headers = await getHeaders(getToken);
  const response = await fetch(`${API_BASE_URL}/users/role`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ role: newRole }),
  });
  return response.json();
};
