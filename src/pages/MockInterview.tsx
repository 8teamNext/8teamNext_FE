import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ListChecks,
  Zap,
  Scale,
  BookOpen,
  PenLine,
  UserCircle2,
  Upload,
} from 'lucide-react';
import { api, InterviewGenResponse, FollowupResponse } from '../utils/api';

function CompactFileUpload({ onTextLoaded }: { onTextLoaded: (text: string) => void }) {
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'md'].includes(ext ?? '')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onTextLoaded(e.target.result);
        setFileName(file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 border border-dashed border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition mb-4"
    >
      <input ref={inputRef} type="file" accept=".txt,.md" className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])} />
      <Upload size={14} className="text-zinc-400 shrink-0" />
      {fileName ? (
        <>
          <span className="text-xs text-zinc-700 font-medium truncate">{fileName}</span>
          <span className="text-[10px] text-zinc-400 ml-auto shrink-0">클릭하여 변경</span>
        </>
      ) : (
        <span className="text-xs text-zinc-500">자기소개서 파일 등록하기 <span className="text-zinc-400">(.txt / .md)</span></span>
      )}
    </div>
  );
}

export default function MockInterview() {
  const [coverLetter, setCoverLetter] = useState('');
  const [jobPosting, setJobPosting] = useState('');
  const [style, setStyle] = useState<string>('기본형');
  const [difficulty, setDifficulty] = useState<string>('신입');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [wasJobPostingUsed, setWasJobPostingUsed] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [followups, setFollowups] = useState<Record<number, FollowupResponse>>({});
  const [followupLoading, setFollowupLoading] = useState<Record<number, boolean>>({});
  const [sampleAnswers, setSampleAnswers] = useState<Record<number, string>>({});
  const [sampleAnswerLoading, setSampleAnswerLoading] = useState<Record<number, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const t1 = setTimeout(() => setLoadingStep(1), 2200);
    const t2 = setTimeout(() => setLoadingStep(2), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  const handleFileUpload = (text: string) => {
    setCoverLetter(text);
  };

  const handleGenerateFollowup = async (qId: number, question: string) => {
    const answer = userAnswers[qId]?.trim();
    if (!answer) return;
    setFollowupLoading((prev) => ({ ...prev, [qId]: true }));
    try {
      const data = await api.generateFollowupQuestion(question, answer);
      setFollowups((prev) => ({ ...prev, [qId]: data }));
    } catch {
      // 실패 시 무시
    } finally {
      setFollowupLoading((prev) => ({ ...prev, [qId]: false }));
    }
  };

  const handleGenerate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setError('자기소개서 텍스트를 입력하거나 파일을 업로드해주세요.');
      return;
    }
    if (coverLetter.trim().length < 50) {
      setError('자기소개서가 너무 짧습니다. 최소 50자 이상 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setWasJobPostingUsed(!!jobPosting.trim());

    try {
      const data = await api.generateInterviewQuestions(coverLetter, jobPosting, style, difficulty);
      setResult(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        '인터뷰 질문 생성 도중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealSampleAnswer = async (q: { id: number; question: string; intent: string; suggested_keywords: string[] }) => {
    if (sampleAnswers[q.id]) {
      setRevealedAnswers((prev) => ({ ...prev, [q.id]: true }));
      return;
    }
    setSampleAnswerLoading((prev) => ({ ...prev, [q.id]: true }));
    try {
      const data = await api.generateSampleAnswer(q.question, coverLetter, q.intent, q.suggested_keywords, style, difficulty);
      setSampleAnswers((prev) => ({ ...prev, [q.id]: data.sample_answer }));
      setRevealedAnswers((prev) => ({ ...prev, [q.id]: true }));
    } catch {
      // 실패 시 무시
    } finally {
      setSampleAnswerLoading((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    const steps = wasJobPostingUsed
      ? ['채용공고 파싱 중', '핵심 역량 추출 중', '맞춤형 질문 생성 중']
      : ['자기소개서 분석 중', '핵심 역량 추출 중', '면접 질문 생성 중'];
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <div className="flex flex-col gap-3 w-full max-w-65">
          {steps.map((label, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i === loadingStep ? 'opacity-100' : i < loadingStep ? 'opacity-55' : 'opacity-40'}`}>
              {i < loadingStep ? (
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              ) : i === loadingStep ? (
                <span className="w-4 h-4 rounded-full border-2 border-zinc-800 border-t-transparent animate-spin shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-zinc-400 shrink-0" />
              )}
              <span className={`text-sm text-zinc-700 ${i === loadingStep ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="pb-12">
        {/* Result Header */}
        <div className="mb-6 border-b border-zinc-200 pb-5">
          <button onClick={() => setResult(null)} className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 mb-4">
            <ArrowLeft size={14} /> 다시 생성하기
          </button>
          <h1 className="text-xl font-bold text-zinc-900 m-0">
            {wasJobPostingUsed ? '채용공고 맞춤형 면접 질문' : 'AI 모의 면접 질문 (Mock Interview)'}
          </h1>
          <p className="text-xs text-zinc-500 m-0 mt-1">
            {wasJobPostingUsed
              ? '채용공고 요구역량과 자기소개서 경험을 교차 분석하여 생성된 맞춤형 질문집입니다.'
              : '자기소개서 기반으로 도출된 고부가가치 실전 면접 질문집입니다.'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full">
              총 {result.questions.length}개
            </span>
            {Object.entries(
              result.questions.reduce<Record<string, number>>((acc, q) => {
                acc[q.category] = (acc[q.category] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([cat, count]) => (
              <span key={cat} className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">
                {cat} {count}
              </span>
            ))}
          </div>
        </div>

        {/* 채용공고 분석 결과 카드 */}
        {result.job_posting_analysis && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-3 uppercase tracking-wider">
              <ListChecks size={13} className="text-indigo-600" />
              <span>채용공고 분석 결과</span>
            </div>
            {result.job_posting_analysis.summary && (
              <p className="text-xs text-indigo-700 bg-indigo-100 rounded-md px-3 py-2 mb-3 leading-relaxed">
                {result.job_posting_analysis.summary}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {result.job_posting_analysis.skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-1.5">공고 스킬 태그</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.job_posting_analysis.skills.map((skill) => (
                      <span key={skill} className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.job_posting_analysis.extracted_requirements.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1.5">추출된 핵심 요구사항</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.job_posting_analysis.extracted_requirements.map((req) => (
                      <span key={req} className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{req}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {result.job_posting_analysis.matched.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <CheckCircle2 size={11} className="text-green-500" />
                      <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">자소서 경험 일치</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {result.job_posting_analysis.matched.map((item) => (
                        <span key={item} className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.job_posting_analysis.unmatched.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <XCircle size={11} className="text-red-400" />
                      <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">자소서에 없는 역량</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {result.job_posting_analysis.unmatched.map((item) => (
                        <span key={item} className="text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Questions Grid/Accordion */}
        <div className="flex flex-col gap-3.5">
          {result.questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const categoryColor: Record<string, string> = {
              '기술 구현': 'bg-blue-100 text-blue-700',
              '트러블슈팅': 'bg-red-100 text-red-700',
              '시스템 설계': 'bg-purple-100 text-purple-700',
              '협업·소통': 'bg-green-100 text-green-700',
              'CS 기초': 'bg-yellow-100 text-yellow-700',
              'DevOps': 'bg-orange-100 text-orange-700',
            };
            const badgeClass = categoryColor[q.category] ?? 'bg-zinc-100 text-zinc-600';
            return (
              <div key={q.id} className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4 cursor-pointer mb-2.5" onClick={() => toggleExpand(q.id)}>
                  <div className="flex items-start gap-2.5">
                    <div className="bg-black text-white text-[10px] font-bold py-0.5 px-1.5 rounded font-mono shrink-0 mt-0.5">Q{idx + 1}</div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded self-start ${badgeClass}`}>{q.category}</span>
                      <h3 className="text-sm font-semibold text-zinc-900 m-0 leading-relaxed">{q.question}</h3>
                    </div>
                  </div>
                  <button className="bg-transparent border-0 cursor-pointer flex items-center gap-1 shrink-0 p-0">
                    {isExpanded ? <EyeOff size={14} className="text-zinc-500" /> : <Eye size={14} className="text-blue-600" />}
                    <span className={`text-[10px] font-bold ${isExpanded ? 'text-zinc-500' : 'text-blue-600'}`}>
                      {isExpanded ? '답변 가리기' : '답변 팁 보기'}
                    </span>
                  </button>
                </div>

                <div className="text-xs bg-zinc-50 p-2.5 rounded-md border border-zinc-200 text-zinc-800 flex gap-1.5">
                  <strong className="text-zinc-900 shrink-0">출제 의도:</strong>
                  <span className="text-zinc-500">{q.intent}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">추천 키워드 (답변에 포함 추천)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {q.suggested_keywords.map((kw) => (
                          <span key={kw} className="badge badge-info">{kw}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 mb-1.5 uppercase tracking-wider">
                        <Sparkles size={12} className="text-zinc-900" />
                        <span>합격 답변 구조 설계 팁</span>
                      </div>
                      <p className="text-xs text-zinc-700 m-0 leading-relaxed">{q.sample_answer_tip}</p>
                    </div>

                    {revealedAnswers[q.id] && sampleAnswers[q.id] ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                            <MessageSquare size={12} className="text-blue-600" />
                            <span>모범 답변 예시</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRevealedAnswers((prev) => ({ ...prev, [q.id]: false }))}
                            className="text-[11px] text-blue-500 underline bg-transparent border-0 cursor-pointer p-0"
                          >
                            숨기기
                          </button>
                        </div>
                        <p className="text-xs text-blue-900 m-0 leading-relaxed whitespace-pre-line">{sampleAnswers[q.id]}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={sampleAnswerLoading[q.id]}
                        onClick={() => handleRevealSampleAnswer(q)}
                        className="btn btn-secondary py-1.5 px-4 text-xs self-start flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {sampleAnswerLoading[q.id] ? (
                          <><span className="animate-spin inline-block w-3 h-3 border border-zinc-400 border-t-zinc-700 rounded-full" />생성 중...</>
                        ) : (
                          <><Eye size={13} />모범 답변 보기</>
                        )}
                      </button>
                    )}

                    {/* 내 답변 연습 */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PenLine size={12} className="text-zinc-400" />
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">내 답변 연습</span>
                        </div>
                        {(() => {
                          const len = userAnswers[q.id]?.length ?? 0;
                          const cls = len >= 200 ? 'text-green-500' : len >= 100 ? 'text-amber-500' : len > 0 ? 'text-zinc-400' : 'text-zinc-300';
                          return (
                            <span className={`text-[11px] tabular-nums ${cls}`}>
                              {len >= 200 ? `${len}자 ✓` : `${len}자 / 200자 권장`}
                            </span>
                          );
                        })()}
                      </div>
                      {!userAnswers[q.id] && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-dashed border-zinc-200 rounded-md">
                          <Sparkles size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-[11px] text-zinc-400">위 키워드를 활용해 직접 답변을 써보세요. 꼬리질문으로 실전 연습까지 이어갈 수 있어요.</span>
                        </div>
                      )}
                      <textarea
                        className="form-textarea min-h-25 text-xs resize-none"
                        placeholder="여기에 답변을 작성해보세요..."
                        value={userAnswers[q.id] ?? ''}
                        onChange={(e) => setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        disabled={!userAnswers[q.id]?.trim() || followupLoading[q.id]}
                        onClick={() => handleGenerateFollowup(q.id, q.question)}
                        className="btn btn-secondary py-2 px-4 text-xs self-end flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {followupLoading[q.id] ? (
                          <><span className="animate-spin inline-block w-3 h-3 border border-zinc-400 border-t-zinc-700 rounded-full" />꼬리질문 생성 중...</>
                        ) : (
                          <><MessageSquare size={13} />꼬리질문 받기</>
                        )}
                      </button>
                    </div>

                    {followups[q.id] && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-1.5">
                          <UserCircle2 size={13} className="text-indigo-500 shrink-0" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">면접관 꼬리질문</span>
                        </div>
                        <p className="text-sm font-semibold text-indigo-900 m-0 leading-relaxed">{followups[q.id].followup_question}</p>
                        {followups[q.id].intent && (
                          <p className="text-[11px] text-indigo-500 m-0 border-t border-indigo-200 pt-2.5">{followups[q.id].intent}</p>
                        )}
                      </div>
                    )}
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
    <div className="pb-8">
      <div className="mb-6 border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-bold text-zinc-900 m-0 mb-1.5">AI 모의 면접 (Mock Interview)</h1>
        <p className="text-xs text-zinc-500 m-0">자기소개서를 등록하면 본인의 프로젝트 경험과 기술을 기반으로 맞춤형 기술 면접 질문과 해설 가이드를 생성합니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-md text-xs flex items-center gap-2 mb-5">
          <AlertCircle size={16} className="text-red-500 shrink-0" style={{ marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="mt-5">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-zinc-900 m-0 mb-1.5">자기소개서 입력</h3>
          <p className="text-xs text-zinc-500 m-0 mb-4">진행한 프로젝트나 협업 사례가 작성된 자소서 텍스트를 붙여넣거나 파일(.txt)을 업로드해주세요.</p>

          <CompactFileUpload onTextLoaded={handleFileUpload} />

          <div className="form-group mb-0 mt-4">
            <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">자기소개서 텍스트 직접 쓰기</label>
            <textarea
              className="form-textarea min-h-45"
              placeholder="프로젝트 설계, 구현 및 협업 트러블슈팅 내역이 작성된 자소서를 입력해주세요..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex justify-end mt-1.5">
              {coverLetter.trim().length >= 50 ? (
                <span className="text-[11px] text-green-500 flex items-center gap-1">
                  <CheckCircle2 size={11} /> {coverLetter.length.toLocaleString()}자
                </span>
              ) : (
                <span className="text-[11px] text-zinc-400">
                  {coverLetter.length}자 <span className="text-zinc-300">/ 최소 50자</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 mt-4">
          <h3 className="text-sm font-bold text-zinc-900 m-0 mb-1.5">채용공고 입력 <span className="text-zinc-400 font-normal">(선택)</span></h3>
          <p className="text-xs text-zinc-500 m-0 mb-4">
            채용공고 텍스트를 직접 붙여넣거나, <strong>잡코리아(jobkorea.co.kr)</strong> 공고 URL을 입력하면 자동으로 분석합니다.
          </p>
          <div className="form-group mb-0">
            <textarea
              className={`form-textarea min-h-35 ${/^https?:\/\/\S+$/.test(jobPosting.trim()) && !/jobkorea\.co\.kr/.test(jobPosting) ? 'border-amber-400 focus:border-amber-500' : ''}`}
              placeholder="채용공고 텍스트 또는 잡코리아 URL을 입력하세요..."
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
            />
            {/^https?:\/\/\S+$/.test(jobPosting.trim()) && !/jobkorea\.co\.kr/.test(jobPosting) && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} />
                URL은 잡코리아만 지원합니다. 다른 사이트는 공고 텍스트를 직접 복사해 붙여넣어 주세요.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 mt-4">
          <h3 className="text-sm font-bold text-zinc-900 m-0 mb-4">면접관 설정</h3>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">면접 스타일</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: '기본형', label: '기본형', icon: <BookOpen size={15} />, desc: '자소서 기반 기술 질문' },
                  { key: '압박형', label: '압박형', icon: <Zap size={15} />, desc: '주장 반박·근거 검증' },
                  { key: '균형형', label: '인성+기술', icon: <Scale size={15} />, desc: '기술 + 협업 균형' },
                ] as const).map(({ key, label, icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStyle(key)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                      style === key
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-400'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <span className={style === key ? 'text-indigo-500' : 'text-zinc-400'}>{icon}</span>
                    <span className="text-xs font-bold">{label}</span>
                    <span className={`text-[10px] leading-tight ${style === key ? 'text-indigo-500' : 'text-zinc-400'}`}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">난이도</p>
              <div className="flex gap-2">
                {([
                  { key: '신입', label: '신입', desc: '기초 개념·학습 능력 중심' },
                  { key: '경력', label: '경력 3년+', desc: '설계·트레이드오프·의사결정 중심' },
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficulty(key)}
                    className={`flex-1 flex flex-col items-start gap-0.5 p-3 rounded-lg border text-left transition-all ${
                      difficulty === key
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-400'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{label}</span>
                    <span className={`text-[10px] ${difficulty === key ? 'text-indigo-500' : 'text-zinc-400'}`}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button type="submit" className="btn btn-primary py-2.5 px-7 text-sm flex items-center gap-1.5">
            예상 기술 면접 질문 생성하기 <ChevronRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
