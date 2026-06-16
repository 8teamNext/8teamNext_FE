import React, { useState } from 'react';
import { 
  MessageSquare, 
  ChevronRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { api, InterviewGenResponse } from '../utils/api';

export default function MockInterview() {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleFileUpload = (text: string, fileName: string) => {
    setCoverLetter(text);
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setError('자기소개서 텍스트를 입력하거나 파일을 업로드해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.generateInterviewQuestions(coverLetter);
      setResult(data);
    } catch (err) {
      setError(err.message || '인터뷰 질문 생성 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 style={{ marginBottom: '0.5rem' }}>AI 예상 기술 면접 질문 생성 중</h3>
        <p style={{ maxWidth: '480px', fontSize: '0.9rem', color: '#666666' }}>
          자기소개서에 작성된 프로젝트 경험, 트러블슈팅 사례, 사용 기술 명세를 스캔하여 기술면접 단골 주제와 연계한 예상 질문을 추론하고 있습니다.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div style={styles.resultContainer}>
        {/* Result Header */}
        <div className="header-section" style={styles.resultHeader}>
          <div>
            <button onClick={() => setResult(null)} style={styles.backBtn} className="btn btn-secondary">
              <ArrowLeft size={14} /> 다시 생성하기
            </button>
            <h1 style={{ marginTop: '1rem', fontSize: '1.5rem' }}>AI 모의 면접 질문 (Mock Interview)</h1>
            <p>자기소개서 기반으로 도출된 고부가가치 실전 면접 질문집입니다.</p>
          </div>
        </div>

        {/* Questions Grid/Accordion */}
        <div style={styles.questionsList}>
          {result.questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} style={styles.qCard}>
                <div style={styles.qHeader} onClick={() => toggleExpand(q.id)}>
                  <div style={styles.qTitleBox}>
                    <div style={styles.qBadge}>Q{idx + 1}</div>
                    <h3 style={styles.qQuestion}>{q.question}</h3>
                  </div>
                  <button style={styles.toggleBtn}>
                    {isExpanded ? <EyeOff size={14} color="#666666" /> : <Eye size={14} color="#0070f3" />}
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isExpanded ? '#666666' : '#0070f3' }}>
                      {isExpanded ? '답변 가리기' : '답변 팁 보기'}
                    </span>
                  </button>
                </div>

                <div style={styles.intentBox}>
                  <strong style={styles.intentLabel}>출제 의도:</strong>
                  <span style={styles.intentText}>{q.intent}</span>
                </div>

                {isExpanded && (
                  <div style={styles.expandedContent}>
                    <div style={styles.keywordBox}>
                      <span style={styles.metaLabel}>추천 키워드 (답변에 포함 추천)</span>
                      <div style={styles.badgeWrapper}>
                        {q.suggested_keywords.map((kw) => (
                          <span key={kw} className="badge badge-info">{kw}</span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.tipBox}>
                      <div style={styles.tipTitle}>
                        <Sparkles size={12} color="#111111" />
                        <span>합격 답변 구조 설계 팁</span>
                      </div>
                      <p style={styles.tipText}>{q.sample_answer_tip}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="header-section">
        <h1>AI 모의 면접 (Mock Interview)</h1>
        <p>자기소개서를 등록하면 본인의 프로젝트 경험과 기술을 기반으로 맞춤형 기술 면접 질문과 해설 가이드를 생성합니다.</p>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} style={styles.form}>
        <div style={styles.formCard}>
          <h3>자기소개서 입력</h3>
          <p style={styles.inputTip}>진행한 프로젝트나 협업 사례가 작성된 자소서 텍스트를 붙여넣거나 파일(.txt)을 업로드해주세요.</p>

          <FileUpload 
            accept=".txt,.md" 
            onTextLoaded={handleFileUpload} 
            placeholderText="자기소개서 파일 등록하기 (.txt/.md)"
          />

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">자기소개서 텍스트 직접 쓰기</label>
            <textarea
              className="form-textarea"
              placeholder="프로젝트 설계, 구현 및 협업 트러블슈팅 내역이 작성된 자소서를 입력해주세요..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{ minHeight: '180px' }}
            />
          </div>
        </div>

        <div style={styles.submitWrapper}>
          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            예상 기술 면접 질문 생성하기 <ChevronRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '2rem',
  },
  form: {
    marginTop: '1.25rem',
  },
  formCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
  },
  inputTip: {
    fontSize: '0.8rem',
    color: '#666666',
    marginBottom: '1rem',
  },
  submitWrapper: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  submitBtn: {
    padding: '0.625rem 1.75rem',
    fontSize: '0.9rem',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  resultContainer: {
    paddingBottom: '3rem',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    fontSize: '0.8rem',
    padding: '0.375rem 0.75rem',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  qCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1.25rem 1.5rem',
    boxShadow: 'var(--shadow-sm)',
  },
  qHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    cursor: 'pointer',
    marginBottom: '0.625rem',
  },
  qTitleBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
  },
  qBadge: {
    backgroundColor: '#111111',
    color: '#ffffff',
    fontSize: '0.725rem',
    fontWeight: '700',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    flexShrink: 0,
    marginTop: '1px',
    fontFamily: 'var(--font-mono)',
  },
  qQuestion: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#111111',
    margin: 0,
    lineHeight: '1.4',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  intentBox: {
    fontSize: '0.8rem',
    backgroundColor: '#fafafa',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #eaeaea',
    color: '#333333',
    display: 'flex',
    gap: '0.375rem',
  },
  intentLabel: {
    color: '#111111',
    flexShrink: 0,
  },
  intentText: {
    color: '#666666',
  },
  expandedContent: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eaeaea',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  keywordBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  badgeWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  tipBox: {
    backgroundColor: '#fafafa',
    border: '1px solid #eaeaea',
    borderRadius: '6px',
    padding: '0.875rem',
  },
  tipTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#111111',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  tipText: {
    fontSize: '0.825rem',
    color: '#333333',
    margin: 0,
    lineHeight: '1.45',
  }
};
