import React from "react";
import { MapPin, Briefcase, DollarSign, Building2 } from 'lucide-react';

const GAMYAM_COLORS = {
  darkBg: '#0a0a0a',
  darkCard: '#ffffffff',
  darkGray: '#2a2a2a',
  orange: '#ff7c26',
  orangeLight: '#FF8C42',
  textLight: '#e0e0e0',
  textMuted: '#b0b0b0',
  textDim: '#888888',
  border: '#333333',
};

export default function JobCard({ job, onClick }) {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <h2 style={styles.title}>{job.title}</h2>
        <span style={styles.badge}>{job.jobType || "Full-time"}</span>
      </div>
      
      <div style={styles.roleSection}>
        <span style={styles.roleLabel}>Role:</span>
        <span style={styles.roleValue}>{job.role}</span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.icon}><MapPin size={16} /></span>
          <span style={styles.infoText}>{job.location}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.icon}><Briefcase size={16} /></span>
          <span style={styles.infoText}>{job.experience}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.icon}><DollarSign size={16} /></span>
          <span style={styles.infoText}>{job.ctc}</span>
        </div>
        {job.department && job.department !== "NA" && (
          <div style={styles.infoItem}>
            <span style={styles.icon}><Building2 size={16} /></span>
            <span style={styles.infoText}>{job.department}</span>
          </div>
        )}
      </div>

      <div style={styles.skillsSection}>
        <span style={styles.skillsLabel}>Skills:</span>
        <div style={styles.skillTags}>
          {job.skillset.split(",").map((skill, index) => (
            <span key={index} style={styles.skillTag}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>

      <p style={styles.description}>
        {job.description.length > 120
          ? job.description.substring(0, 120) + "..."
          : job.description}
      </p>

      <div style={styles.footer}>
        <button style={styles.viewBtn}>View Details →</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: `1px solid ${GAMYAM_COLORS.border}`,
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    margin: 0,
    flex: 1,
  },
  badge: {
    background: GAMYAM_COLORS.orange,
    color: GAMYAM_COLORS.darkBg,
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginLeft: "10px",
  },
  roleSection: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  roleLabel: {
    fontSize: "13px",
    color: GAMYAM_COLORS.textDim,
    marginRight: "8px",
  },
  roleValue: {
    fontSize: "14px",
    color: GAMYAM_COLORS.orange,
    fontWeight: "600",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
  },
  infoText: {
    fontSize: "13px",
    color: GAMYAM_COLORS.textMuted,
  },
  skillsSection: {
    marginBottom: "16px",
  },
  skillsLabel: {
    fontSize: "13px",
    color: GAMYAM_COLORS.textDim,
    display: "block",
    marginBottom: "8px",
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  skillTag: {
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.orangeLight,
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  description: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textDim,
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  viewBtn: {
    background: "transparent",
    color: GAMYAM_COLORS.orange,
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 0",
    transition: "color 0.2s",
  },
};