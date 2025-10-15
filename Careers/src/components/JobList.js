import React, { useState, useEffect } from "react";

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  orangeLight: '#f97211',
  textLight: '#ffffff',
  textSecondary: '#d8d8d8',
  textMuted: '#8e8e8e',
  border: '#3b3b3c',
  success: '#83ff76',
  info: '#ff7c26',
};

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = ["All", "Engineering", "Product", "Design", "Data", "Marketing"];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedDept, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load job listings. Please try again later.");
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (selectedDept !== "All") {
      filtered = filtered.filter(job => job.department === selectedDept);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: GAMYAM_COLORS.orange, marginTop: "20px", fontSize: "16px" }}>Loading available positions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={{ color: GAMYAM_COLORS.orange }}>⚠️ {error}</h2>
        <button style={styles.retryBtn} onClick={fetchJobs}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
<h2 style={{ color: '#ff7c26' }}>Career</h2>
          <h1 style={styles.heroTitle}>Join Our Team</h1>
          <p style={styles.heroSubtitle}>
            Discover a culture that values innovation, collaboration, and personal growth.
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search positions by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterContainer}>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                ...styles.filterBtn,
                ...(selectedDept === dept ? styles.filterBtnActive : styles.filterBtnInactive)
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={styles.jobsSection}>
        {filteredJobs.length > 0 ? (
          <div style={styles.jobGrid}>
            {filteredJobs.map((job) => (
              <div key={job._id} style={styles.jobCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <p style={styles.jobDepartment}>{job.department || "General"}</p>
                  </div>
                  <span style={styles.badge}>{job.type || "Full-time"}</span>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.icon}>📍</span>
                    <span style={styles.infoText}>{job.location || "Not specified"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.icon}>📊</span>
                    <span style={styles.infoText}>{job.experience || "Not specified"}</span>
                  </div>
                  {job.salary && (
                    <div style={styles.infoItem}>
                      <span style={styles.icon}>💰</span>
                      <span style={styles.infoText}>{job.salary}</span>
                    </div>
                  )}
                  <div style={styles.infoItem}>
                    <span style={styles.icon}>📅</span>
                    <span style={styles.infoText}>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <p style={styles.description}>
                  {job.description && job.description.length > 80
                    ? job.description.substring(0, 80) + "..."
                    : job.description || "No description provided"}
                </p>

                {job.tags && job.tags.length > 0 && (
                  <div style={styles.skillsSection}>
                    <div style={styles.skillTags}>
                      {job.tags.map((tag, idx) => (
                        <span key={idx} style={styles.skillTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  style={styles.applyBtn} 
                  onClick={() => window.location.href = `/job/${job._id}`}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <h2 style={styles.noResultsTitle}>No positions found</h2>
            <p style={styles.noResultsText}>Try adjusting your search or filters to find available opportunities.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: GAMYAM_COLORS.darkBg,
    fontFamily: "Inter, sans-serif",
  },
  hero: {
    background: GAMYAM_COLORS.darkCard,
    padding: "80px 20px",
    textAlign: "center",
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: "56px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    marginBottom: "16px",
    letterSpacing: "-1px",
    margin: "0 0 16px 0",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: GAMYAM_COLORS.textMuted,
    lineHeight: "1.6",
    margin: "0",
  },
  searchSection: {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "0 20px",
  },
  searchContainer: {
    position: "relative",
    marginBottom: "24px",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "12px",
    fontSize: "18px",
    color: GAMYAM_COLORS.textMuted,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 44px",
    background: GAMYAM_COLORS.darkCard,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "0",
    color: GAMYAM_COLORS.textLight,
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  filterContainer: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "0",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  filterBtnActive: {
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
  },
  filterBtnInactive: {
    background: GAMYAM_COLORS.darkCard,
    color: GAMYAM_COLORS.textMuted,
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  jobsSection: {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "0 20px 60px",
  },
  jobGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  jobCard: {
    background: GAMYAM_COLORS.darkCard,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "0",
    padding: "24px",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    gap: "12px",
  },
  jobTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    margin: "0 0 4px",
  },
  jobDepartment: {
    fontSize: "13px",
    color: GAMYAM_COLORS.textMuted,
    fontWeight: "500",
    margin: "0",
  },
  badge: {
    background: GAMYAM_COLORS.info,
    color: "#ffffff",
    padding: "4px 12px",
    borderRadius: "0",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
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
    fontSize: "16px",
  },
  infoText: {
    fontSize: "13px",
    color: GAMYAM_COLORS.textMuted,
  },
  description: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    lineHeight: "1.6",
    marginBottom: "16px",
    flex: "1",
  },
  skillsSection: {
    marginBottom: "16px",
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  skillTag: {
    background: GAMYAM_COLORS.darkGray,
    color: "#ffffff",
    padding: "4px 10px",
    borderRadius: "0",
    fontSize: "12px",
    fontWeight: "500",
    border: `1px solid #6b6b6c`,
  },
  applyBtn: {
    background: GAMYAM_COLORS.info,
    color: "#ffffff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "0",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    width: "100%",
  },
  noResults: {
    textAlign: "center",
    padding: "60px 20px",
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "0",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  noResultsTitle: {
    fontSize: "24px",
    color: GAMYAM_COLORS.textLight,
    margin: "0 0 12px",
  },
  noResultsText: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    margin: "0",
  },
  ctaSection: {
    background: GAMYAM_COLORS.darkCard,
    padding: "60px 20px",
    textAlign: "center",
    borderTop: `1px solid ${GAMYAM_COLORS.border}`,
  },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  ctaText: {
    fontSize: "16px",
    color: GAMYAM_COLORS.textMuted,
    marginBottom: "24px",
    maxWidth: "600px",
    margin: "0 auto 24px",
  },
  ctaBtn: {
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    padding: "12px 36px",
    borderRadius: "0",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
  },
  loader: {
    width: "50px",
    height: "50px",
    border: `5px solid ${GAMYAM_COLORS.border}`,
    borderTop: `5px solid ${GAMYAM_COLORS.orange}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    textAlign: "center",
    padding: "20px",
  },
  retryBtn: {
    marginTop: "20px",
    padding: "12px 30px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "0",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
};