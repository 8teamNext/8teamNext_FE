import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  History, 
  Trash2, 
  Save, 
  Github, 
  FileText,
  AlertCircle
} from 'lucide-react';
import Card from '../components/Card';
import { api, UserProfile, AnalysisHistoryItem } from '../utils/api';

interface MyPageProps {
  user: UserProfile | null;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
}

export default function MyPage({ user, onProfileUpdate }: MyPageProps) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, history
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [githubUsername, setGithubUsername] = useState(user?.github_username || '');
  const [resumeText, setResumeText] = useState(user?.default_resume || '');
  const [coverLetter, setCoverLetter] = useState(user?.default_cover_letter || '');
  
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch initial profile & history on mount
  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile();
        setName(profileData.name);
        setEmail(profileData.email);
        setGithubUsername(profileData.github_username);
        setResumeText(profileData.default_resume);
        setCoverLetter(profileData.default_cover_letter);

        const historyData = await api.getHistory();
        setHistory(historyData);
      } catch (err) {
        setError('마이페이지 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const payload = {
      email,
      name,
      github_username: githubUsername,
      default_resume: resumeText,
      default_cover_letter: coverLetter
    };

    try {
      const updated = await api.updateProfile(payload);
      onProfileUpdate(updated);
      setSuccess('프로필 및 기본 문서가 성공적으로 업데이트되었습니다.');
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('프로필을 저장하는 도중 오류가 발생했습니다.');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('이 분석 기록을 삭제하시겠습니까?')) return;
    
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      setError('분석 기록을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const getHistoryBadgeClass = (type: string) => {
    switch (type) {
      case 'github': return 'badge badge-success';
      case 'gap': return 'badge badge-warning';
      case 'resume-github': return 'badge badge-info';
      case 'interview': return 'badge badge-info';
      default: return 'badge badge-info';
    }
  };

  const getHistoryBadgeText = (type: string) => {
    switch (type) {
      case 'github': return 'GitHub 분석';
      case 'gap': return 'Gap 분석';
      case 'resume-github': return '이력서-GitHub 검증';
      case 'interview': return 'AI 면접 질문';
      case 'cover-letter': return '자소서 비교';
      default: return '진단 분석';
    }
  };

  return (
    <div style={styles.container}>
      <div className="header-section">
        <h1>마이페이지</h1>
        <p>기본 인적 사항 및 이력서/자기소개서 파일을 관리하고 이전의 AI 분석 기록을 확인합니다.</p>
      </div>

      {/* Profile / History Tab buttons */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'profile' ? styles.tabBtnActive : {})
          }}
        >
          <Settings size={15} />
          <span>내 정보 & 기본 문서 관리</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'history' ? styles.tabBtnActive : {})
          }}
        >
          <History size={15} />
          <span>과거 분석 기록 ({history.length}건)</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successContainer}>
          <span>{success}</span>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} style={styles.form}>
          <div className="grid grid-2">
            {/* Account Settings */}
            <div style={styles.card}>
              <h3 style={styles.cardHeaderTitle}>인적 사항 및 깃허브 설정</h3>
              <p style={styles.cardHeaderDesc}>기본 분석 요청에 사용될 계정 정보입니다.</p>

              <div className="form-group">
                <label className="form-label">이름</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">이메일 주소</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  style={{ backgroundColor: '#fafafa', color: '#888888', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">기본 GitHub 계정명</label>
                <div style={styles.githubBox}>
                  <Github size={15} color="#888888" style={{ marginRight: '0.375rem' }} />
                  <span style={{ fontSize: '0.8rem', color: '#888888', fontFamily: 'var(--font-mono)' }}>github.com/</span>
                  <input
                    type="text"
                    className="form-input"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    style={{ border: 'none', padding: '0.25rem 0.5rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
            </div>

            {/* Resume & CV Storage */}
            <div style={styles.card}>
              <h3 style={styles.cardHeaderTitle}>기본 이력서 및 자기소개서</h3>
              <p style={styles.cardHeaderDesc}>분석 실행 시 파일이 제공되지 않을 때 자동 대입될 기본 문서 내용입니다.</p>

              <div className="form-group">
                <label className="form-label">기본 이력서 텍스트</label>
                <textarea
                  className="form-textarea"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  style={{ minHeight: '110px', fontSize: '0.825rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">기본 자기소개서 텍스트</label>
                <textarea
                  className="form-textarea"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ minHeight: '110px', fontSize: '0.825rem' }}
                />
              </div>
            </div>
          </div>

          <div style={styles.saveWrapper}>
            <button type="submit" className="btn btn-primary" style={styles.saveBtn}>
              <Save size={15} /> 변경 내용 저장하기
            </button>
          </div>
        </form>
      ) : (
        /* History Log Table */
        <div style={styles.historySection}>
          {history.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>진단 유형</th>
                    <th>분석 일자</th>
                    <th>요약 정보</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={getHistoryBadgeClass(item.type)}>
                          {getHistoryBadgeText(item.type)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'var(--font-mono)' }}>{item.date}</td>
                      <td style={{ color: '#333333', fontWeight: '500' }}>{item.summary}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          style={styles.deleteBtn}
                          title="기록 삭제"
                        >
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.noHistory}>
              <AlertCircle size={28} color="#888888" />
              <h4>저장된 분석 기록이 없습니다.</h4>
              <p>GitHub 분석이나 Gap 분석을 진행하여 레포트를 생성해보세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '3rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'none',
    border: 'none',
    padding: '0.5rem 0.875rem',
    fontSize: '0.825rem',
    fontWeight: '500',
    color: '#666666',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.12s ease',
  },
  tabBtnActive: {
    backgroundColor: '#f5f5f5',
    color: '#111111',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
  },
  cardHeaderTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 0.125rem 0',
  },
  cardHeaderDesc: {
    fontSize: '0.75rem',
    color: '#666666',
    marginBottom: '1.25rem',
  },
  githubBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #eaeaea',
    borderRadius: '6px',
    padding: '0.15rem 0.5rem',
    backgroundColor: '#ffffff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  saveWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    padding: '0.5rem 1.25rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: '#fef2f2',
    }
  },
  noHistory: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #eaeaea',
    textAlign: 'center',
    gap: '0.375rem',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.825rem',
  },
  successContainer: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.825rem',
    fontWeight: '600',
  }
};
