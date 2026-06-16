import React, { useState } from 'react';
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { UserProfile } from '../utils/api';

interface LoginProps {
  setCurrentPage: (page: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ setCurrentPage, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate API authentication call
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: email,
        name: email.split('@')[0],
        github_username: 'github-user',
        default_resume: '',
        default_cover_letter: ''
      });
      setCurrentPage('home');
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: `${provider.toLowerCase()}_user@example.com`,
        name: provider === 'Google' ? '구글 사용자' : '카카오 사용자',
        github_username: `${provider.toLowerCase()}-dev`,
        default_resume: '',
        default_cover_letter: ''
      });
      setCurrentPage('home');
    }, 600);
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <Card style={styles.loginCard}>
          <div style={styles.cardHeader}>
            <div style={styles.logoIcon}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <h2 style={styles.title}>AI Career Copilot</h2>
            <p style={styles.subtitle}>계정에 로그인하여 상세 분석 보고서를 관리해보세요.</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={15} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} style={styles.form}>
            <div className="form-group">
              <label className="form-label">이메일 주소</label>
              <div style={styles.inputWrapper}>
                <Mail size={15} color="#888888" style={styles.inputIcon} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <div style={styles.inputWrapper}>
                <Lock size={15} color="#888888" style={styles.inputIcon} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </form>

          <div style={styles.dividerContainer}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>또는 소셜 로그인</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.socialGroup}>
            <button
              onClick={() => handleSocialLogin('Kakao')}
              disabled={loading}
              style={{ ...styles.socialBtn, ...styles.kakaoBtn }}
            >
              <span>카카오로 로그인</span>
            </button>
            
            <button
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              style={{ ...styles.socialBtn, ...styles.googleBtn }}
            >
              <span>Google 계정으로 로그인</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 0',
  },
  loginBox: {
    maxWidth: '400px',
    width: '100%',
  },
  loginCard: {
    padding: '2.5rem 2rem',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoIcon: {
    backgroundColor: '#000000',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111111',
    margin: '0 0 0.375rem 0',
  },
  subtitle: {
    fontSize: '0.825rem',
    color: '#666666',
    margin: 0,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
    zIndex: 10,
  },
  submitBtn: {
    width: '100%',
    padding: '0.625rem',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.25rem 0',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#eaeaea',
  },
  dividerText: {
    padding: '0 0.625rem',
    fontSize: '0.725rem',
    color: '#888888',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  socialGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    width: '100%',
  },
  socialBtn: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #eaeaea',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s ease',
  },
  kakaoBtn: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
    color: '#191919',
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    color: '#111111',
  }
};
