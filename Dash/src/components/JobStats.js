import React from "react";

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

function JobStats({ jobs }) {
  const stats = [
    { label: "Total Jobs", value: jobs.length },
    {
      label: "Full-time Positions",
      value: jobs.filter((j) => j.jobType === "Full-time").length,
    },
    {
      label: "Part-time Positions",
      value: jobs.filter((j) => j.jobType === "Part-time").length,
    },
  ];

  return (
    <div style={styles.grid}>
      {stats.map((stat, i) => (
        <div key={i} style={styles.card}>
          <h3 style={styles.label}>{stat.label}</h3>
          <div style={styles.value}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
    marginBottom: "35px"
  },
  card: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "25px 30px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  label: {
    fontSize: "15px",
    color: GAMYAM_COLORS.textDim,
    marginBottom: "8px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "600",
    color: GAMYAM_COLORS.orange,
  },
};

export default JobStats;