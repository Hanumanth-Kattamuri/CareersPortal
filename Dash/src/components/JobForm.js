import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

function JobForm({ job = null, onClose = () => {}, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    skillset: "",
    ctc: "",
    location: "",
    experience: "",
    jobType: "Full-time",
    department: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  const fieldLabels = {
    title: "Job Title",
    role: "Role/Position",
    skillset: "Skillset",
    ctc: "CTC",
    location: "Location",
    experience: "Experience",
    jobType: "Job Type",
    department: "Department",
    description: "Description",
    responsibilities: "Responsibilities",
    qualifications: "Qualifications",
    benefits: "Benefits & Perks",
    deadline: "Deadline",
  };

  const mandatoryFields = [
    "title",
    "role",
    "skillset",
    "ctc",
    "location",
    "experience",
    "description",
  ];

  const placeholders = {
    title: "e.g. Frontend Developer",
    role: "e.g. UI Engineer",
    skillset: "e.g. React, JS, CSS",
    ctc: "e.g. 3 LPA, 5 LPA",
    location: "e.g. Bengaluru, Remote",
    experience: "e.g. 2 years, 5 years",
    department: "e.g. Engineering, HR",
    description: "Job description here...",
    responsibilities: "Key responsibilities...",
    qualifications: "Required qualifications...",
    benefits: "e.g. Health insurance, Paid leaves",
    deadline: "",
  };

  useEffect(() => {
    if (job && job._id) {
      // Editing existing job
      console.log("📝 JobForm - Editing existing job:", job);
      
      // Format deadline for date input
      let formattedDeadline = "";
      if (job.deadline) {
        const date = new Date(job.deadline);
        formattedDeadline = date.toISOString().split("T")[0];
      }
      
      setFormData({
        title: job.title || "",
        role: job.role || "",
        skillset: job.skillset || "",
        ctc: job.ctc || "",
        location: job.location || "",
        experience: job.experience || "",
        jobType: job.jobType || "Full-time",
        department: job.department || "",
        description: job.description || "",
        responsibilities: job.responsibilities || "",
        qualifications: job.qualifications || "",
        benefits: job.benefits || "",
        deadline: formattedDeadline,
      });
    } else {
      // Creating new job
      console.log("➕ JobForm - Creating new job");
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        title: "",
        role: "",
        skillset: "",
        ctc: "",
        location: "",
        experience: "",
        jobType: "Full-time",
        department: "",
        description: "",
        responsibilities: "",
        qualifications: "",
        benefits: "",
        deadline: today,
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 Field changed: ${name} = "${value}"`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("🚀 JobForm - handleSubmit called");
    console.log("📋 Current formData state:", formData);

    // Validate mandatory fields
    for (let field of mandatoryFields) {
      if (!formData[field] || formData[field].trim() === "") {
        alert(`${fieldLabels[field]} is mandatory!`);
        return;
      }
    }

    // Create the payload - IMPORTANT: Don't filter out fields, send everything
    const payload = {
      title: formData.title.trim(),
      role: formData.role.trim(),
      skillset: formData.skillset.trim(),
      ctc: formData.ctc.trim(),
      location: formData.location.trim(),
      experience: formData.experience.trim(),
      jobType: formData.jobType, // THIS IS CRITICAL - don't trim or filter
      department: formData.department.trim(),
      description: formData.description.trim(),
      responsibilities: formData.responsibilities.trim(),
      qualifications: formData.qualifications.trim(),
      benefits: formData.benefits.trim(),
      deadline: formData.deadline || null
    };

    console.log("📦 JobForm - Payload being sent:", payload);
    console.log("🎯 JobType value:", payload.jobType);

    setLoading(true);
    try {
      await onSubmit(payload);
      resetForm();
    } catch (err) {
      console.error("❌ JobForm - Error in onSubmit:", err);
      alert("Failed to save job. Check console for details.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      title: "",
      role: "",
      skillset: "",
      ctc: "",
      location: "",
      experience: "",
      jobType: "Full-time",
      department: "",
      description: "",
      responsibilities: "",
      qualifications: "",
      benefits: "",
      deadline: today,
    });
    onClose();
  };

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "60px",
      zIndex: 1000,
      overflowY: "auto",
    },
    modal: {
      background: "#2c2c2d",
      width: "90%",
      maxWidth: "800px",
      borderRadius: "0",
      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      overflow: "hidden",
      marginBottom: "40px",
      border: "1px solid #4a4a4b",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 24px",
      borderBottom: "1px solid #4a4a4b",
      backgroundColor: "#0f0f10",
    },
    title: { fontSize: "20px", fontWeight: "600", color: "#ffffff", fontFamily: "Inter, sans-serif" },
    closeBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      color: "#8e8e8e",
    },
    content: { padding: "24px", maxHeight: "60vh", overflowY: "auto" },
    label: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#ffffff",
      marginBottom: "6px",
      display: "block",
      fontFamily: "Inter, sans-serif",
    },
    mandatory: { color: "#ff7c26", marginLeft: "3px" },
    input: {
      width: "100%",
      padding: "10px 12px",
      marginBottom: "18px",
      border: "1px solid #4a4a4b",
      borderRadius: "0",
      fontSize: "14px",
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#0f0f10",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      marginBottom: "18px",
      border: "1px solid #4a4a4b",
      borderRadius: "0",
      fontSize: "14px",
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#0f0f10",
      cursor: "pointer",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      padding: "16px 24px",
      borderTop: "1px solid #4a4a4b",
      backgroundColor: "#0f0f10",
    },
    btn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "0",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "opacity 0.2s",
      fontFamily: "Inter, sans-serif",
    },
    saveBtnStyle: {
      background: "#ff7c26",
      color: "#ffffff",
    },
    cancelBtnStyle: {
      background: "#4a4a4b",
      color: "#ffffff",
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{job && job._id ? "Edit Job" : "Add New Job"}</h2>
          <button onClick={resetForm} style={styles.closeBtn} type="button">
            <X size={22} />
          </button>
        </div>
        <div style={styles.content}>
          {Object.keys(formData).map((field) => (
            <div key={field}>
              <label style={styles.label}>
                {fieldLabels[field]}
                {mandatoryFields.includes(field) && (
                  <span style={styles.mandatory}>*</span>
                )}
              </label>

              {field === "jobType" ? (
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              ) : [
                  "description",
                  "responsibilities",
                  "qualifications",
                  "benefits",
                ].includes(field) ? (
                <textarea
                  name={field}
                  rows={field === "description" ? 4 : 3}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={placeholders[field]}
                  style={styles.input}
                />
              ) : (
                <input
                  type={field === "deadline" ? "date" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={placeholders[field]}
                  style={styles.input}
                />
              )}
            </div>
          ))}
        </div>
        <div style={styles.footer}>
          <button
            onClick={handleSubmit}
            style={{
              ...styles.btn,
              ...styles.saveBtnStyle,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
            type="button"
          >
            {loading ? "Saving..." : job && job._id ? "Update Job" : "Add Job"}
          </button>
          <button
            onClick={resetForm}
            style={{ ...styles.btn, ...styles.cancelBtnStyle }}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobForm;