import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ScreeningQuestions from '../components/ScreeningQuestions';
import { MapPin, Briefcase, DollarSign, Building2, Heart, BookOpen, TrendingUp } from 'lucide-react';

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Jammu and Kashmir"
];

export default function ApplyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [showScreening, setShowScreening] = useState(false);
const [submittedApplication, setSubmittedApplication] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skillset: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    project: "",
    tenth: "",
    tenthSchool: "",
    diploma: "",
    diplomaCollege: "",
    diplomaStream: "",
    graduation: "",
    graduationCollege: "",
    graduationStream: "",
    postGraduation: "",
    postGraduationCollege: "",
    postGraduationStream: "",
    resumeUrl: "",
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/jobs");
      const foundJob = response.data.find((j) => j._id === id);
      if (foundJob) {
        setJob(foundJob);
      }
    } catch (err) {
      console.error("Error fetching job:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB');
        return;
      }
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  // Upload and extract data from resume
  const handleExtractData = async () => {
    if (!uploadedFile) {
      alert('Please upload a resume first');
      return;
    }

    setExtracting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('resume', uploadedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-resume', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { extractedData, resumeData: resData } = response.data;
      
      // Store resume data for later submission
      setResumeData(resData);

      // Auto-populate form with extracted data
      setFormData(prevData => ({
        ...prevData,
        name: extractedData.name || prevData.name,
        email: extractedData.email || prevData.email,
        phone: extractedData.phone || prevData.phone,
        skillset: extractedData.skillset || prevData.skillset,
        state: extractedData.location?.state || prevData.state,
        city: extractedData.location?.city || prevData.city,
        project: extractedData.project || prevData.project,
        tenth: extractedData.academic?.tenth?.score || prevData.tenth,
        tenthSchool: extractedData.academic?.tenth?.school || prevData.tenthSchool,
        diploma: extractedData.academic?.diploma?.score || prevData.diploma,
        diplomaCollege: extractedData.academic?.diploma?.college || prevData.diplomaCollege,
        diplomaStream: extractedData.academic?.diploma?.stream || prevData.diplomaStream,
        graduation: extractedData.academic?.graduation?.score || prevData.graduation,
        graduationCollege: extractedData.academic?.graduation?.college || prevData.graduationCollege,
        graduationStream: extractedData.academic?.graduation?.stream || prevData.graduationStream,
        postGraduation: extractedData.academic?.postGraduation?.score || prevData.postGraduation,
        postGraduationCollege: extractedData.academic?.postGraduation?.college || prevData.postGraduationCollege,
        postGraduationStream: extractedData.academic?.postGraduation?.stream || prevData.postGraduationStream,
      }));

      alert('✅ Resume data extracted successfully! Please review and edit if needed.');
      
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('Failed to extract data from resume. Please fill the form manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.phone || !formData.skillset || 
      !formData.state || !formData.city || !formData.pincode || !formData.address ||
      !formData.tenth || !formData.tenthSchool || !formData.diploma || 
      !formData.diplomaCollege || !formData.diplomaStream || !formData.graduation || 
      !formData.graduationCollege || !formData.graduationStream ||
      !formData.project) {
    alert("Please fill all required fields marked with *!");
    return;
  }

  if (!resumeData && !uploadedFile) {
    alert("Please upload your resume!");
    return;
  }

  const applicationData = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    skillset: formData.skillset,
    resumeUrl: formData.resumeUrl || "Uploaded via PDF",
    resumePDF: resumeData,
    jobId: id,
    jobTitle: job?.title || "NA",
    location: `${formData.city}, ${formData.state}`,
    pincode: formData.pincode,
    address: formData.address,
    project: formData.project,
    academic: {
      tenth: { score: formData.tenth, school: formData.tenthSchool },
      diploma: { score: formData.diploma, college: formData.diplomaCollege, stream: formData.diplomaStream },
      graduation: { score: formData.graduation, college: formData.graduationCollege, stream: formData.graduationStream },
      postGraduation: { score: formData.postGraduation, college: formData.postGraduationCollege, stream: formData.postGraduationStream },
    },
  };

  setLoading(true);
  try {
    const response = await axios.post("http://localhost:5000/api/applications", applicationData);
    
    // ✅ NEW: Instead of navigating, show screening questions
    setSubmittedApplication(response.data.application);
    setShowScreening(true);
  } catch (err) {
    console.error("Error submitting application:", err);
    alert("Failed to submit application. Please try again.");
  }
  setLoading(false);
};

const handleScreeningComplete = () => {
  setShowScreening(false);
  alert("✅ Your application and screening questions have been submitted successfully!\n\nWe'll review your application and get back to you soon.");
  navigate("/");
};

  if (!job) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading application form...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(`/job/${id}`)}>
            ← Back to Job Details
          </button>
        </div>

        <div style={styles.formWrapper}>
          <div style={styles.sidebar}>
            <div style={styles.jobInfoCard}>
              <div style={styles.badge}>Now Hiring</div>
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <p style={styles.jobRole}>{job.role}</p>
              
              <div style={styles.divider}></div>
              
              <div style={styles.infoSection}>
                <h4 style={styles.sidebarTitle}>Position Details</h4>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Location</span>
                  <span style={styles.detailValue}>{job.location}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Experience</span>
                  <span style={styles.detailValue}>{job.experience}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Salary Range</span>
                  <span style={styles.detailValue}>{job.ctc}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Job Type</span>
                  <span style={styles.detailValue}>Full Time</span>
                </div>
              </div>

              <div style={styles.divider}></div>
              
              <div style={styles.infoSection}>
                <h4 style={styles.sidebarTitle}>Required Skills</h4>
                <div style={styles.skillsList}>
                  {job.skillset.split(",").map((skill, i) => (
                    <span key={i} style={styles.skillBadge}>{skill.trim()}</span>
                  ))}
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.infoSection}>
                <h4 style={styles.sidebarTitle}>Key Responsibilities</h4>
                <ul style={styles.responsibilitiesList}>
                  <li style={styles.responsibilityItem}>Develop and maintain high-quality code</li>
                  <li style={styles.responsibilityItem}>Collaborate with cross-functional teams</li>
                  <li style={styles.responsibilityItem}>Participate in code reviews and testing</li>
                  <li style={styles.responsibilityItem}>Contribute to technical documentation</li>
                </ul>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.infoSection}>
  <h4 style={styles.sidebarTitle}>What We Offer</h4>
  <div style={styles.benefitsList}>
    <div style={styles.benefitItem}>
      <span style={styles.benefitIcon}><DollarSign /></span>
      <span style={styles.benefitText}>Competitive Salary</span>
    </div>
    <div style={styles.benefitItem}>
      <span style={styles.benefitIcon}><Heart /></span>
      <span style={styles.benefitText}>Health Insurance</span>
    </div>
    <div style={styles.benefitItem}>
      <span style={styles.benefitIcon}><BookOpen /></span>
      <span style={styles.benefitText}>Learning & Development</span>
    </div>
    <div style={styles.benefitItem}>
      <span style={styles.benefitIcon}><TrendingUp /></span>
      <span style={styles.benefitText}>Career Growth</span>
    </div>
  </div>
</div>

              <div style={styles.helpBox}>
                <h5 style={styles.helpTitle}>Need Help?</h5>
                <p style={styles.helpText}>Contact our HR team for any queries about this position.</p>
                <a href="mailto:hr@company.com" style={styles.helpLink}>hr@company.com</a>
              </div>
            </div>
          </div>

          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Apply for this Position</h2>
            <p style={styles.formSubtitle}>Upload your resume to auto-fill the form or fill manually</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              
              {/* RESUME UPLOAD SECTION */}
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>📄 Upload Resume</h3>
              </div>

              <div style={styles.uploadSection}>
                <div style={styles.uploadBox}>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                  />
                  <label htmlFor="resume-upload" style={styles.uploadLabel}>
                    <div style={styles.uploadIcon}>📎</div>
                    <div style={styles.uploadText}>
                      {uploadedFile ? (
                        <>
                          <strong>{uploadedFile.name}</strong>
                          <span style={styles.fileSize}>({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </>
                      ) : (
                        <>
                          <strong>Click to upload</strong> or drag and drop
                          <span style={styles.uploadHint}>PDF file only (Max 10MB)</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {uploadedFile && (
                  <button
                    type="button"
                    onClick={handleExtractData}
                    style={styles.extractBtn}
                    disabled={extracting}
                  >
                    {extracting ? (
                      <>
                        <span style={styles.spinner}></span>
                        Extracting Data...
                      </>
                    ) : (
                      <>
                        ✨ Extract Data from Resume
                      </>
                    )}
                  </button>
                )}

                <div style={styles.uploadNote}>
                  <strong>Note:</strong> After uploading, click "Extract Data" to automatically fill the form. You can edit any field if needed.
                </div>
              </div>

              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} placeholder="Enter your full name" required />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email <span style={styles.required}>*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} placeholder="your.email@example.com" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number <span style={styles.required}>*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={styles.input} placeholder="Enter your phone number" required />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Skillset <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  name="skillset" 
                  value={formData.skillset} 
                  onChange={handleChange} 
                  style={styles.input} 
                  placeholder="e.g., React, JavaScript, Node.js, MongoDB" 
                  required 
                />
                <small style={styles.helpText}>Enter your skills separated by commas</small>
              </div>

              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Location Details</h3>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>State <span style={styles.required}>*</span></label>
                  <select name="state" value={formData.state} onChange={handleChange} style={styles.input} required>
                    <option value="">Select State</option>
                    {states.map((st) => (<option key={st} value={st}>{st}</option>))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City/Village <span style={styles.required}>*</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} style={styles.input} placeholder="Enter city or village" required />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pincode <span style={styles.required}>*</span></label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={styles.input} placeholder="Enter pincode" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Permanent Address <span style={styles.required}>*</span></label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} style={styles.input} placeholder="Enter permanent address" required />
                </div>
              </div>

              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Academic Details</h3>
              </div>

              <div style={styles.academicSection}>
                <h4 style={styles.academicTitle}>10th Standard <span style={styles.required}>*</span></h4>
                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CGPA/Percentage</label>
                    <input type="text" name="tenth" value={formData.tenth} onChange={handleChange} style={styles.input} placeholder="e.g., 85%" required />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>School Name</label>
                    <input type="text" name="tenthSchool" value={formData.tenthSchool} onChange={handleChange} style={styles.input} placeholder="School name" required />
                  </div>
                </div>
              </div>

              <div style={styles.academicSection}>
                <h4 style={styles.academicTitle}>12th Standard / Diploma <span style={styles.required}>*</span></h4>
                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CGPA/Percentage</label>
                    <input type="text" name="diploma" value={formData.diploma} onChange={handleChange} style={styles.input} placeholder="e.g., 80%" required />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>College Name</label>
                    <input type="text" name="diplomaCollege" value={formData.diplomaCollege} onChange={handleChange} style={styles.input} placeholder="College name" required />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stream</label>
                  <input type="text" name="diplomaStream" value={formData.diplomaStream} onChange={handleChange} style={styles.input} placeholder="e.g., Science, Commerce" required />
                </div>
              </div>

              <div style={styles.academicSection}>
                <h4 style={styles.academicTitle}>Graduation <span style={styles.required}>*</span></h4>
                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CGPA/Percentage</label>
                    <input type="text" name="graduation" value={formData.graduation} onChange={handleChange} style={styles.input} placeholder="e.g., 8.5 CGPA" required />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>College Name</label>
                    <input type="text" name="graduationCollege" value={formData.graduationCollege} onChange={handleChange} style={styles.input} placeholder="College name" required />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stream</label>
                  <input type="text" name="graduationStream" value={formData.graduationStream} onChange={handleChange} style={styles.input} placeholder="e.g., Computer Science" required />
                </div>
              </div>

              <div style={styles.academicSection}>
                <h4 style={styles.academicTitle}>Post Graduation (Optional)</h4>
                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CGPA/Percentage</label>
                    <input type="text" name="postGraduation" value={formData.postGraduation} onChange={handleChange} style={styles.input} placeholder="e.g., 8.0 CGPA" />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>College Name</label>
                    <input type="text" name="postGraduationCollege" value={formData.postGraduationCollege} onChange={handleChange} style={styles.input} placeholder="College name" />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stream</label>
                  <input type="text" name="postGraduationStream" value={formData.postGraduationStream} onChange={handleChange} style={styles.input} placeholder="e.g., M.Tech CS" />
                </div>
              </div>

              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Additional Information</h3>
              </div>

             <div style={styles.inputGroup}>
                <label style={styles.label}>Project Details <span style={styles.required}>*</span></label>
                <textarea name="project" value={formData.project} onChange={handleChange} style={{...styles.input, minHeight: "100px", resize: "vertical"}} placeholder="Describe any relevant projects you've worked on..." required />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
            {/* Screening Questions Modal */}
{showScreening && submittedApplication && (
  <ScreeningQuestions 
    applicationData={submittedApplication}
    onComplete={handleScreeningComplete}
  />
)}
          </div>
        </div>
      </div>
    </div>
  );
}

