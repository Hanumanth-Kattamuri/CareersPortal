import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { ArrowRight, MoreVertical } from "lucide-react";

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  orangeLight: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  textDim: '#8e8e8e',
  border: '#4a4a4b',
};

function ApplicationsTable({ applications, onRefresh, onNavigateToRecruiter }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showStatusMenu, setShowStatusMenu] = useState(null);
  const [recruiterActions, setRecruiterActions] = useState({});

  // ✅ NEW: Fetch recruiter action data for each application
  useEffect(() => {
    const fetchRecruiterActions = async () => {
      const actions = {};
      for (let app of applications) {
        try {
          const response = await axios.get(`http://localhost:5000/api/recruiter-actions/${app._id}`);
          actions[app._id] = response.data;
        } catch (err) {
          // If no recruiter action exists, skip
          actions[app._id] = null;
        }
      }
      setRecruiterActions(actions);
    };
    
    if (applications.length > 0) {
      fetchRecruiterActions();
    }
  }, [applications]);

  // ✅ NEW: Helper function to check if recruiter completed their task
  const isRecruiterCompleted = (appId) => {
    const action = recruiterActions[appId];
    if (!action) return false;
    
    const roundMap = {
      'Round 1': 'round1',
      'Round 2': 'round2',
      'Round 3': 'round3',
      'Final Round': 'finalRound'
    };
    
    const currentRoundField = roundMap[action.currentRound];
    const currentRoundData = action[currentRoundField];
    
    return currentRoundData?.recruiterCompleted === true;
  };

  const handleViewResume = async (appId, appName) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/${appId}/resume`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Error viewing resume:', err);
      alert(`Failed to load resume for ${appName}`);
    }
  };

  const handleReject = async (app) => {
    if (!window.confirm(`Reject ${app.name}'s application?`)) return;

    setRejecting(app._id);
    try {
      await axios.post(`http://localhost:5000/api/applications/${app._id}/reject`);
      alert(`Rejection email sent to ${app.email}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Failed to reject application");
    }
    setRejecting(null);
  };

  const handleAccept = async (app) => {
    if (!window.confirm(`Accept ${app.name}'s application?`)) return;

    setAccepting(app._id);
    try {
      await axios.post(`http://localhost:5000/api/applications/${app._id}/accept`);
      alert(`Acceptance email sent to ${app.email}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error accepting application:", err);
      alert("Failed to accept application");
    }
    setAccepting(null);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.post(`http://localhost:5000/api/applications/${appId}/update-status`, {
        status: newStatus
      });
      alert(`Status updated to ${newStatus}`);
      setShowStatusMenu(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const uniqueRoles = useMemo(() => {
    const roles = applications.map(app => app.jobTitle).filter(role => role && role !== "NA");
    return [...new Set(roles)].sort();
  }, [applications]);

  const filteredApplications = applications.filter(app => {
    const statusMatch = filterStatus === "all" || app.status === filterStatus;
    const roleMatch = filterRole === "all" || app.jobTitle === filterRole;
    return statusMatch && roleMatch;
  });

  const getStatusStyle = (status) => {
    const styles = {
      rejected: { background: "rgba(255, 107, 107, 0.2)", color: "#ff6b6b" },
      accepted: { background: "rgba(76, 175, 80, 0.2)", color: "#51cf66" },
      selected: { background: "rgba(33, 150, 243, 0.2)", color: "#2196F3" },
      pending: { background: "rgba(255, 107, 53, 0.2)", color: GAMYAM_COLORS.orange },
      'on-hold': { background: "rgba(255, 193, 7, 0.2)", color: "#ffc107" },
      reconsidered: { background: "rgba(33, 150, 243, 0.2)", color: "#2196F3" }
    };
    return styles[status] || styles.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      rejected: "Rejected",
      accepted: "Accepted",
      selected: "Selected",
      pending: "Pending",
      'on-hold': "On Hold",
      reconsidered: "Reconsidered"
    };
    return labels[status] || status;
  };

  return (
    <div style={styles.container}>
      {/* Filters */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="on-hold">On Hold</option>
            <option value="reconsidered">Reconsidered</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Role:</label>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            style={styles.selectStyle}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role, index) => (
              <option key={index} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterInfo}>
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: GAMYAM_COLORS.textDim }}>No applications found.</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Position</th>
              <th style={styles.th}>Resume</th>
              <th style={styles.th}>Skills</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app._id} style={styles.tr}>
                <td style={styles.td}>{app.name || "NA"}</td>
                <td style={styles.td}>{app.email || "NA"}</td>
                <td style={styles.td}>{app.phone || "NA"}</td>
                <td style={styles.td}>
                  <span style={styles.roleTag}>{app.jobTitle || "NA"}</span>
                </td>
                <td style={styles.td}>
                  {app.resumePDF && app.resumePDF.data ? (
                    <button 
                      onClick={() => handleViewResume(app._id, app.name)}
                      style={styles.resumeBtn}
                    >
                      📄 View PDF
                    </button>
                  ) : (
                    <span style={{ color: GAMYAM_COLORS.textDim, fontSize: "13px" }}>No Resume</span>
                  )}
                </td>
                <td style={styles.td}>{app.skillset || "NA"}</td>
                <td style={styles.td}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(app.status) }}>
                      {getStatusLabel(app.status)}
                    </span>
                    {app.status === "rejected" && (
                      <button
                        style={styles.statusMenuBtn}
                        onClick={() => setShowStatusMenu(showStatusMenu === app._id ? null : app._id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                    )}
                    {showStatusMenu === app._id && (
                      <div style={styles.statusMenu}>
                        <button
                          style={styles.statusMenuItem}
                          onClick={() => handleStatusChange(app._id, 'on-hold')}
                        >
                          Mark as On Hold
                        </button>
                        <button
                          style={styles.statusMenuItem}
                          onClick={() => handleStatusChange(app._id, 'reconsidered')}
                        >
                          Reconsider Application
                        </button>
                        <button
                          style={styles.statusMenuItem}
                          onClick={() => handleStatusChange(app._id, 'pending')}
                        >
                          Move to Pending
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button style={styles.btn} onClick={() => setSelectedApp(app)}>View</button>
                    
                    {/* Reject button - shown for all statuses except rejected and selected */}
                    {app.status !== "rejected" && app.status !== "selected" && (
                      <button 
                        style={{...styles.btn, ...styles.rejectBtn}} 
                        onClick={() => handleReject(app)}
                        disabled={rejecting === app._id}
                      >
                        {rejecting === app._id ? "..." : "Reject"}
                      </button>
                    )}
                    
                    {/* Accept button - only for pending status */}
                    {app.status === "pending" && (
                      <button 
                        style={{...styles.btn, background: GAMYAM_COLORS.orange}} 
                        onClick={() => handleAccept(app)}
                        disabled={accepting === app._id}
                      >
                        {accepting === app._id ? "..." : "Accept"}
                      </button>
                    )}
                    
                    {/* Next Step button - for accepted, reconsidered, and on-hold */}
                    {(app.status === "accepted" || app.status === "reconsidered" || app.status === "on-hold") && (
                      <>
                        {isRecruiterCompleted(app._id) ? (
                          <span style={{ ...styles.statusBadge, background: "rgba(76, 175, 80, 0.2)", color: "#51cf66", padding: '6px 12px' }}>
                            ✓ Completed
                          </span>
                        ) : (
                          <button 
                            style={{...styles.btn, ...styles.nextStepBtn}} 
                            onClick={() => onNavigateToRecruiter(app)}
                          >
                            Next Step <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Hired badge - only for selected status */}
                    {app.status === "selected" && (
                      <span style={{ ...styles.statusBadge, ...getStatusStyle('selected'), padding: '6px 12px' }}>
                        ✓ Hired
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {selectedApp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Application Details</h2>
              <button style={styles.closeBtn} onClick={() => setSelectedApp(null)}>✕</button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                <p style={styles.detailItem}><strong>Name:</strong> {selectedApp.name}</p>
                <p style={styles.detailItem}><strong>Email:</strong> {selectedApp.email}</p>
                <p style={styles.detailItem}><strong>Phone:</strong> {selectedApp.phone}</p>
                <p style={styles.detailItem}><strong>Location:</strong> {selectedApp.location}</p>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Professional Information</h3>
                <p style={styles.detailItem}><strong>Position:</strong> {selectedApp.jobTitle}</p>
                <p style={styles.detailItem}><strong>Skills:</strong> {selectedApp.skillset}</p>
                <p style={styles.detailItem}><strong>Project:</strong> {selectedApp.project}</p>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Status</h3>
                <span style={{ ...styles.statusBadge, ...getStatusStyle(selectedApp.status) }}>
                  {getStatusLabel(selectedApp.status)}
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {selectedApp.status !== "rejected" && (
                <button 
                  style={{...styles.btn, ...styles.rejectBtn}} 
                  onClick={() => { handleReject(selectedApp); setSelectedApp(null); }}
                >
                  Reject
                </button>
              )}
              {selectedApp.status === "pending" && (
                <button 
                  style={{...styles.btn, background: GAMYAM_COLORS.orange}} 
                  onClick={() => { handleAccept(selectedApp); setSelectedApp(null); }}
                >
                  Accept
                </button>
              )}
              {(selectedApp.status === "accepted" || selectedApp.status === "reconsidered") && (
                <button 
                  style={{...styles.btn, ...styles.nextStepBtn}} 
                  onClick={() => { onNavigateToRecruiter(selectedApp); setSelectedApp(null); }}
                >
                  Next Step →
                </button>
              )}
              <button style={styles.btn} onClick={() => setSelectedApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "0",
    padding: "25px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.3)",
    overflowX: "auto",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  filterContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
    alignItems: "center",
    padding: "16px",
    background: GAMYAM_COLORS.darkGray,
    borderRadius: "0",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontWeight: "600",
    fontSize: "14px",
    color: GAMYAM_COLORS.textLight,
    whiteSpace: "nowrap",
  },
  selectStyle: {
    padding: "8px 12px",
    borderRadius: "0",
    border: `1px solid ${GAMYAM_COLORS.border}`,
    fontSize: "14px",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    cursor: "pointer",
    minWidth: "150px",
  },
  filterInfo: {
    marginLeft: "auto",
    fontSize: "13px",
    color: GAMYAM_COLORS.textDim,
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: GAMYAM_COLORS.darkGray },
  th: { 
    textAlign: "left", 
    padding: "12px 16px", 
    fontSize: "14px", 
    fontWeight: "600",
    color: GAMYAM_COLORS.textLight,
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  td: { 
    padding: "12px 16px", 
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  tr: { },
  roleTag: {
    background: GAMYAM_COLORS.darkGray,
    color: "#ffffff",
    padding: "4px 10px",
    borderRadius: "0",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  resumeBtn: {
    padding: "6px 12px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "0",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "0",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  statusMenuBtn: {
    marginLeft: "8px",
    padding: "2px 4px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: GAMYAM_COLORS.textMuted,
    verticalAlign: "middle",
  },
  statusMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    background: GAMYAM_COLORS.darkCard,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    zIndex: 100,
    minWidth: "180px",
    marginTop: "4px",
  },
  statusMenuItem: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    color: GAMYAM_COLORS.textLight,
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  btn: {
    padding: "6px 12px",
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  rejectBtn: {
    background: "#ff2727",
    color: "#ffffff",
  },
  nextStepBtn: {
    background: "#4CAF50",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContainer: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "hidden",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: GAMYAM_COLORS.textDim,
  },
  modalContent: {
    padding: "24px",
    maxHeight: "60vh",
    overflowY: "auto",
  },
  detailSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: GAMYAM_COLORS.orange,
    marginBottom: "12px",
  },
  detailItem: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    marginBottom: "8px",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: `1px solid ${GAMYAM_COLORS.border}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
};

export default ApplicationsTable;