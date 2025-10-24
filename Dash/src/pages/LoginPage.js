import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Phone } from 'lucide-react';
import ResetPasswordModal from '../components/ResetPasswordModal';

const GAMYAM_COLORS = {
  darkBg: '#0f0f10',
  darkCard: '#2c2c2d',
  darkGray: '#4a4a4b',
  orange: '#ff7c26',
  textLight: '#ffffff',
  textMuted: '#b2b2b3',
  border: '#4a4a4b',
};

function LoginPage({ onLogin }) {
  const [userType, setUserType] = useState('hr'); // 'hr' or 'recruiter'
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const endpoint = userType === 'hr' 
      ? 'http://localhost:5000/api/auth/hr-login'
      : 'http://localhost:5000/api/auth/recruiter-login';

    const response = await axios.post(endpoint, {
      email: formData.email,
      password: formData.password
    });

    if (response.data.success) {
      // ADD CONSOLE LOG HERE
      console.log('✅ LOGIN RESPONSE:', response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    }
  } catch (err) {
    alert(err.response?.data?.error || 'Login failed');
  }
  setLoading(false);
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/recruiter-register', formData);

      if (response.data.success) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setFormData({ email: '', password: '', name: '', phone: '' });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (email) => {
  if (!email) {
    alert('Please enter your email address');
    return;
  }

  setLoading(true);
  try {
    const endpoint = userType === 'hr' 
      ? 'http://localhost:5000/api/auth/hr-forgot-password'
      : 'http://localhost:5000/api/auth/recruiter-forgot-password';

    const response = await axios.post(endpoint, { email });

    if (response.data.success) {
      setResetEmail(email);
      setShowResetModal(true);
    }
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to send reset link');
  }
  setLoading(false);
};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Gamyam Portal</h1>
          <p style={styles.subtitle}>
            {isRegistering ? 'Create Recruiter Account' : 'Sign in to continue'}
          </p>

          {!isRegistering && (
            <div style={styles.toggleContainer}>
              <button
                style={styles.toggleBtn(userType === 'hr')}
                onClick={() => setUserType('hr')}
              >
                HR Admin
              </button>
              <button
                style={styles.toggleBtn(userType === 'recruiter')}
                onClick={() => setUserType('recruiter')}
              >
                Recruiter
              </button>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={styles.form}>
            {isRegistering && (
              <>
                <div style={styles.inputGroup}>
                  <User size={20} style={styles.icon} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <Phone size={20} style={styles.icon} />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </>
            )}

            <div style={styles.inputGroup}>
              <Mail size={20} style={styles.icon} />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock size={20} style={styles.icon} />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
            </button>
            {!isRegistering && (
  <button
    type="button"
    style={styles.forgotPasswordBtn}
    onClick={() => {
      const email = formData.email;
      if (!email) {
        alert('Please enter your email address first');
        return;
      }
      handleForgotPassword(email);
    }}
  >
    Forgot Password?
  </button>
)}
          </form>

          {userType === 'recruiter' && (
            <div style={styles.footer}>
              <button
                style={styles.switchBtn}
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setFormData({ email: '', password: '', name: '', phone: '' });
                }}
              >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          )}

          {userType === 'hr' && (
            <div style={styles.hint}>
              <p>Default HR Credentials:</p>
              <p>Email: hr@gamyam.com</p>
              <p>Password: hr123456</p>
            </div>
          )}
          {showResetModal && (
  <ResetPasswordModal
    email={resetEmail}
    userType={userType}
    onClose={() => setShowResetModal(false)}
    onSuccess={() => {
      setShowResetModal(false);
      setFormData({ email: '', password: '', name: '', phone: '' });
    }}
  />
)}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: GAMYAM_COLORS.darkBg,
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '450px',
  },
  card: {
    background: GAMYAM_COLORS.darkCard,
    borderRadius: '16px',
    padding: '40px',
    border: `1px solid ${GAMYAM_COLORS.border}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: GAMYAM_COLORS.textLight,
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: GAMYAM_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: '30px',
  },
  toggleContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
  },
  toggleBtn: (active) => ({
    flex: 1,
    padding: '12px',
    background: active ? GAMYAM_COLORS.orange : GAMYAM_COLORS.darkGray,
    color: active ? '#ffffff' : GAMYAM_COLORS.textMuted,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s',
  }),
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  footer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: GAMYAM_COLORS.orange,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  hint: {
    marginTop: '20px',
    padding: '12px',
    background: GAMYAM_COLORS.darkGray,
    borderRadius: '8px',
    fontSize: '12px',
    color: GAMYAM_COLORS.textMuted,
    textAlign: 'center',
  },
  forgotPasswordBtn: {
  width: '100%',
  padding: '10px',
  background: 'transparent',
  color: GAMYAM_COLORS.orange,
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  textDecoration: 'underline',
  marginTop: '10px',
  textAlign: 'right',
},
};

export default LoginPage;