// UPDATE THE STYLES OBJECT IN YOUR ApplyForm.js FILE
// Replace the entire styles object at the bottom of the file with this:

const styles = {
  page: { minHeight: "100vh", background: "#0f0f10", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { marginBottom: "20px" },
  backBtn: { background: "#2c2c2d", border: "1px solid #4a4a4b", padding: "10px 20px", borderRadius: "0", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "white", transition: "all 0.3s" },
  
  formWrapper: { display: "grid", gridTemplateColumns: "350px 1fr", gap: "30px" },
  sidebar: { position: "sticky", top: "20px", height: "fit-content" },
  
  jobInfoCard: { background: "#2c2c2d", borderRadius: "0", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid #4a4a4b" },
  badge: { background: "#ff7c26", color: "white", padding: "4px 12px", borderRadius: "0", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", marginBottom: "12px" },
  
  jobTitle: { fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "4px", lineHeight: "1.3" },
  jobRole: { fontSize: "14px", color: "#8e8e8e", marginBottom: "16px" },
  divider: { height: "1px", background: "#4a4a4b", margin: "20px 0" },
  
  infoSection: { marginBottom: "4px" },
  sidebarTitle: { fontSize: "13px", fontWeight: "700", color: "white", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" },
  
  detailItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #4a4a4b" },
  detailLabel: { fontSize: "13px", color: "#8e8e8e", fontWeight: "500" },
  detailValue: { fontSize: "13px", color: "white", fontWeight: "600" },
  
  skillsList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillBadge: { background: "#4a4a4b", color: "white", padding: "6px 12px", borderRadius: "0", fontSize: "12px", fontWeight: "600", border: "1px solid #6b6b6c" },
  
  responsibilitiesList: { margin: 0, paddingLeft: "20px", color: "#b2b2b3" },
  responsibilityItem: { fontSize: "13px", marginBottom: "8px", lineHeight: "1.5", color: "#b2b2b3" },
  
  benefitsList: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  benefitItem: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px", background: "#0f0f10", borderRadius: "0", border: "1px solid #4a4a4b" },
  benefitIcon: { fontSize: "24px", marginBottom: "6px" },
  benefitText: { fontSize: "11px", fontWeight: "600", color: "#b2b2b3" },
  
  helpBox: { background: "#ff7c26", padding: "20px", borderRadius: "0", marginTop: "20px" },
  helpTitle: { fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "8px", margin: 0 },
  helpText: { fontSize: "12px", color: "white", marginBottom: "12px", lineHeight: "1.5" },
  helpLink: { fontSize: "13px", color: "white", fontWeight: "600", textDecoration: "none", display: "inline-block", borderBottom: "2px solid white" },
  
  formContainer: { background: "#2c2c2d", borderRadius: "0", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid #4a4a4b" },
  formTitle: { fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" },
  formSubtitle: { fontSize: "15px", color: "#8e8e8e", marginBottom: "32px" },
  
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  
  uploadSection: { background: "#2c2c2d", padding: "24px", borderRadius: "0", marginBottom: "20px", border: "2px dashed #ff7c26" },
  uploadBox: { marginBottom: "16px" },
  fileInput: { display: "none" },
  uploadLabel: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#0f0f10", borderRadius: "0", cursor: "pointer", border: "2px dashed #4a4a4b", transition: "all 0.3s" },
  uploadIcon: { fontSize: "32px" },
  uploadText: { display: "flex", flexDirection: "column", flex: 1, color: "white" },
  fileSize: { fontSize: "12px", color: "#8e8e8e", marginTop: "4px" },
  uploadHint: { fontSize: "12px", color: "#8e8e8e", marginTop: "4px", display: "block" },
  
  extractBtn: { width: "100%", background: "#ff7c26", color: "white", border: "none", padding: "14px", borderRadius: "0", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s" },
  uploadNote: { marginTop: "16px", padding: "12px", background: "#2c2c2d", borderRadius: "0", fontSize: "13px", color: "white", lineHeight: "1.5", border: "1px solid #ff7c26" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },
  
  sectionHeader: { marginTop: "16px", marginBottom: "8px" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "white", paddingBottom: "8px", borderBottom: "2px solid #ff7c26", display: "inline-block" },
  
  inputGroup: { display: "flex", flexDirection: "column", flex: 1 },
  inputRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: { fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "6px" },
  required: { color: "#ff7c26" },
  input: { padding: "10px 14px", border: "1px solid #4a4a4b", borderRadius: "0", fontSize: "14px", color: "white", outline: "none", transition: "border-color 0.2s", background: "#0f0f10" },
  helpText: { fontSize: "12px", color: "#8e8e8e", marginTop: "4px" },
  
  academicSection: { background: "#0f0f10", padding: "20px", borderRadius: "0", marginBottom: "16px", border: "1px solid #4a4a4b" },
  academicTitle: { fontSize: "15px", fontWeight: "600", color: "#ff7c26", marginBottom: "12px" },
  
  submitBtn: { background: "#ff7c26", color: "white", border: "none", padding: "14px 32px", borderRadius: "0", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "16px", transition: "all 0.3s" },
  
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f0f10", color: "white" },
  loader: { width: "50px", height: "50px", border: "5px solid #4a4a4b", borderTop: "5px solid #ff7c26", borderRadius: "50%", animation: "spin 1s linear infinite" },

  icon: {
  marginRight: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  color: '#666', // adjust to your color scheme
},

benefitIcon: {
  marginRight: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  color: '#666', // adjust to your color scheme
},
};