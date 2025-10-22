import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, Save, Calendar, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import axios from "axios";

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  textDim: '#8e8e8e',
  border: '#4a4a4b',
};

function RecruiterActionsPage({ applicant, onBack, user }) {
  const [roundStatus, setRoundStatus] = useState("Round 1");
  const [feedback, setFeedback] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [panelNumber, setPanelNumber] = useState("");
  const [interviewPlace, setInterviewPlace] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allFeedback, setAllFeedback] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState(null);
  const [loadingScreening, setLoadingScreening] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const roundMap = {
    'Round 1': 'round1',
    'Round 2': 'round2',
    'Round 3': 'round3',
    'Final Round': 'finalRound'
  };

  useEffect(() => {
    loadRecruiterActions();
  }, [applicant._id]);

  useEffect(() => {
    if (roundStatus && !loading) {
      loadRecruiterActions();
    }
  }, [roundStatus]);

  useEffect(() => {
    if (applicant && applicant._id) {
      loadScreeningAnswers();
    }
  }, [applicant._id]);

  const loadRecruiterActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/recruiter-actions/${applicant._id}`);
      const data = response.data;
      
      setRoundStatus(data.currentRound || "Round 1");
      
      const currentRoundField = roundMap[data.currentRound || "Round 1"];
      const currentRoundData = data[currentRoundField] || {};
      
      setFeedback(currentRoundData.feedback || "");
      setScheduledDate(currentRoundData.scheduledDate || "");
      setScheduledTime(currentRoundData.scheduledTime || "");
      setPanelNumber(currentRoundData.panelNumber || "");
      setInterviewPlace(currentRoundData.interviewPlace || "");
      setInterviewerName(currentRoundData.interviewerName || "");
      
      // Check if feedback already submitted
      setFeedbackSubmitted(!!currentRoundData.feedback);
      
      let allFeedbackText = "";
      ['Round 1', 'Round 2', 'Round 3', 'Final Round'].forEach(round => {
        const roundField = roundMap[round];
        const roundData = data[roundField];
        if (roundData && roundData.feedback) {
          allFeedbackText += `${round}: ${roundData.feedback}\n`;
        }
      });
      setAllFeedback(allFeedbackText.trim());
      
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('No data found');
      } else {
        console.error('Error loading recruiter actions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadScreeningAnswers = async () => {
    try {
      setLoadingScreening(true);
      const response = await axios.get(`http://localhost:5000/api/screening-answers/${applicant._id}`);
      setScreeningAnswers(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setScreeningAnswers(null);
      } else {
        console.error('Error loading screening answers:', err);
      }
    } finally {
      setLoadingScreening(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback before saving");
      return;
    }

    setSaving(true);
    try {
      const existingAction = await axios.get(`http://localhost:5000/api/recruiter-actions/${applicant._id}`);
            console.log('🔍 DEBUG - Sending recruiterCompleted: true'); // ✅ ADD THIS

      
      await axios.post(`http://localhost:5000/api/recruiter-actions/${applicant._id}`, {
        roundStatus,
        feedback: feedback.trim(),
        scheduledDate: existingAction.data[roundMap[roundStatus]]?.scheduledDate || scheduledDate,
        scheduledTime: existingAction.data[roundMap[roundStatus]]?.scheduledTime || scheduledTime,
        interviewerName: existingAction.data[roundMap[roundStatus]]?.interviewerName || interviewerName,
        interviewerEmail: existingAction.data[roundMap[roundStatus]]?.interviewerEmail || '',
        interviewerPhone: existingAction.data[roundMap[roundStatus]]?.interviewerPhone || '',
        panelNumber: existingAction.data[roundMap[roundStatus]]?.panelNumber || panelNumber,
        scheduledBy: existingAction.data[roundMap[roundStatus]]?.scheduledBy || '',
        interviewPlace: existingAction.data[roundMap[roundStatus]]?.interviewPlace || interviewPlace,
        isRejected: false,
        rejectionRound: '',
        syncToSheets: false, // Don't sync to sheets
        recruiterCompleted: true // ✅ NEW: Mark as completed
      });
      
      alert("Feedback saved and marked as completed!");
      setFeedbackSubmitted(true);
      await loadRecruiterActions();

      // ✅ NEW: Go back to dashboard after saving
      if (onBack) {
        onBack();
      }
      
    } catch (err) {
      console.error("Error saving feedback:", err);
      alert("Failed to save feedback");
    }
    setSaving(false);
  };

  const handleViewResume = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/${applicant._id}/resume`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Error viewing resume:', err);
      alert('Failed to load resume');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: GAMYAM_COLORS.textLight, fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} /> Back
          </button>
          <h1 style={styles.title}>Interview Feedback - {applicant.name}</h1>
        </div>

        <div style={styles.mainGrid}>
          {/* Left Section - Applicant Profile */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Candidate Profile</h2>
            <div style={styles.profileSection}>
              <div style={styles.avatarCircle}>
                {applicant.name.charAt(0).toUpperCase()}
              </div>
              <h3 style={styles.profileName}>{applicant.name}</h3>
              <p style={styles.profileRole}>{applicant.jobTitle}</p>
            </div>

            <div style={styles.infoSection}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{applicant.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone:</span>
                <span style={styles.infoValue}>{applicant.phone}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Skills:</span>
                <span style={styles.infoValue}>{applicant.skillset}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Applied:</span>
                <span style={styles.infoValue}>{formatDate(applicant.appliedAt)}</span>
              </div>
            </div>

            <button style={styles.resumeBtn} onClick={handleViewResume}>
              📄 View Resume
            </button>
          </div>

          {/* Middle Section */}
          <div style={styles.middleSection}>
            {/* Interview Schedule Info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📅 Interview Schedule</h2>
              
              <div style={styles.scheduleGrid}>
                <div style={styles.scheduleItem}>
                  <Calendar size={20} style={{ color: GAMYAM_COLORS.orange }} />
                  <div>
                    <p style={styles.scheduleLabel}>Date</p>
                    <p style={styles.scheduleValue}>{formatDate(scheduledDate)}</p>
                  </div>
                </div>

                <div style={styles.scheduleItem}>
                  <Clock size={20} style={{ color: GAMYAM_COLORS.orange }} />
                  <div>
                    <p style={styles.scheduleLabel}>Time</p>
                    <p style={styles.scheduleValue}>{scheduledTime || 'Not set'}</p>
                  </div>
                </div>

                <div style={styles.scheduleItem}>
                  <MapPin size={20} style={{ color: GAMYAM_COLORS.orange }} />
                  <div>
                    <p style={styles.scheduleLabel}>Venue</p>
                    <p style={styles.scheduleValue}>{interviewPlace || 'Not set'}</p>
                  </div>
                </div>

                <div style={styles.scheduleItem}>
                  <Users size={20} style={{ color: GAMYAM_COLORS.orange }} />
                  <div>
                    <p style={styles.scheduleLabel}>Panel Number</p>
                    <p style={styles.scheduleValue}>{panelNumber || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div style={styles.roundBadge}>
                <span style={styles.roundLabel}>Current Round:</span>
                <span style={styles.roundValue}>{roundStatus}</span>
              </div>
            </div>

            {/* Contact */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📞 Quick Contact</h2>
              <div style={styles.contactBox}>
                <Phone size={18} style={{ color: GAMYAM_COLORS.orange }} />
                <a 
                  href={`tel:${applicant.phone}`} 
                  style={styles.phoneNumber}
                >
                  {applicant.phone}
                </a>
              </div>
            </div>

            {/* Screening Answers */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Screening Questions</h2>
              
              {loadingScreening ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: GAMYAM_COLORS.textMuted }}>Loading screening answers...</p>
                </div>
              ) : screeningAnswers && screeningAnswers.answers && screeningAnswers.answers.length > 0 ? (
                <div style={styles.feedbackDisplay}>
                  {screeningAnswers.answers.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        marginBottom: '16px', 
                        paddingBottom: '16px', 
                        borderBottom: idx < screeningAnswers.answers.length - 1 ? `1px solid ${GAMYAM_COLORS.border}` : 'none' 
                      }}
                    >
                      <p style={{ 
                        color: GAMYAM_COLORS.orange, 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        fontSize: '14px' 
                      }}>
                        Q{idx + 1}. {item.question}
                      </p>
                      <p style={{ 
                        color: GAMYAM_COLORS.textMuted, 
                        margin: 0, 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: GAMYAM_COLORS.textDim, fontSize: '14px' }}>
                    ℹ️ No screening answers submitted yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Feedback */}
          <div style={styles.rightSection}>
            {/* Submit Feedback */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>✍️ Your Interview Feedback</h2>
              
              {feedbackSubmitted && (
                <div style={styles.successBadge}>
                  <CheckCircle size={18} style={{ color: '#4CAF50' }} />
                  <span>Feedback submitted successfully!</span>
                </div>
              )}

              <p style={styles.feedbackLabel}>
                Write your feedback for <strong>{roundStatus}</strong>:
              </p>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your detailed feedback about:
• Technical skills and knowledge
• Communication and clarity
• Problem-solving approach
• Overall performance
• Recommendation (Proceed/Hold/Reject)"
                style={styles.textarea}
                rows={12}
                disabled={feedbackSubmitted}
              />
              
              {!feedbackSubmitted && (
                <button 
                  style={styles.saveBtn}
                  onClick={handleSaveFeedback}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Saving..." : "Submit Feedback"}
                </button>
              )}

              {feedbackSubmitted && (
                <button 
                  style={styles.editBtn}
                  onClick={() => setFeedbackSubmitted(false)}
                >
                  Edit Feedback
                </button>
              )}
            </div>

            {/* All Feedback History */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📝 Feedback History</h2>
              <div style={styles.feedbackDisplay}>
                {allFeedback ? (
                  allFeedback.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: '8px 0', color: GAMYAM_COLORS.textMuted, fontSize: '14px' }}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p style={{ color: GAMYAM_COLORS.textDim, fontSize: '14px' }}>No feedback yet</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div style={styles.instructionsCard}>
              <h3 style={styles.instructionsTitle}>📌 Instructions</h3>
              <ul style={styles.instructionsList}>
                <li>Review the candidate's profile and screening answers</li>
                <li>Conduct the interview at the scheduled time</li>
                <li>Provide detailed and honest feedback</li>
                <li>Submit feedback immediately after the interview</li>
                <li>HR will review and take further action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: GAMYAM_COLORS.darkBg,
  },
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
  },
  header: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "20px 30px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: GAMYAM_COLORS.textLight,
    margin: 0,
    flex: 1,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr 400px",
    gap: "25px",
  },
  card: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "20px",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  middleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: GAMYAM_COLORS.orange,
    marginBottom: "16px",
    marginTop: "0",
  },
  profileSection: {
    textAlign: "center",
    marginBottom: "20px",
  },
  avatarCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: GAMYAM_COLORS.orange,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 auto 12px",
  },
  profileName: {
    fontSize: "20px",
    fontWeight: "600",
    color: GAMYAM_COLORS.textLight,
    margin: "8px 0 4px",
  },
  profileRole: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    margin: 0,
  },
  infoSection: {
    marginBottom: "20px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "12px",
    padding: "10px",
    background: GAMYAM_COLORS.darkGray,
    borderRadius: "6px",
  },
  infoLabel: {
    fontSize: "12px",
    color: GAMYAM_COLORS.textDim,
    marginBottom: "4px",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textLight,
    fontWeight: "500",
  },
  resumeBtn: {
    width: "100%",
    padding: "12px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  scheduleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  scheduleItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    background: GAMYAM_COLORS.darkGray,
    borderRadius: "8px",
  },
  scheduleLabel: {
    fontSize: "12px",
    color: GAMYAM_COLORS.textDim,
    margin: "0 0 4px 0",
  },
  scheduleValue: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textLight,
    fontWeight: "600",
    margin: 0,
  },
  roundBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    background: `linear-gradient(135deg, ${GAMYAM_COLORS.orange}22, ${GAMYAM_COLORS.orange}11)`,
    borderRadius: "8px",
    border: `1px solid ${GAMYAM_COLORS.orange}`,
  },
  roundLabel: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
  },
  roundValue: {
    fontSize: "16px",
    color: GAMYAM_COLORS.orange,
    fontWeight: "700",
  },
  contactBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: GAMYAM_COLORS.darkGray,
    borderRadius: "6px",
  },
  phoneNumber: {
    fontSize: "16px",
    fontWeight: "600",
    color: GAMYAM_COLORS.textLight,
    textDecoration: "none",
  },
  successBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    background: "rgba(76, 175, 80, 0.1)",
    border: "1px solid rgba(76, 175, 80, 0.3)",
    borderRadius: "8px",
    color: "#4CAF50",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  feedbackLabel: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },
  saveBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#4CAF50",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "12px",
  },
  editBtn: {
    width: "100%",
    padding: "10px",
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "12px",
  },
  feedbackDisplay: {
    background: GAMYAM_COLORS.darkGray,
    padding: "16px",
    borderRadius: "8px",
    minHeight: "100px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  instructionsCard: {
    background: `linear-gradient(135deg, ${GAMYAM_COLORS.darkCard}, ${GAMYAM_COLORS.darkGray})`,
    borderRadius: "12px",
    padding: "20px",
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  instructionsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: GAMYAM_COLORS.orange,
    marginTop: 0,
    marginBottom: "12px",
  },
  instructionsList: {
    margin: 0,
    paddingLeft: "20px",
    color: GAMYAM_COLORS.textMuted,
    fontSize: "14px",
    lineHeight: "1.8",
  },
};

export default RecruiterActionsPage;