import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Analysis from './pages/Analysis';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import { UserProfile } from './utils/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>({
    name: '김코딩',
    email: 'user@example.com',
    github_username: 'kimcoding-dev',
    default_resume: '',
    default_cover_letter: ''
  });

  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedProfile
      };
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} user={user} />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
      case 'analysis':
        return <Analysis />;
      case 'interview':
        return <MockInterview />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'mypage':
        return <MyPage user={user} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <Home setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  return (
    <div className="app-container">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <p style={styles.footerText}>
            © 2026 AI Career Copilot. All rights reserved.
          </p>
          <div style={styles.footerLinks}>
            <a href="#privacy" style={styles.link}>개인정보처리방침</a>
            <a href="#terms" style={styles.link}>이용약관</a>
            <a href="#support" style={styles.link}>고객지원</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eaeaea',
    padding: '1.25rem 0',
    marginTop: 'auto',
  },
  footerContainer: {
    maxWidth: '1160px',
    width: '100%',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerText: {
    fontSize: '0.8rem',
    color: '#888888',
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    gap: '1.25rem',
  },
  link: {
    fontSize: '0.8rem',
    color: '#888888',
    transition: 'color 0.12s ease',
    ':hover': {
      color: '#111111',
    }
  }
};
