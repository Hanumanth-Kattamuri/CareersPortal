import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  border: '#4a4a4b',
};

// Define your screening questions here
const SCREENING_QUESTIONS = [
  {
    id: 1,
    question: "Why do you want to work for our company?",
    type: "textarea"
  },
  {
    id: 2,
    question: "What are your salary expectations?",
    type: "text"
  },
  {
    id: 3,
    question: "When can you start working if selected?",
    type: "text"
  },
  {
    id: 4,
    question: "Are you willing to relocate?",
    type: "radio",
    options: ["Yes", "No", "Maybe"]
  },
  {
    id: 5,
    question: "Do you have any prior experience in this field?",
    type: "textarea"
  }
];

function ScreeningQuestions({ applicationData, onComplete }) {
  const [answers, setAnswers] = useState(
    SCREENING_QUESTIONS.map(q => ({ question: q.question, answer: '' }))
  );
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all questions are answered
    const unanswered = answers.filter(a => !a.answer.trim());
    if (unanswered.length > 0) {
      alert('Please answer all screening questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/screening-answers', {
        applicationId: applicationData._id,
        applicantName: applicationData.name,
        applicantEmail: applicationData.email,
        jobTitle: applicationData.jobTitle,
        answers: answers
      });

      alert('✅ Screening questions submitted successfully!');
      onComplete();
    } catch (err) {
      console.error('Error submitting screening answers:', err);
      alert('Failed to submit screening answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <CheckCircle size={48} style={{ color: GAMYAM_COLORS.orange }} />
          <h2 style={styles.title}>Application Submitted Successfully!</h2>
          <p style={styles.subtitle}>
            Please answer a few screening questions to complete your application
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {SCREENING_QUESTIONS.map((question, index) => (
            <div key={question.id} style={styles.questionBlock}>
              <label style={styles.label}>
                <span style={styles.questionNumber}>Q{question.id}.</span>
                {question.question}
                <span style={styles.required}>*</span>
              </label>

              {question.type === 'textarea' && (
                <textarea
                  value={answers[index].answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  style={styles.textarea}
                  rows={4}
                  placeholder="Type your answer here..."
                  required
                />
              )}

              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[index].answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  style={styles.input}
                  placeholder="Type your answer here..."
                  required
                />
              )}

              {question.type === 'radio' && (
                <div style={styles.radioGroup}>
                  {question.options.map((option) => (
                    <label key={option} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[index].answer === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        style={styles.radio}
                        required
                      />
                      <span style={styles.radioText}>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Screening Questions'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    overflowY: 'auto',
  },
  container: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '12px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  header: {
    textAlign: 'center',
    padding: '40px 30px 30px',
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: GAMYAM_COLORS.textLight,
    marginTop: '16px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: GAMYAM_COLORS.textMuted,
    margin: 0,
  },
  form: {
    padding: '30px',
  },
  questionBlock: {
    marginBottom: '28px',
  },
  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: GAMYAM_COLORS.textLight,
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  questionNumber: {
    color: GAMYAM_COLORS.orange,
    marginRight: '8px',
    fontWeight: '700',
  },
  required: {
    color: GAMYAM_COLORS.orange,
    marginLeft: '4px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '12px',
    background: GAMYAM_COLORS.darkBg,
    color: GAMYAM_COLORS.textLight,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    background: GAMYAM_COLORS.darkBg,
    borderRadius: '6px',
    cursor: 'pointer',
    border: `1px solid ${GAMYAM_COLORS.border}`,
    transition: 'all 0.2s',
  },
  radio: {
    marginRight: '12px',
    cursor: 'pointer',
    accentColor: GAMYAM_COLORS.orange,
  },
  radioText: {
    fontSize: '14px',
    color: GAMYAM_COLORS.textLight,
  },
  submitBtn: {
    width: '100%',
    background: GAMYAM_COLORS.orange,
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s',
  },
};

export default ScreeningQuestions;