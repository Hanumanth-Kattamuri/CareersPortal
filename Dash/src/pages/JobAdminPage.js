import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";

import JobStats from "../components/JobStats";
import JobTable from "../components/JobTable";
import JobForm from "../components/JobForm";
import ApplicationsTable from "../components/ApplicationsTable";
import RecruiterActionsPage from "../components/RecruiterActionsPage";

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

function JobAdminPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      alert("Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
  try {
    console.log('🔄 Fetching applications from API...');
    const res = await axios.get("http://localhost:5000/api/applications");
    console.log('✅ Applications fetched:', res.data.length);
    setApplications(res.data);
  } catch (err) {
    console.error("❌ Failed to fetch applications:", err);
    console.error("Error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    alert(`Failed to fetch applications: ${err.message}\n\nPlease check:\n1. Backend server is running on port 5000\n2. MongoDB is connected\n3. Check browser console for details`);
    setApplications([]); // Set empty array to prevent undefined errors
  }
};
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const addOrUpdateJob = async (jobData) => {
    const payload = {
      title: jobData.title,
      role: jobData.role,
      skillset: jobData.skillset,
      ctc: jobData.ctc,
      location: jobData.location,
      experience: jobData.experience,
      jobType: jobData.jobType,
      department: jobData.department,
      description: jobData.description,
      responsibilities: jobData.responsibilities,
      qualifications: jobData.qualifications,
      benefits: jobData.benefits,
      deadline: jobData.deadline
    };

    try {
      if (editingJob) {
        await axios.put(`http://localhost:5000/api/jobs/${editingJob._id}`, payload);
        setEditingJob(null);
        alert("Job updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/jobs", payload);
        alert("Job added successfully!");
      }
      
      setIsFormOpen(false);
      setTimeout(() => fetchJobs(), 500);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to save job");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this job?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${_id}`);
      setJobs(jobs.filter(job => job._id !== _id));
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  };

  const handleNavigateToRecruiter = (applicant) => {
    setSelectedApplicant(applicant);
  };

  const handleBackFromRecruiter = () => {
  setSelectedApplicant(null);
  fetchApplications(); // ✅ This should refresh the table
};

  // If viewing recruiter actions page, show that instead
  if (selectedApplicant) {
    return (
      <RecruiterActionsPage 
        applicant={selectedApplicant} 
        onBack={handleBackFromRecruiter} 
      />
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerCard}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: GAMYAM_COLORS.textLight }}>
            Job Administration
          </h1>
          {activeTab === "jobs" && (
            <button 
              style={styles.addButton} 
              onClick={() => {
                setEditingJob(null);
                setIsFormOpen(true);
              }}
            >
              <Plus size={20} /> Add New Job
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <div 
            style={styles.tab(activeTab === "jobs")} 
            onClick={() => setActiveTab("jobs")}
          >
            Jobs ({jobs.length})
          </div>
          <div 
            style={styles.tab(activeTab === "applications")} 
            onClick={() => setActiveTab("applications")}
          >
            Applications ({applications.length})
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "jobs" ? (
          <>
            <JobStats jobs={jobs} />
            <JobTable jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} />
          </>
        ) : (
          <ApplicationsTable 
            applications={applications} 
            onRefresh={fetchApplications} 
            onNavigateToRecruiter={handleNavigateToRecruiter}
          />
        )}

        {/* Job Form Modal */}
        {isFormOpen && (
          <JobForm
            job={editingJob}
            onClose={() => {
              setIsFormOpen(false);
              setEditingJob(null);
            }}
            onSubmit={addOrUpdateJob}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: "100vh", 
    padding: "40px", 
    backgroundColor: GAMYAM_COLORS.darkBg 
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  headerCard: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "25px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    marginBottom: "20px",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: GAMYAM_COLORS.orange,
    color: '#ffffff',
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tabs: { 
    display: "flex", 
    gap: "20px", 
    marginBottom: "20px", 
    cursor: "pointer" 
  },
  tab: (active) => ({
    padding: "10px 20px",
    borderRadius: "8px",
    backgroundColor: active ? GAMYAM_COLORS.orange : GAMYAM_COLORS.darkCard,
    color: active ? '#ffffff' : GAMYAM_COLORS.textMuted,
    fontWeight: active ? "600" : "500",
    boxShadow: active ? "0 2px 8px rgba(255,124,38,0.3)" : "none",
    cursor: "pointer",
    border: `1px solid ${GAMYAM_COLORS.border}`,
    transition: "all 0.3s",
  }),
};

export default JobAdminPage;