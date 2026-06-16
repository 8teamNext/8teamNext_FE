import React, { useState } from 'react';
import { 
  Github, 
  GitBranch, 
  FileCheck, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import Card from '../components/Card';
import { UserProfile } from '../utils/api';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  user: UserProfile | null;
}

export default function Home({ setCurrentPage, user }: HomeProps) {
  const [queryInput, setQueryInput] = useState('');

  const handleQuerySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (queryInput.trim()) {
      // Directs to the Analysis Hub
      setCurrentPage('analysis');
    }
  };

  const handleSuggestionClick = (pageId: string) => {
    setCurrentPage(pageId);
  };

  const features = [
    {
      id: 'analysis',
      title: '종합 AI 커리어 리포트',
      desc: 'GitHub 소스코드 분석, 이력서 상호 검증, 목표 직무와의 기술 Gap 분석 및 보완 프로젝트 추천을 단 한 번의 클릭으로 모두 확인합니다.',
      icon: Sparkles,
      badge: '통합 역량 평가'
    },
    {
      id: 'interview',
      title: 'AI 모의 면접 대비',
      desc: '자기소개서나 이력서에 작성된 프로젝트 경험과 기술 키워드를 추출하여 면접관의 의도를 담은 예상 질문과 모범 팁을 제공합니다.',
      icon: MessageSquare,
      badge: '실전 모의대비'
    },
    {
      id: 'dashboard',
      title: '커리어 대시보드',
      desc: '지금까지 진단받은 종합 분석 및 이력 상세 로그를 관리하고, 나의 취업 스택 성장 추이를 한눈에 모니터링합니다.',
      icon: GitBranch,
      badge: '스택 로그 관리'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Perplexity-inspired Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroTag}>
            <Sparkles size={12} color="#111111" style={{ marginRight: '4px' }} />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 style={styles.heroTitle}>
            개발자 취업 합격 확률을 높이는<br />
            당신만을 위한 <span style={styles.highlight}>AI 커리어 코파일럿</span>
          </h1>
          <p style={styles.heroSub}>
            이력서 검증, 포트폴리오 분석, 역량 Gap 보완 프로젝트 추천까지.<br />
            취업 성공률을 높일 구체적인 기술 스택 보완 액션 플랜을 제공합니다.
          </p>

          {/* Perplexity style search prompt bar */}
          <form onSubmit={handleQuerySubmit} style={styles.searchBarContainer}>
            <div style={styles.searchIconBox}>
              <Search size={16} color="#888888" />
            </div>
            <input
              type="text"
              placeholder="무엇이든 물어보세요 (예: 내 깃허브 저장소를 분석해서 우대기술 스택과 비교해줘)"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchSubmitBtn}>
              <Sparkles size={14} color="#ffffff" style={{ marginRight: '4px' }} />
              <span>진단 시작</span>
            </button>
          </form>

          {/* Quick Suggestions tags */}
          <div style={styles.suggestionsWrapper}>
            <span style={styles.suggestLabel}>추천 진단 바로가기:</span>
            <button onClick={() => handleSuggestionClick('analysis')} style={styles.suggestTag}>
              📊 종합 AI 커리어 리포트 시작
            </button>
            <button onClick={() => handleSuggestionClick('interview')} style={styles.suggestTag}>
              💬 AI 모의 면접
            </button>
            <button onClick={() => handleSuggestionClick('dashboard')} style={styles.suggestTag}>
              📈 대시보드 로그 확인
            </button>
          </div>
        </div>
      </section>

      {/* Quick Launch Services Grid */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2>핵심 진단 도구</h2>
          <p>분석받고자 하는 진단을 선택해 취업 경쟁력을 높여보세요.</p>
        </div>
        
        <div className="grid grid-3" style={styles.featuresGrid}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} style={styles.featureCardWrapper} onClick={() => setCurrentPage(feat.id)}>
                <Card 
                  title={feat.title} 
                  icon={Icon} 
                  badgeText={feat.badge}
                  badgeType="info"
                  style={styles.featureCard}
                >
                  <p style={styles.featureDesc}>{feat.desc}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.footerLink}>시작하기</span>
                    <ArrowRight size={12} className="arrow-icon" style={styles.arrowIcon} />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step Guide Section */}
      <section style={styles.guideSection}>
        <h2 style={styles.guideTitle}>효율적인 취업 준비 플로우</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>
            <h4>GitHub & 채용공고 분석</h4>
            <p>분석할 깃허브 저장소와 가고 싶은 기업의 채용 정보 링크를 넣습니다.</p>
          </div>
          <div style={styles.stepLine} />
          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>
            <h4>기술 Gap & 이력서 검증</h4>
            <p>이력서 내용과 실제 깃허브 코드 내역을 대조하여 부족 스택과 보완점을 진단합니다.</p>
          </div>
          <div style={styles.stepLine} />
          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>
            <h4>맞춤형 프로젝트 보완</h4>
            <p>도출된 부족 스택(예: Docker, AWS)을 확보할 수 있는 구체적 빌드업 프로젝트를 진행합니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3.5rem',
    paddingBottom: '3rem',
  },
  hero: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #eaeaea',
    padding: '5rem 2.5rem',
    textAlign: 'center',
    backgroundImage: 'radial-gradient(at top, #fafafa 0%, #ffffff 80%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '840px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    color: '#111111',
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    border: '1px solid #eaeaea',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#111111',
    lineHeight: '1.25',
    marginBottom: '1rem',
    letterSpacing: '-0.03em',
  },
  highlight: {
    color: '#0070f3',
  },
  heroSub: {
    fontSize: '0.95rem',
    color: '#666666',
    lineHeight: '1.6',
    marginBottom: '2.5rem',
    maxWidth: '620px',
  },
  searchBarContainer: {
    width: '100%',
    maxWidth: '680px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    padding: '0.375rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    position: 'relative',
    transition: 'border-color 0.15s ease',
    marginBottom: '1.25rem',
    ':focus-within': {
      borderColor: '#000000',
    }
  },
  searchIconBox: {
    paddingLeft: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#111111',
    padding: '0.5rem 0.75rem',
  },
  searchSubmitBtn: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.12s ease',
    ':hover': {
      backgroundColor: '#333333',
    }
  },
  suggestionsWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  suggestLabel: {
    fontSize: '0.75rem',
    color: '#888888',
    marginRight: '0.25rem',
    fontWeight: '500',
  },
  suggestTag: {
    background: '#ffffff',
    border: '1px solid #eaeaea',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#666666',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    ':hover': {
      backgroundColor: '#fafafa',
      borderColor: '#d3d3d3',
      color: '#111111',
    }
  },
  featuresSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeader: {
    textAlign: 'center',
  },
  featuresGrid: {
    rowGap: '1.25rem',
  },
  featureCardWrapper: {
    cursor: 'pointer',
  },
  featureCard: {
    transition: 'all 0.15s ease',
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: '#666666',
    lineHeight: '1.5',
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.25rem',
    marginTop: '1rem',
    paddingTop: '0.625rem',
    borderTop: '1px solid #fafafa',
  },
  footerLink: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#0070f3',
  },
  arrowIcon: {
    color: '#0070f3',
  },
  guideSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    border: '1px solid #eaeaea',
  },
  guideTitle: {
    marginBottom: '2rem',
    fontSize: '1.35rem',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '960px',
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  step: {
    flex: 1,
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#111111',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
  },
  stepLine: {
    width: '40px',
    height: '1px',
    backgroundColor: '#eaeaea',
    flexShrink: 0,
  }
};
