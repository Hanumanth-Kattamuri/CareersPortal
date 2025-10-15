import React from "react";
import { Edit, Trash2 } from "lucide-react";

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  orangeLight: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  textDim: '#8e8e8e',
  border: '#2c2c2d',
};

function JobTable({ jobs, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ padding: "40px", textAlign: "center", color: GAMYAM_COLORS.textDim }}>
          No jobs found. Click "Add New Job" to create one.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>JOB TITLE</th>
            <th style={styles.th}>ROLE</th>
            <th style={styles.th}>LOCATION</th>
            <th style={styles.th}>CTC</th>
            <th style={styles.th}>TYPE</th>
            <th style={styles.th}>POSTED</th>
            <th style={styles.th}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td style={styles.td}>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                  {job.title}
                </div>
                <div style={{ fontSize: "12px", color: GAMYAM_COLORS.textDim }}>
                  {job.skillset}
                </div>
              </td>
              <td style={styles.td}>{job.role}</td>
              <td style={styles.td}>{job.location}</td>
              <td style={styles.td}>{job.ctc}</td>
              <td style={styles.td}>
                <span style={styles.badge(job.jobType)}>
                  {job.jobType || "Full-time"}
                </span>
              </td>
              <td style={styles.td}>{formatDate(job.createdAt)}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                  onClick={() => onEdit(job)}
                  title="Edit Job"
                >
                  <Edit size={18} />
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                  onClick={() => onDelete(job._id)}
                  title="Delete Job"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    overflow: "hidden",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: GAMYAM_COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: `2px solid ${GAMYAM_COLORS.border}`,
    backgroundColor: GAMYAM_COLORS.darkGray,
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: GAMYAM_COLORS.textLight,
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  badge: (type) => {
  const colors = {
    "Full-time": { bg: `rgba(255, 124, 38, 0.2)`, color: '#ff7c26' },
    "Part-time": { bg: "rgba(255, 222, 58, 0.2)", color: "#ffde3a" },
    "Contract": { bg: "rgba(45, 98, 255, 0.2)", color: "#2d62ff" },
    "Internship": { bg: "rgba(131, 255, 118, 0.2)", color: "#83ff76" },
  };
  const style = colors[type] || colors["Full-time"];
  
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: style.bg,
    color: style.color,
  };

  },
  actionBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    transition: "background 0.2s",
    marginRight: "6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    color: GAMYAM_COLORS.orange,
  },
  deleteBtn: {
    color: "#ff6b6b",
  },
};

export default JobTable;