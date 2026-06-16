import React from 'react';
import { 
  Compass, 
  GitBranch, 
  MessageSquare, 
  LayoutDashboard,
  User, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../utils/api';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Navigation({ currentPage, setCurrentPage, user, onLogout }: NavigationProps) {
  // Simplified menu items (5 top-level items)
  const menuItems = [
    { id: 'home', label: '홈', icon: Compass },
    { id: 'analysis', label: '분석', icon: GitBranch },
    { id: 'interview', label: '모의 면접', icon: MessageSquare },
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logoSection} onClick={() => setCurrentPage('home')}>
          <div style={styles.logoIcon}>
            <Sparkles size={15} color="#ffffff" style={{ transform: 'rotate(-10deg)' }} />
          </div>
          <span style={styles.logoText}>AI Career Copilot</span>
        </div>
        
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Match active states including analysis sub-paths
            const isActive = currentPage === item.id || (item.id === 'analysis' && currentPage.startsWith('analysis'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <Icon size={14} style={isActive ? styles.iconActive : styles.icon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.userSection}>
          {user ? (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <button onClick={onLogout} style={styles.logoutBtn} title="로그아웃">
                <LogOut size={14} color="#888888" />
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentPage('login')} style={styles.loginBtn}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eaeaea',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '52px',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    maxWidth: '1160px',
    width: '100%',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoIcon: {
    backgroundColor: '#000000',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#111111',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem', // Added more spacing between menu items
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'none',
    border: 'none',
    padding: '0.375rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.825rem',
    fontWeight: '500',
    color: '#666666',
    transition: 'all 0.12s ease',
    borderBottom: '2px solid transparent', // Underline focus treatment
    borderRadius: '0px',
  },
  navItemActive: {
    color: '#111111',
    fontWeight: '600',
    borderBottom: '2px solid #000000', // Sleek Vercel bottom bar
  },
  icon: {
    color: '#888888',
  },
  iconActive: {
    color: '#111111',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#111111',
    backgroundColor: '#fafafa',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid #eaeaea',
    fontFamily: 'var(--font-mono)',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background 0.12s ease',
    ':hover': {
      backgroundColor: '#fafafa',
    }
  },
  loginBtn: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background 0.12s ease',
  }
};
