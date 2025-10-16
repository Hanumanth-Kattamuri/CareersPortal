import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, Send, X, ExternalLink, Save, Edit2, Calendar, CheckCircle, XCircle } from "lucide-react";
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

const GOOGLE_SHEET_ID = '1wgNsZ5mtOCaj6vnvD84ECMnx-Hw3cFzmlUxwiQTUQzo';

function RecruiterActionsPage({ applicant, onBack }) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "",
    body: ""
  });
  const [sending, setSending] = useState(false);
  
  const [roundStatus, setRoundStatus] = useState("Round 1");
  const [feedback, setFeedback] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [interviewerPhone, setInterviewerPhone] = useState("");
  const [panelNumber, setPanelNumber] = useState("");
  const [scheduledBy, setScheduledBy] = useState("");
  const [interviewPlace, setInterviewPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [allFeedback, setAllFeedback] = useState("");
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    loadRecruiterActions();
  }, [applicant._id]);

  const loadRecruiterActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/recruiter-actions/${applicant._id}`);
      const data = response.data;
      
      setRoundStatus(data.roundStatus || "Round 1");
      setAllFeedback(data.feedback || "");
      setScheduledDate(data.scheduledDate || "");
      setScheduledTime(data.scheduledTime || "");
      setInterviewerName(data.interviewerName || "");
      setInterviewerEmail(data.interviewerEmail || "");
      setInterviewerPhone(data.interviewerPhone || "");
      setPanelNumber(data.panelNumber || "");
      setScheduledBy(data.scheduledBy || "");
      setInterviewPlace(data.interviewPlace || "");
      setIsRejected(data.isRejected || false);
      
      // Extract current round feedback
      const feedbackLines = (data.feedback || "").split('\n');
      const currentRoundFeedback = feedbackLines.find(line => line.startsWith(`${data.roundStatus}:`));
      if (currentRoundFeedback) {
        setFeedback(currentRoundFeedback.replace(`${data.roundStatus}:`, '').trim());
      } else {
        setFeedback("");
      }
      
      if (data.scheduledDate || data.interviewerName) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
      
      console.log('✅ Loaded existing recruiter actions');
    } catch (err) {
      console.error('Error loading recruiter actions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.body) {
      alert("Please fill in both subject and email body");
      return;
    }

    setSending(true);
    try {
      await axios.post("http://localhost:5000/api/send-custom-email", {
        to: applicant.email,
        subject: emailData.subject,
        body: emailData.body,
        applicantName: applicant.name
      });
      alert("Email sent successfully!");
      setShowEmailModal(false);
      setEmailData({ subject: "", body: "" });
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email");
    }
    setSending(false);
  };

  const handleSendInvitation = async () => {
    if (!scheduledDate || !scheduledTime || !interviewPlace || !interviewerName || !interviewerEmail || !panelNumber) {
      alert("Please fill in all interview details before sending invitation");
      return;
    }

    setSending(true);
    try {
      await axios.post("http://localhost:5000/api/send-interview-invitation", {
        applicantEmail: applicant.email,
        applicantName: applicant.name,
        interviewerEmail: interviewerEmail,
        interviewerName: interviewerName,
        jobTitle: applicant.jobTitle,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        interviewPlace: interviewPlace,
        roundStatus: roundStatus,
        panelNumber: panelNumber,
        interviewerPhone: interviewerPhone
      });
      
      alert("Interview invitation sent to both applicant and interviewer!");
      setShowInviteModal(false);
    } catch (err) {
      console.error("Error sending invitation:", err);
      alert("Failed to send invitation");
    }
    setSending(false);
  };

  const handleSaveScheduleDetails = async () => {
    if (!scheduledDate || !scheduledTime || !interviewerName || !interviewerEmail || !scheduledBy || !interviewPlace || !panelNumber) {
      alert("Please fill in all schedule details");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`http://localhost:5000/api/recruiter-actions/${applicant._id}`, {
        roundStatus,
        feedback: allFeedback,
        scheduledDate,
        scheduledTime,
        interviewerName,
        interviewerEmail,
        interviewerPhone,
        panelNumber,
        scheduledBy,
        interviewPlace,
        isRejected,
        rejectionRound: isRejected ? roundStatus : ''
      });
      alert("Schedule details saved successfully!");
      setIsEditing(false);
      loadRecruiterActions();
    } catch (err) {
      console.error("Error saving schedule details:", err);
      alert("Failed to save schedule details");
    }
    setSaving(false);
  };

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback before saving");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`http://localhost:5000/api/recruiter-actions/${applicant._id}`, {
        roundStatus,
        feedback: feedback.trim(),
        scheduledDate,
        scheduledTime,
        interviewerName,
        interviewerEmail,
        interviewerPhone,
        panelNumber,
        scheduledBy,
        interviewPlace,
        isRejected,
        rejectionRound: isRejected ? roundStatus : ''
      });
      alert("Feedback saved successfully!");
      loadRecruiterActions();
    } catch (err) {
      console.error("Error saving feedback:", err);
      alert("Failed to save feedback");
    }
    setSaving(false);
  };

  const handleRejectCandidate = async () => {
    if (!window.confirm(`Are you sure you want to reject ${applicant.name} in ${roundStatus}?`)) {
      return;
    }

    setSaving(true);
    try {
      await axios.post(`http://localhost:5000/api/recruiter-actions/${applicant._id}`, {
        roundStatus,
        feedback: feedback.trim(),
        scheduledDate,
        scheduledTime,
        interviewerName,
        interviewerEmail,
        interviewerPhone,
        panelNumber,
        scheduledBy,
        interviewPlace,
        isRejected: true,
        rejectionRound: roundStatus
      });

      await axios.post(`http://localhost:5000/api/applications/${applicant._id}/reject`);
      
      alert(`Candidate rejected in ${roundStatus}. Rejection email sent.`);
      setIsRejected(true);
      loadRecruiterActions();
    } catch (err) {
      console.error("Error rejecting candidate:", err);
      alert("Failed to reject candidate");
    }
    setSaving(false);
  };

  const handlePromoteToNextRound = async () => {
    const roundOrder = ["Round 1", "Round 2", "Round 3", "Final Round"];
    const currentIndex = roundOrder.indexOf(roundStatus);
    
    if (currentIndex === -1 || currentIndex >= roundOrder.length - 1) {
      alert("Candidate is already in the final round");
      return;
    }

    const nextRound = roundOrder[currentIndex + 1];
    setShowPromoteModal(true);
  };

  const confirmPromoteToNextRound = async () => {
    const roundOrder = ["Round 1", "Round 2", "Round 3", "Final Round"];
    const currentIndex = roundOrder.indexOf(roundStatus);
    const nextRound = roundOrder[currentIndex + 1];

    setSending(true);
    try {
      await axios.post(`http://localhost:5000/api/applications/${applicant._id}/promote-round`, {
        nextRound: nextRound,
        message: `Congratulations! You have successfully cleared ${roundStatus} and have been selected for ${nextRound}. Our HR team will contact you shortly with the interview schedule.`
      });

      alert(`Candidate promoted to ${nextRound} successfully! Email sent.`);
      setShowPromoteModal(false);
      loadRecruiterActions();
    } catch (err) {
      console.error("Error promoting candidate:", err);
      alert("Failed to promote candidate");
    }
    setSending(false);
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

  const handleViewSpreadsheet = () => {
    if (GOOGLE_SHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
      alert('Please configure your Google Spreadsheet ID in the code');
      return;
    }
    window.open(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  if (isRejected) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={onBack}>
              <ArrowLeft size={20} /> Back
            </button>
            <h1 style={styles.title}>Recruiter Actions Page</h1>
          </div>

          <div style={styles.rejectedCard}>
            <XCircle size={64} style={{ color: '#ff2727', marginBottom: '20px' }} />
            <h2 style={{ color: '#ff2727', fontSize: '24px', marginBottom: '10px' }}>Candidate Rejected</h2>
            <p style={{ color: GAMYAM_COLORS.textMuted, fontSize: '16px' }}>
              {applicant.name} was rejected in {roundStatus}.
            </p>
            <p style={{ color: GAMYAM_COLORS.textDim, fontSize: '14px', marginTop: '20px' }}>
              No further rounds available.
            </p>
            
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: GAMYAM_COLORS.orange, marginBottom: '12px' }}>All Feedback:</h3>
              <div style={styles.feedbackDisplay}>
                {allFeedback.split('\n').map((line, idx) => (
                  <p key={idx} style={{ margin: '8px 0', color: GAMYAM_COLORS.textMuted }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
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
          <h1 style={styles.title}>Recruiter Actions Page</h1>
          <button style={styles.spreadsheetBtn} onClick={handleViewSpreadsheet}>
            <ExternalLink size={18} /> View Spreadsheet
          </button>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Applicant Profile</h2>
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

          <div style={styles.middleSection}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Communication</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  style={styles.actionBtn}
                  onClick={() => setShowEmailModal(true)}
                >
                  <Mail size={18} /> Send Email
                </button>
                <button 
                  style={{...styles.actionBtn, background: '#4CAF50'}}
                  onClick={() => setShowInviteModal(true)}
                >
                  <Calendar size={18} /> Send Invitation
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Interview Round Status</h2>
              <select 
                value={roundStatus} 
                onChange={(e) => setRoundStatus(e.target.value)}
                style={styles.select}
                disabled={!isEditing}
              >
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
                <option value="Round 3">Round 3</option>
                <option value="Final Round">Final Round</option>
              </select>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Contact Number</h2>
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

            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{...styles.cardTitle, marginBottom: 0}}>Schedule Interview</h2>
                {!isEditing && (
                  <button 
                    style={styles.editBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                )}
              </div>
              
              <label style={styles.label}>Date:</label>
              <input 
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Time:</label>
              <input 
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Interviewer Name:</label>
              <input 
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Enter interviewer name"
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Interviewer Email:</label>
              <input 
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="Enter interviewer email"
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Interviewer Phone:</label>
              <input 
                type="tel"
                value={interviewerPhone}
                onChange={(e) => setInterviewerPhone(e.target.value)}
                placeholder="Enter interviewer phone"
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Panel Number:</label>
              <input 
                type="text"
                value={panelNumber}
                onChange={(e) => setPanelNumber(e.target.value)}
                placeholder="Enter panel number"
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Scheduled By:</label>
              <input 
                type="text"
                value={scheduledBy}
                onChange={(e) => setScheduledBy(e.target.value)}
                placeholder="Enter your name"
                style={styles.input}
                disabled={!isEditing}
              />

              <label style={styles.label}>Interview Place:</label>
              <input 
                type="text"
                value={interviewPlace}
                onChange={(e) => setInterviewPlace(e.target.value)}
                placeholder="Enter interview location/venue"
                style={styles.input}
                disabled={!isEditing}
              />

              {isEditing && (
                <button 
                  style={styles.saveScheduleBtn}
                  onClick={handleSaveScheduleDetails}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save Schedule Details"}
                </button>
              )}
            </div>
          </div>

          <div style={styles.rightSection}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Feedback for {roundStatus}</h2>
              <p style={styles.feedbackLabel}>Write detailed feedback:</p>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter detailed feedback about the candidate's performance, technical skills, communication, etc."
                style={styles.textarea}
                rows={8}
              />
              <button 
                style={styles.saveBtn}
                onClick={handleSaveFeedback}
                disabled={saving}
              >
                <Save size={16} /> {saving ? "Saving..." : "Save Feedback"}
              </button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>All Feedback History</h2>
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

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Round Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  style={styles.promoteBtn}
                  onClick={handlePromoteToNextRound}
                  disabled={saving || roundStatus === "Final Round"}
                >
                  <CheckCircle size={18} /> Promote to Next Round
                </button>
                <button 
                  style={styles.rejectBtn}
                  onClick={handleRejectCandidate}
                  disabled={saving}
                >
                  <XCircle size={18} /> Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Email Modal */}
        {showEmailModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContainer}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Compose Email</h2>
                <button 
                  style={styles.closeBtn} 
                  onClick={() => setShowEmailModal(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={styles.modalContent}>
                <div style={styles.modalInfo}>
                  <strong>To:</strong> {applicant.email}
                </div>

                <label style={styles.label}>Subject:</label>
                <input 
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Enter email subject"
                  style={styles.input}
                />

                <label style={styles.label}>Message:</label>
                <textarea 
                  value={emailData.body}
                  onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                  placeholder="Write your email message here..."
                  style={styles.textarea}
                  rows={10}
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={styles.sendEmailBtn}
                  onClick={handleSendEmail}
                  disabled={sending}
                >
                  <Send size={16} /> {sending ? "Sending..." : "Send Email"}
                </button>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Invitation Modal */}
        {showInviteModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContainer}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Send Interview Invitation</h2>
                <button 
                  style={styles.closeBtn} 
                  onClick={() => setShowInviteModal(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={styles.modalContent}>
                <div style={styles.modalInfo}>
                  <strong>To:</strong> {applicant.email} & {interviewerEmail || 'Interviewer email not set'}
                </div>

                <div style={styles.invitePreview}>
                  <h3 style={styles.previewTitle}>Interview Invitation Preview</h3>
                  <div style={styles.previewItem}>
                    <strong>Position:</strong> {applicant.jobTitle}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Date:</strong> {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Time:</strong> {scheduledTime || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Venue:</strong> {interviewPlace || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Interviewer:</strong> {interviewerName || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Interviewer Email:</strong> {interviewerEmail || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Interviewer Phone:</strong> {interviewerPhone || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Panel Number:</strong> {panelNumber || 'Not set'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Round:</strong> {roundStatus}
                  </div>
                </div>

                {(!scheduledDate || !scheduledTime || !interviewPlace || !interviewerName || !interviewerEmail || !panelNumber) && (
                  <div style={styles.warningBox}>
                    ⚠️ Please fill in all interview details before sending the invitation
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={{...styles.sendEmailBtn, background: '#4CAF50'}}
                  onClick={handleSendInvitation}
                  disabled={sending || !scheduledDate || !scheduledTime || !interviewPlace || !interviewerName || !interviewerEmail || !panelNumber}
                >
                  <Send size={16} /> {sending ? "Sending..." : "Send Invitation"}
                </button>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promote to Next Round Modal */}
        {showPromoteModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContainer}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Promote to Next Round</h2>
                <button 
                  style={styles.closeBtn} 
                  onClick={() => setShowPromoteModal(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={styles.modalContent}>
                <div style={styles.promoteInfo}>
                  <CheckCircle size={48} style={{ color: '#4CAF50', marginBottom: '16px' }} />
                  <h3 style={{ color: GAMYAM_COLORS.textLight, marginBottom: '12px' }}>
                    Promote {applicant.name}?
                  </h3>
                  <p style={{ color: GAMYAM_COLORS.textMuted, marginBottom: '8px' }}>
                    Current Round: <strong>{roundStatus}</strong>
                  </p>
                  <p style={{ color: GAMYAM_COLORS.textMuted }}>
                    Next Round: <strong style={{ color: '#4CAF50' }}>
                      {roundStatus === "Round 1" ? "Round 2" : roundStatus === "Round 2" ? "Round 3" : "Final Round"}
                    </strong>
                  </p>
                  <div style={styles.warningBox}>
                    📧 An email will be sent to {applicant.email} informing them about the promotion.
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={{...styles.sendEmailBtn, background: '#4CAF50'}}
                  onClick={confirmPromoteToNextRound}
                  disabled={sending}
                >
                  <CheckCircle size={16} /> {sending ? "Promoting..." : "Confirm Promotion"}
                </button>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowPromoteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
  spreadsheetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
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
  actionBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
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
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: GAMYAM_COLORS.textLight,
    marginBottom: "6px",
    marginTop: "12px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  saveScheduleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "16px",
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
  feedbackDisplay: {
    background: GAMYAM_COLORS.darkGray,
    padding: "16px",
    borderRadius: "8px",
    minHeight: "100px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  promoteBtn: {
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
  },
  rejectBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#ff2727",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  rejectedCard: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    padding: "40px",
    border: `1px solid ${GAMYAM_COLORS.border}`,
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
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
    padding: "20px",
  },
  modalContainer: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: "12px",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
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
    cursor: "pointer",
    color: GAMYAM_COLORS.textDim,
    padding: "4px",
  },
  modalContent: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  modalInfo: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    marginBottom: "20px",
    padding: "10px",
    background: GAMYAM_COLORS.darkGray,
    borderRadius: "6px",
  },
  invitePreview: {
    background: GAMYAM_COLORS.darkGray,
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  previewTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: GAMYAM_COLORS.orange,
    marginTop: 0,
    marginBottom: "12px",
  },
  previewItem: {
    fontSize: "14px",
    color: GAMYAM_COLORS.textMuted,
    marginBottom: "8px",
  },
  warningBox: {
    background: "rgba(255, 193, 7, 0.1)",
    border: "1px solid rgba(255, 193, 7, 0.3)",
    color: "#ffc107",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginTop: "12px",
  },
  promoteInfo: {
    textAlign: "center",
    padding: "20px",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: `1px solid ${GAMYAM_COLORS.border}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  sendEmailBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: GAMYAM_COLORS.orange,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: GAMYAM_COLORS.darkGray,
    color: GAMYAM_COLORS.textLight,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default RecruiterActionsPage;