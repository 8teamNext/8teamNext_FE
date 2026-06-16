import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  History,
  Trash2,
  AlertCircle,
  Code2
} from 'lucide-react';
import Card from '../components/Card';
import { api, UserProfile, AnalysisHistoryItem } from '../utils/api';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile();
        setProfile(profileData);
        
        const historyData = await api.getHistory();
        setHistory(historyData);
      } catch (err) {
        setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('이 분석 기록을 삭제하시겠습니까?')) return;
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      setError('기록 삭제 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3>대시보드 로딩 중...</h3>
      </div>
    );
  }

  // Mock list of target companies for Stripe progress bar display
  const targetCompanies = [
    { name: 'Toss', role: 'Backend Developer', fit: 82, status: 'High' },
    { name: 'Naver', role: 'Spring Engineer', fit: 74, status: 'Medium' },
    { name: 'Kakao', role: 'Server Developer', fit: 65, status: 'Medium' }
  ];

  const mockVerifiedSkills = ['Java', 'Spring Boot', 'MySQL', 'Git', 'TypeScript', 'React.js'];

  return (
    <div style={styles.container}>
      <div className="header-section">
        <h1>커리어 분석 대시보드 (Dashboard)</h1>
        <p>나의 핵심 기술 입증 현황과 채용 적합도 데이터를 한눈에 파악합니다.</p>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={16} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Stripe-style Core Metrics row */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <Card title="포트폴리오 평가 등급" icon={Sparkles}>
          <div style={styles.metricWrapper}>
            <span style={styles.metricVal}>A+</span>
            <span style={styles.metricSub}>상위 8% 수준 저장소 품질</span>
          </div>
        </Card>
        
        <Card title="검증 완료 기술" icon={ShieldCheck}>
          <div style={styles.metricWrapper}>
            <span style={styles.metricVal}>{mockVerifiedSkills.length}개 스택</span>
            <span style={styles.metricSub}>이력서 내용 중 코드 입증 완료</span>
          </div>
        </Card>

        <Card title="평균 기업 적합도" icon={TrendingUp}>
          <div style={styles.metricWrapper}>
            <span style={{ ...styles.metricVal, color: '#0070f3' }}>73.6%</span>
            <span style={styles.metricSub}>3개 목표 기업 평균 점수</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Verified tech list */}
        <Card title="입증된 기술 현황 (Verified Skills)" icon={Code2}>
          <p style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '1rem' }}>
            나의 GitHub 프로젝트 소스코드에서 정상적으로 구조 및 작동이 식별되어 기재 신뢰도가 입증된 기술입니다.
          </p>
          <div style={styles.badgeGrid}>
            {mockVerifiedSkills.map(s => (
              <span key={s} className="badge badge-success" style={styles.skillBadge}>{s}</span>
            ))}
          </div>
        </Card>

        {/* Target Job fit progresses */}
        <Card title="목표 기업 적합도 트래킹" icon={TrendingUp}>
          <div style={styles.companyList}>
            {targetCompanies.map(c => (
              <div key={c.name} style={styles.companyItem}>
                <div style={styles.companyMeta}>
                  <div>
                    <span style={styles.companyName}>{c.name}</span>
                    <span style={styles.companyRole}> - {c.role}</span>
                  </div>
                  <span style={{ ...styles.fitScore, color: c.fit >= 80 ? '#047857' : '#b45309' }}>
                    {c.fit}%
                  </span>
                </div>
                
                {/* Stripe style progress bar */}
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${c.fit}%`,
                    backgroundColor: c.fit >= 80 ? '#10b981' : '#f59e0b'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* History table */}
      <div>
        <div style={styles.sectionHeader}>
          <History size={16} color="#111111" />
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>최근 분석 기록 내역</h2>
        </div>
        
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
                {history.slice(0, 5).map((item) => (
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
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noHistory}>
            <p>최근 분석된 기록이 없습니다. 먼저 진단을 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '3rem',
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
  metricWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    padding: '0.5rem 0',
  },
  metricVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#111111',
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
  },
  metricSub: {
    fontSize: '0.75rem',
    color: '#666666',
    marginTop: '0.25rem',
  },
  badgeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.625rem',
  },
  companyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  companyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  companyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#111111',
  },
  companyRole: {
    fontSize: '0.8rem',
    color: '#666666',
  },
  fitScore: {
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#eaeaea',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: '0.75rem',
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
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    color: '#888888',
    fontSize: '0.825rem',
  }
};
