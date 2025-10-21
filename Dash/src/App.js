import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import JobAdminPage from './pages/JobAdminPage';
import RecruiterDashboard from './pages/RecruiterDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← ADD THIS LINE

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('📦 LOADED USER FROM STORAGE:', parsedUser);
      setUser(parsedUser);
    }
    setLoading(false); // ← ADD THIS LINE
  }, []);

  const handleLogin = (userData) => {
    console.log('🔐 USER LOGGED IN:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // ← ADD THIS LOADING CHECK
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#0f0f10',
        color: '#ffffff',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : user.role === 'hr' ? (
        <JobAdminPage user={user} onLogout={handleLogout} />
      ) : (
        <RecruiterDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;