import React, { useState } from 'react';
import axios from 'axios';
import { X, Lock } from 'lucide-react';

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  border: '#4a4a4b',
};

function ResetPasswordModal({ email, userType, onClose, onSuccess }) {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        resetCode,
        newPassword,
        userType
      });

      if (response.data.success) {
        alert('Password reset successful! Please login with your new password.');
        onSuccess();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reset Password</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleResetPassword} style={styles.form}>
          <p style={styles.info}>
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input
              type="text"
              placeholder="6-Digit Reset Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              style={styles.input}
              maxLength={6}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    border: `1px solid ${GAMYAM_COLORS.border}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: `1px solid ${GAMYAM_COLORS.border}`,
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: GAMYAM_COLORS.textLight,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: GAMYAM_COLORS.textMuted,
    cursor: 'pointer',
    padding: 0,
  },
  form: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  info: {
    fontSize: '14px',
    color: GAMYAM_COLORS.textMuted,
    marginBottom: '10px',
  },
  inputGroup: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: GAMYAM_COLORS.textMuted,
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 45px',
    background: GAMYAM_COLORS.darkBg,
    border: `1px solid ${GAMYAM_COLORS.border}`,
    borderRadius: '8px',
    color: GAMYAM_COLORS.textLight,
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: GAMYAM_COLORS.orange,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    marginTop: '10px',
  },
};

export default ResetPasswordModal;