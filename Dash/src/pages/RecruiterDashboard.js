import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User } from 'lucide-react';
import ApplicationsTable from '../components/ApplicationsTable';
import RecruiterActionsPage from '../components/RecruiterActionsPage';

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  border: '#4a4a4b',
};

function RecruiterDashboard({ user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/recruiter/${user.id}/applications`);
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      alert('Failed to fetch your assigned applications');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRecruiter = (applicant) => {
  setSelectedApplicant(applicant);
};

const handleBackFromRecruiter = () => {
  setSelectedApplicant(null);
  fetchMyApplications();
};

// CHECK THIS PART:
if (selectedApplicant) {
  return (
    <RecruiterActionsPage 
      applicant={selectedApplicant} 
      onBack={handleBackFromRecruiter} 
      user={user} // ← MAKE SURE THIS IS HERE
    />
  );
}

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerCard}>
          <div style={styles.userInfo}>
            <User size={24} style={{ color: GAMYAM_COLORS.orange }} />
            <div>
              <h2 style={styles.userName}>{user.name}</h2>
              <p style={styles.userRole}>Recruiter Dashboard</p>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{applications.length}</h3>
            <p style={styles.statLabel}>Assigned Applications</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>
              {applications.filter(app => app.status === 'accepted').length}
            </h3>
            <p style={styles.statLabel}>Pending Reviews</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>
              {applications.filter(app => app.status === 'selected').length}
            </h3>
            <p style={styles.statLabel}>Selected</p>
          </div>
        </div>

        {/* Applications Table */}
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>My Assigned Applications</h2>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No applications assigned to you yet.</p>
            <p style={styles.emptySubtext}>
              HR will assign candidates to you when interviews are scheduled.
            </p>
          </div>
        ) : (
          <ApplicationsTable 
            applications={applications}
            onRefresh={fetchMyApplications}
            onNavigateToRecruiter={handleNavigateToRecruiter}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px',
    backgroundColor: GAMYAM_COLORS.darkBg,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerCard: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '12px',
    padding: '25px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '25px',
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '20px',
    fontWeight: '700',
    color: GAMYAM_COLORS.textLight,
    margin: 0,
  },
  userRole: {
    fontSize: '14px',
    color: GAMYAM_COLORS.textMuted,
    margin: 0,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '25px',
  },
  statCard: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '12px',
    padding: '25px',
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: GAMYAM_COLORS.orange,
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: GAMYAM_COLORS.textMuted,
    margin: 0,
  },
  tableHeader: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '12px 12px 0 0',
    padding: '20px 25px',
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderBottom: 'none',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: GAMYAM_COLORS.textLight,
    margin: 0,
  },
  loadingContainer: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '0 0 12px 12px',
    padding: '60px',
    textAlign: 'center',
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderTop: 'none',
  },
  loadingText: {
    color: GAMYAM_COLORS.textMuted,
    fontSize: '16px',
  },
  emptyState: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '0 0 12px 12px',
    padding: '60px',
    textAlign: 'center',
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderTop: 'none',
  },
  emptyText: {
    color: GAMYAM_COLORS.textLight,
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  emptySubtext: {
    color: GAMYAM_COLORS.textMuted,
    fontSize: '14px',
  },
};

export default RecruiterDashboard;