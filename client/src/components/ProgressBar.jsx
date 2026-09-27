import React from 'react';
import { CheckCircle2, Clock, Hourglass } from 'lucide-react';

/**
 * ProgressBar Component
 * Calculates and visualizes task completion rate (completed / total).
 * Provides clear statistical breakdown (Total, Completed, In Progress, Pending).
 */
const ProgressBar = ({ stats, title = 'Your Progress' }) => {
  const { total = 0, completed = 0, inProgress = 0, pending = 0, completionRate = 0 } = stats || {};

  return (
    <div className="progress-card">
      <div className="progress-header">
        <div>
          <div className="progress-title">{title}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            {completed} of {total} tasks completed
          </div>
        </div>
        <div className="progress-percentage">{completionRate}%</div>
      </div>

      {/* Progress Track & Fill */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${completionRate}%` }}
          aria-valuenow={completionRate}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {/* Breakdown Badges */}
      <div className="progress-stats-grid">
        <div className="stat-pill">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-pill">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">
            <CheckCircle2 size={10} style={{ display: 'inline', marginRight: 3 }} />
            Completed
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">
            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
            In Progress
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-value">{pending}</div>
          <div className="stat-label">
            <Hourglass size={10} style={{ display: 'inline', marginRight: 3 }} />
            Pending
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
