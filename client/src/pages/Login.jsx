import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { BookOpen, CheckCircle, ShieldCheck, BarChart3 } from 'lucide-react';

/**
 * Login / Welcome Page
 * Shown when user is not signed in with Clerk.
 * Showcases features and provides seamless Clerk authentication buttons.
 */
const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Icon */}
        <div className="login-header-icon">
          <BookOpen size={30} />
        </div>

        <h1 className="login-title">StudyTrack</h1>
        <p className="login-desc">
          A minimalist student task management system designed with the MERN stack & Clerk authentication.
        </p>

        {/* Feature Highlights */}
        <div className="feature-list">
          <div className="feature-item">
            <CheckCircle size={16} color="#10B981" />
            <span>Track assignments, due dates, and study progress</span>
          </div>
          <div className="feature-item">
            <ShieldCheck size={16} color="#4F46E5" />
            <span>Role-Based Access: Student & Administrator views</span>
          </div>
          <div className="feature-item">
            <BarChart3 size={16} color="#F59E0B" />
            <span>Dynamic progress tracking with completion percentages</span>
          </div>
        </div>

        {/* Clerk Sign In / Sign Up CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SignInButton mode="modal">
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Sign In to Your Account
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="btn btn-outline" style={{ width: '100%', padding: '10px' }}>
              Create a New Student Account
            </button>
          </SignUpButton>
        </div>

        <p style={{ marginTop: '20px', fontSize: '0.78rem', color: '#94a3b8' }}>
          Protected with Clerk Secure Authentication
        </p>
      </div>
    </div>
  );
};

export default Login;
