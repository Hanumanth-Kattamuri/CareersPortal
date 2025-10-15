import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/jobs");
      const foundJob = response.data.find((j) => j._id === id);
      
      if (foundJob) {
        setJob(foundJob);
      } else {
        setError("Job not found");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to load job details");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: GAMYAM_COLORS.orange, marginTop: "20px" }}>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={{ color: GAMYAM_COLORS.orange }}>⚠️ {error || "Job not found"}</h2>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to Job Listings
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate("/")}>
            ← Back to Jobs
          </button>
        </div>

        <div style={styles.jobHeader}>
          <div style={styles.jobHeaderLeft}>
            <h1 style={styles.jobTitle}>{job.title}</h1>
            <p style={styles.jobRole}>{job.role}</p>
            
            <div style={styles.metaInfo}>
              <span style={styles.metaItem}>
                <span style={styles.metaIcon}>📍</span> {job.location}
              </span>
              <span style={styles.metaItem}>
                <span style={styles.metaIcon}>💼</span> {job.experience}
              </span>
              <span style={styles.metaItem}>
                <span style={styles.metaIcon}>💰</span> {job.ctc}
              </span>
              <span style={styles.metaItem}>
                <span style={styles.metaIcon}>⏰</span> {job.jobType}
              </span>
            </div>
          </div>
          
          <button style={styles.applyBtn} onClick={() => navigate(`/apply/${id}`)}>
            Apply Now
          </button>
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.mainContent}>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Job Description</h2>
              <p style={styles.sectionText}>{job.description}</p>
            </section>

            {job.responsibilities && job.responsibilities !== "NA" && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Key Responsibilities</h2>
                <p style={styles.sectionText}>{job.responsibilities}</p>
              </section>
            )}

            {job.qualifications && job.qualifications !== "NA" && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Qualifications</h2>
                <p style={styles.sectionText}>{job.qualifications}</p>
              </section>
            )}

            {job.benefits && job.benefits !== "NA" && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Benefits & Perks</h2>
                <p style={styles.sectionText}>{job.benefits}</p>
              </section>
            )}
          </div>

          <div style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Required Skills</h3>
              <div style={styles.skillsList}>
                {job.skillset.split(",").map((skill, index) => (
                  <span key={index} style={styles.skillBadge}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {job.department && job.department !== "NA" && (
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarTitle}>Department</h3>
                <p style={styles.sidebarText}>{job.department}</p>
              </div>
            )}

            {job.deadline && job.deadline !== "NA" && (
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarTitle}>Application Deadline</h3>
                <p style={styles.sidebarText}>{job.deadline}</p>
              </div>
            )}

            <button style={styles.applyBtnFull} onClick={() => navigate(`/apply/${id}`)}>
              Apply for this Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: GAMYAM_COLORS.darkBg, padding: "40px 20px", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "20px" },
  backBtn: { background: GAMYAM_COLORS.darkCard, border: `1px solid ${GAMYAM_COLORS.border}`, padding: "10px 20px", borderRadius: "0", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#ffffff", transition: "all 0.3s" },
  jobHeader: { background: GAMYAM_COLORS.darkCard, borderRadius: "0", padding: "30px", marginBottom: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", border: `1px solid ${GAMYAM_COLORS.border}` },
  jobHeaderLeft: { flex: 1 },
  jobTitle: { fontSize: "32px", fontWeight: "700", color: GAMYAM_COLORS.textLight, margin: "0 0 8px 0" },
  jobRole: { fontSize: "18px", color: GAMYAM_COLORS.textDim, marginBottom: "20px", fontWeight: "600" },
  metaInfo: { display: "flex", flexWrap: "wrap", gap: "20px" },
  metaItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: GAMYAM_COLORS.textMuted },
  metaIcon: { fontSize: "16px" },
  applyBtn: { background: GAMYAM_COLORS.orange, color: "#ffffff", border: "none", padding: "14px 32px", borderRadius: "0", fontSize: "16px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s" },
  contentGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" },
  mainContent: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { background: GAMYAM_COLORS.darkCard, borderRadius: "0", padding: "25px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", border: `1px solid ${GAMYAM_COLORS.border}` },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: GAMYAM_COLORS.orange, marginBottom: "12px" },
  sectionText: { fontSize: "15px", color: GAMYAM_COLORS.textMuted, lineHeight: "1.7" },
  sidebar: { display: "flex", flexDirection: "column", gap: "20px" },
  sidebarCard: { background: GAMYAM_COLORS.darkCard, borderRadius: "0", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", border: `1px solid ${GAMYAM_COLORS.border}` },
  sidebarTitle: { fontSize: "16px", fontWeight: "700", color: GAMYAM_COLORS.textLight, marginBottom: "12px" },
  sidebarText: { fontSize: "14px", color: GAMYAM_COLORS.textMuted },
  skillsList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillBadge: { background: GAMYAM_COLORS.darkGray, color: "#ffffff", padding: "6px 12px", borderRadius: "0", fontSize: "13px", fontWeight: "600", border: `1px solid #6b6b6c` },
  applyBtnFull: { background: GAMYAM_COLORS.orange, color: "#ffffff", border: "none", padding: "14px 24px", borderRadius: "0", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", transition: "all 0.3s" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: GAMYAM_COLORS.darkBg },
  loader: { width: "50px", height: "50px", border: `5px solid ${GAMYAM_COLORS.border}`, borderTop: `5px solid ${GAMYAM_COLORS.orange}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
  errorContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: GAMYAM_COLORS.darkBg, textAlign: "center", padding: "20px" },
};