import React, { useState } from 'react';
import { 
  Sparkles, 
  Github, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  FileCheck, 
  Activity, 
  Code2,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import Card from '../components/Card';
import FileUpload from '../components/FileUpload';
import { api, UnifiedAnalysisResponse } from '../utils/api';

export default function Analysis() {
  // Input states
  const [githubUrl, setGithubUrl] = useState('https://github.com/kimcoding-dev/book-rental-service');
  const [resumeText, setResumeText] = useState('');
  const [jobUrls, setJobUrls] = useState<string[]>(['https://toss.im/career/job-detail/backend-developer']);
  
  // Loading and result states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<UnifiedAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (text: string, fileName: string) => {
    setResumeText(text);
  };

  const handleAddJobUrl = () => {
    if (jobUrls.length < 5) {
      setJobUrls([...jobUrls, '']);
    }
  };

  const handleRemoveJobUrl = (index: number) => {
    if (jobUrls.length > 1) {
      setJobUrls(jobUrls.filter((_, idx) => idx !== index));
    }
  };

  const handleUpdateJobUrl = (index: number, value: string) => {
    const updated = [...jobUrls];
    updated[index] = value;
    setJobUrls(updated);
  };

  const handleStartAnalysis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setError('GitHub URL을 입력해주세요.');
      return;
    }
    if (!resumeText.trim()) {
      setError('이력서 텍스트를 입력하거나 이력서 파일을 업로드해 주세요.');
      return;
    }

    const filteredJobs = jobUrls.filter(url => url.trim() !== '');
    if (filteredJobs.length === 0) {
      setError('최소 하나의 채용공고 URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate loading steps to improve perceived AI quality (SaaS trick)
    setLoadingStep(1);
    const stepIntervals = [
      setTimeout(() => setLoadingStep(2), 1200),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3600),
    ];

    try {
      const data = await api.analyzeUnified(githubUrl, resumeText, filteredJobs);
      // Wait slightly so user sees the final step of analyzing
      await new Promise(resolve => setTimeout(resolve, 4000));
      setResult(data);
    } catch (err) {
      setError(err.message || '종합 커리어 분석 중 오류가 발생했습니다.');
    } finally {
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // 1. Loading Phase View
  if (loading) {
    const steps = [
      'GitHub 레포지토리 정보 및 소스코드 품질 스캔 중...',
      '이력서 기재 기술과 깃허브 코드 구현 상호 대조 중...',
      '채용 요구사항 기반 핵심 역량 Gap 분석 중...',
      '부족 스택 극복을 위한 맞춤형 프로젝트 설계 및 로드맵 도출 중...'
    ];

    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinnerWrapper}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <Sparkles size={18} style={styles.sparkleIcon} />
        </div>
        <h2 style={styles.loadingTitle}>AI 커리어 코파일럿 진단 중</h2>
        <p style={styles.loadingSub}>
          사용자의 코드 데이터와 이력서를 정밀 분석하여 맞춤형 커리어 레포트를 생성하고 있습니다.
        </p>

        <div style={styles.stepsBox}>
          {steps.map((step, idx) => {
            const isCompleted = loadingStep > idx + 1;
            const isCurrent = loadingStep === idx + 1;
            return (
              <div 
                key={idx} 
                style={{
                  ...styles.stepRow,
                  opacity: isCompleted || isCurrent ? 1 : 0.4
                }}
              >
                <div style={{
                  ...styles.stepIndicator,
                  backgroundColor: isCompleted ? '#10b981' : isCurrent ? '#0070f3' : '#eaeaea',
                  color: isCompleted || isCurrent ? '#ffffff' : '#888888'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{
                  ...styles.stepText,
                  fontWeight: isCurrent ? '600' : '400',
                  color: isCurrent ? '#111111' : '#666666'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Report Phase View
  if (result) {
    const { 
      overall_score, 
      portfolio_rating, 
      github_analysis, 
      resume_analysis, 
      skill_gap, 
      recommended_projects 
    } = result;

    return (
      <div style={styles.reportContainer}>
        {/* Header navigation bar */}
        <div style={styles.reportHeader}>
          <button onClick={() => setResult(null)} style={styles.backBtn} className="btn btn-secondary">
            <ArrowLeft size={14} /> 진단 다시하기
          </button>
          
          <div style={styles.reportMeta}>
            <div>
              <span style={styles.metaBadge}>AI 종합 분석 레포트</span>
              <h1 style={styles.reportTitle}>AI Career Report</h1>
              <p style={styles.reportDesc}>GitHub 소스코드 및 이력서 기반 종합 커리어 역량 평가 보고서입니다.</p>
            </div>
            
            <div style={styles.scoreBoard}>
              <div style={styles.scoreCard}>
                <div style={styles.scoreRingWrapper}>
                  <svg width="68" height="68" viewBox="0 0 36 36">
                    <path
                      style={styles.ringBg}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      style={{
                        ...styles.ringFilled,
                        strokeDasharray: `${overall_score}, 100`
                      }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span style={styles.scoreText}>{overall_score}점</span>
                </div>
                <div style={styles.scoreInfo}>
                  <div style={styles.scoreLabel}>종합 스택 역량</div>
                  <div style={styles.scoreGrade}>{portfolio_rating}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div style={styles.reportGrid}>
          
          {/* Section 1 & 2: GitHub & Resume Verification */}
          <div style={styles.mainCol}>
            
            {/* GitHub Analysis */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleIcon}>
                  <Github size={18} />
                  <h2>GitHub 포트폴리오 분석 결과</h2>
                </div>
                <span className="badge badge-info">{github_analysis.repo_count}개 레포지토리 스캔</span>
              </div>
              
              <div style={styles.metricsRow}>
                <div style={styles.metricBox}>
                  <span style={styles.metricLabel}>README 상태</span>
                  <span style={styles.metricVal}>{github_analysis.readme_quality}</span>
                </div>
                <div style={styles.metricBox}>
                  <span style={styles.metricLabel}>프로젝트 완성도</span>
                  <span style={styles.metricVal}>{github_analysis.project_completeness}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span style={styles.subTitle}>감지된 주요 기술 스택</span>
                <div style={styles.badgeList}>
                  {github_analysis.tech_stack.map(tech => (
                    <span key={tech} className="badge badge-info">{tech}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <span style={styles.subTitle}>레포지토리별 세부 정보</span>
                <div style={styles.repoList}>
                  {github_analysis.repo_details.map(repo => (
                    <div key={repo.url} style={styles.repoItem}>
                      <div style={styles.repoMeta}>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" style={styles.repoName}>
                          {repo.name} <ExternalLink size={12} />
                        </a>
                        <span className="badge badge-success">{repo.quality_score}점</span>
                      </div>
                      <p style={styles.repoDescription}>{repo.description}</p>
                      <div style={styles.repoFooter}>
                        <span>주요 언어: <strong>{repo.primary_language}</strong></span>
                        <span style={styles.dividerDot}>•</span>
                        <span>리드미: <strong style={{ color: repo.readme_status.includes('보통') || repo.readme_status.includes('Needs') ? '#b45309' : '#047857' }}>{repo.readme_status}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {github_analysis.readme_suggestions && github_analysis.readme_suggestions.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eaeaea' }}>
                  <span style={styles.subTitle}>깃허브 README 개선 제안</span>
                  <ul style={styles.readmeSuggestionList}>
                    {github_analysis.readme_suggestions.map((suggestion, idx) => (
                      <li key={idx} style={styles.readmeSuggestionItem}>
                        <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Resume Analysis */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleIcon}>
                  <FileCheck size={18} />
                  <h2>이력서 검증 및 적합성</h2>
                </div>
                <span className="badge badge-success">일치율 {resume_analysis.tech_stack_matching}%</span>
              </div>

              <div style={styles.resumeBanner}>
                <div style={styles.bannerEmoji}>📄</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700' }}>이력서 품질 코멘트</h4>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#555555' }}>{resume_analysis.resume_quality}</p>
                </div>
              </div>

              <div style={styles.verificationSplit}>
                <div style={styles.verifyBox}>
                  <span style={{ ...styles.verifyLabel, color: '#10b981' }}>✓ 교차 검증 성공 (Verified)</span>
                  <p style={styles.verifySub}>이력서와 깃허브 코드 이력에서 교차 확인된 스택</p>
                  <div style={styles.badgeList}>
                    {resume_analysis.verified_skills.map(skill => (
                      <span key={skill} className="badge badge-success">{skill}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.verifyBox}>
                  <span style={{ ...styles.verifyLabel, color: '#f59e0b' }}>✗ 소스코드 증명 필요 (Unverified)</span>
                  <p style={styles.verifySub}>이력서에는 적혀있으나 깃허브 코드 확인이 어려운 스택</p>
                  <div style={styles.badgeList}>
                    {resume_analysis.unverified_skills.length > 0 ? (
                      resume_analysis.unverified_skills.map(skill => (
                        <span key={skill} className="badge badge-warning">{skill}</span>
                      ))
                    ) : (
                      <span style={styles.noneLabel}>모든 스택이 증명되었습니다.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Col: Skill Gap, Roadmap, Recommended Projects */}
          <div style={styles.sideCol}>
            
            {/* Skill Gap & Roadmap */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={styles.cardTitleIcon}>
                <Activity size={18} />
                <h2>역량 Gap & 보완 로드맵</h2>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#666666', marginBottom: '1rem' }}>
                채용 시장 요건 대비 현재 부족한 기술 목록과 우선 보완 순위 가이드라인입니다.
              </p>

              <div style={styles.gapBox}>
                <span style={styles.subTitle}>미보유 보완 기술 스택</span>
                <div style={styles.badgeList}>
                  {skill_gap.missing_technologies.map(tech => (
                    <span key={tech} className="badge badge-danger">{tech}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <span style={styles.subTitle}>AI 성장 추천 로드맵</span>
                <div style={styles.roadmapList}>
                  {skill_gap.learning_roadmap.map((step, idx) => (
                    <div key={idx} style={styles.roadmapItem}>
                      <div style={styles.roadmapCircle}>{idx + 1}</div>
                      <span style={styles.roadmapText}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Projects */}
            <div className="card">
              <div style={styles.cardTitleIcon}>
                <Sparkles size={18} />
                <h2>커리어 보완 추천 프로젝트</h2>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#666666', marginBottom: '1.25rem' }}>
                부족 스택을 이력서에 증빙할 수 있도록 설계된 맞춤 프로젝트 추천입니다.
              </p>

              <div style={styles.projectList}>
                {recommended_projects.map((proj, idx) => (
                  <div key={idx} style={styles.projectCard}>
                    <div style={styles.projectHead}>
                      <h4 style={styles.projectTitle}>{proj.title}</h4>
                      <span className={`badge ${proj.difficulty.includes('Hard') || proj.difficulty.includes('상') ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {proj.difficulty}
                      </span>
                    </div>
                    <p style={styles.projectDesc}>{proj.description}</p>
                    
                    <div style={styles.projTags}>
                      <div style={styles.projTagItem}>
                        <strong>기술:</strong> {proj.technologies.join(', ')}
                      </div>
                      <div style={styles.projTagItem}>
                        <strong>보완:</strong> {proj.missing_skills_covered.join(', ')}
                      </div>
                    </div>

                    <div style={styles.archSection}>
                      <div style={styles.archTitle}>
                        <BookOpen size={12} />
                        <span>구현 및 아키텍처 가이드</span>
                      </div>
                      <p style={styles.archContent}>{proj.architecture}</p>
                    </div>

                    <div style={styles.impactBox}>
                      <TrendingUp size={12} color="#10b981" />
                      <span>{proj.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
        </div>
      </div>
    );
  }

  // 3. Entry Form Phase View
  return (
    <div style={styles.container}>
      <div className="header-section">
        <h1 style={styles.title}>Unified AI Career Report</h1>
        <p style={styles.sub}>
          GitHub Repository 소스코드와 이력서를 한 번에 입력하여 종합적인 기술 역량 분석, 이력서 검증 및 개인 맞춤형 성장 로드맵을 설계받습니다.
        </p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartAnalysis} style={styles.formCard}>
        <div style={styles.formGrid}>
          
          {/* Left section: GitHub & Role */}
          <div style={styles.formSection}>
            <div style={styles.sectionHeading}>
              <Github size={18} />
              <h3>1. GitHub 포트폴리오 연동</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">메인 GitHub Repository URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username/project-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
              <span style={styles.fieldHelp}>
                검증하고자 하는 메인 프로젝트가 포함된 공개 저장소 주소를 정확히 입력해주세요.
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <div style={styles.sectionHeading}>
                <Code2 size={18} />
                <h3>2. 채용공고 URL 연동 (최대 5개)</h3>
              </div>
              
              <div style={styles.jobUrlsList}>
                {jobUrls.map((url, index) => (
                  <div key={index} style={styles.jobUrlRow}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://toss.im/career/job-detail/backend-developer"
                      value={url}
                      onChange={(e) => handleUpdateJobUrl(index, e.target.value)}
                      required
                    />
                    {jobUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJobUrl(index)}
                        style={styles.removeBtn}
                        title="제거"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {jobUrls.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddJobUrl}
                  style={styles.addBtn}
                  className="btn btn-secondary"
                >
                  <Plus size={13} /> 채용공고 추가하기
                </button>
              )}
              
              <span style={styles.fieldHelp}>
                입력하신 각 채용공고의 자격 요건 및 우대 기술 스택을 상세 대조하여 직무 적합도와 기술 갭을 평가합니다.
              </span>
            </div>
          </div>

          {/* Right section: Resume File Uploader */}
          <div style={styles.formSection}>
            <div style={styles.sectionHeading}>
              <FileText size={18} />
              <h3>3. 이력서(Resume) 업로드</h3>
            </div>
            
            <FileUpload
              accept=".txt,.md,.pdf"
              onTextLoaded={handleFileUpload}
              placeholderText="이력서 파일 등록 (PDF/TXT)"
            />

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">이력서 텍스트 직접 입력 / 편집</label>
              <textarea
                className="form-textarea"
                placeholder="이력서 파일 업로드 시 텍스트가 자동으로 채워집니다. 직접 작성하시거나 수정하셔도 좋습니다..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={styles.resumeTextArea}
                required
              />
            </div>
          </div>

        </div>

        <div style={styles.submitWrapper}>
          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            <Sparkles size={15} /> AI 커리어 분석 시작하기
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    marginBottom: '0.5rem',
  },
  sub: {
    fontSize: '0.95rem',
    color: '#666666',
    lineHeight: 1.5,
  },
  errorBanner: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#991b1b',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  formCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2.5rem',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #fafafa',
    paddingBottom: '0.5rem',
    color: '#111111',
    fontWeight: '700',
    fontSize: '1rem',
  },
  fieldHelp: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888888',
    marginTop: '0.25rem',
  },
  resumeTextArea: {
    minHeight: '180px',
    fontSize: '0.85rem',
    lineHeight: 1.4,
  },
  submitWrapper: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'center',
  },
  submitBtn: {
    padding: '0.75rem 2rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '320px',
  },

  // Loading styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 1.5rem',
    textAlign: 'center',
    maxWidth: '520px',
    margin: '0 auto',
  },
  spinnerWrapper: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  sparkleIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#0070f3',
  },
  loadingTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  loadingSub: {
    fontSize: '0.875rem',
    color: '#666666',
    marginBottom: '2rem',
  },
  stepsBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    padding: '1.25rem',
    textAlign: 'left',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.875rem',
    transition: 'opacity 0.2s ease',
  },
  stepIndicator: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  stepText: {
    fontSize: '0.8rem',
  },

  // Report styles
  reportContainer: {
    maxWidth: '1160px',
    margin: '0 auto',
  },
  reportHeader: {
    marginBottom: '2rem',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '1.5rem',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    gap: '0.375rem',
  },
  reportMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '1rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  metaBadge: {
    display: 'inline-block',
    backgroundColor: '#e6f1ff',
    color: '#0070f3',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.725rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  reportTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  reportDesc: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#666666',
  },
  scoreBoard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    padding: '0.75rem 1.25rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  scoreRingWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    fill: 'none',
    stroke: '#eaeaea',
    strokeWidth: 2.8,
  },
  ringFilled: {
    fill: 'none',
    stroke: '#000000',
    strokeWidth: 2.8,
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 0.3s ease',
  },
  scoreText: {
    position: 'absolute',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#111111',
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  scoreLabel: {
    fontSize: '0.7rem',
    color: '#888888',
    textTransform: 'uppercase',
  },
  scoreGrade: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#111111',
    lineHeight: 1.1,
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '0.875rem',
    marginBottom: '1rem',
  },
  cardTitleIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#111111',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  metricBox: {
    backgroundColor: '#fafafa',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: '0.725rem',
    color: '#888888',
    marginBottom: '0.25rem',
  },
  metricVal: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#111111',
  },
  subTitle: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#111111',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  badgeList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  repoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  repoItem: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '0.875rem',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.12s ease',
    ':hover': {
      borderColor: '#d3d3d3',
    }
  },
  repoMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.375rem',
  },
  repoName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#111111',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  repoDescription: {
    fontSize: '0.75rem',
    color: '#666666',
    margin: '0 0 0.5rem 0',
    lineHeight: 1.4,
  },
  repoFooter: {
    fontSize: '0.7rem',
    color: '#888888',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dividerDot: {
    color: '#eaeaea',
  },
  resumeBanner: {
    backgroundColor: '#fafafa',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  bannerEmoji: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  verificationSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  verifyBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  verifyLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  verifySub: {
    fontSize: '0.7rem',
    color: '#888888',
    margin: '0 0 0.5rem 0',
    lineHeight: 1.3,
  },
  noneLabel: {
    fontSize: '0.75rem',
    color: '#888888',
    fontStyle: 'italic',
  },

  // Sidebar / Gap & Roadmap styles
  gapBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '0.875rem',
  },
  roadmapList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  roadmapItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  roadmapCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#111111',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '2px',
  },
  roadmapText: {
    fontSize: '0.775rem',
    color: '#555555',
    lineHeight: 1.4,
  },

  // Project cards
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  projectCard: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fafafa',
  },
  projectHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.375rem',
  },
  projectTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#111111',
    margin: 0,
  },
  projectDesc: {
    fontSize: '0.775rem',
    color: '#666666',
    lineHeight: 1.4,
    margin: '0 0 0.75rem 0',
  },
  projTags: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    fontSize: '0.725rem',
    color: '#555555',
    marginBottom: '0.75rem',
  },
  projTagItem: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '4px',
    padding: '0.15rem 0.4rem',
  },
  archSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.75rem',
  },
  archTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.725rem',
    fontWeight: '700',
    color: '#111111',
    marginBottom: '0.25rem',
  },
  archContent: {
    fontSize: '0.7rem',
    color: '#666666',
    lineHeight: 1.4,
    margin: 0,
  },
  impactBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.7rem',
    color: '#047857',
    fontWeight: '600',
  },
  readmeSuggestionList: {
    listStyleType: 'none',
    padding: 0,
    margin: '0.5rem 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  readmeSuggestionItem: {
    fontSize: '0.775rem',
    color: '#555555',
    lineHeight: 1.4,
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  jobUrlsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  jobUrlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.12s ease',
    ':hover': {
      backgroundColor: '#fef2f2',
    }
  },
  addBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.25rem',
    marginBottom: '0.5rem',
  }
};

// Add media queries for responsive layouts
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @media (max-width: 768px) {
      div[style*="reportGrid"] {
        grid-template-columns: 1fr !important;
      }
      div[style*="formGrid"] {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
