import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { BookOpen, ShieldCheck, User as UserIcon, RefreshCw } from 'lucide-react';

/**
 * Navbar Component
 * Displays the branding, user info from Clerk, current role badge,
 * and navigation between Student Dashboard and Admin Panel.
 */
const Navbar = ({ currentRole, activeTab, setActiveTab, onToggleRole }) => {
  const { user } = useUser();

  // Extract primary email and display name from Clerk user object
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'student@studytrack.com';
  const displayName = user?.fullName || user?.firstName || userEmail.split('@')[0];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo & Name */}
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={20} />
          </div>
          <div className="brand-title">
            Study<span>Track</span>
          </div>
        </div>

        {/* Navigation & User Profile */}
        <div className="nav-links">
          {/* Tab Navigation for Admins */}
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                My Tasks
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldCheck size={14} /> Admin Overview
              </button>
            </div>
          )}

          {/* Quick Demo Role Toggle Button */}
          <button
            className="btn btn-sm btn-secondary"
            title="Interview Demo: Switch between Admin and Student view"
            onClick={onToggleRole}
          >
            <RefreshCw size={12} />
            Switch to {currentRole === 'admin' ? 'Student' : 'Admin'}
          </button>

          {/* User Details & Clerk UserButton */}
          <div className="nav-user">
            <div className="user-meta">
              <div className="user-name">{displayName}</div>
              <span className={`user-role-badge ${currentRole === 'admin' ? 'role-admin' : 'role-user'}`}>
                {currentRole === 'admin' ? '👑 Admin' : '🎓 Student'}
              </span>
            </div>
            {/* Clerk User Button provides built-in profile management & Sign Out */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
