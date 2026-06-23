import React, { useState } from 'react';
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
  ListChecks
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { api, InterviewGenResponse } from '../utils/api';

export default function MockInterview() {
  const [coverLetter, setCoverLetter] = useState('');
  const [jobPosting, setJobPosting] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [wasJobPostingUsed, setWasJobPostingUsed] = useState(false);

  const handleFileUpload = (text: string, fileName: string) => {
    setCoverLetter(text);
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const data = await api.generateInterviewQuestions(coverLetter, jobPosting);
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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900 h-10 w-10 mb-5"></div>
        <h3 className="text-lg font-bold text-zinc-900 m-0 mb-2">
          {wasJobPostingUsed ? '채용공고 · 자소서 교차 분석 중' : 'AI 예상 기술 면접 질문 생성 중'}
        </h3>
        <p className="max-w-[480px] text-xs text-zinc-500 m-0 leading-relaxed">
          {wasJobPostingUsed
            ? '채용공고의 필수 역량을 추출하고 자기소개서 경험과 매핑하여 맞춤형 면접 질문을 구성하고 있습니다.'
            : '자기소개서에 작성된 프로젝트 경험, 트러블슈팅 사례, 사용 기술 명세를 스캔하여 기술면접 단골 주제와 연계한 예상 질문을 추론하고 있습니다.'}
        </p>
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

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-1.5 uppercase tracking-wider">
                        <MessageSquare size={12} className="text-blue-600" />
                        <span>모범 답변 예시</span>
                      </div>
                      <p className="text-xs text-blue-900 m-0 leading-relaxed whitespace-pre-line">{q.sample_answer}</p>
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

          <FileUpload 
            accept=".txt,.md" 
            onTextLoaded={handleFileUpload} 
            placeholderText="자기소개서 파일 등록하기 (.txt/.md)"
          />

          <div className="form-group mb-0 mt-4">
            <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">자기소개서 텍스트 직접 쓰기</label>
            <textarea
              className="form-textarea min-h-[180px]"
              placeholder="프로젝트 설계, 구현 및 협업 트러블슈팅 내역이 작성된 자소서를 입력해주세요..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 mt-4">
          <h3 className="text-sm font-bold text-zinc-900 m-0 mb-1.5">채용공고 입력 <span className="text-zinc-400 font-normal">(선택)</span></h3>
          <p className="text-xs text-zinc-500 m-0 mb-4">
            채용공고 텍스트를 직접 붙여넣거나, <strong>잡코리아(jobkorea.co.kr)</strong> 공고 URL을 입력하면 자동으로 분석합니다.
          </p>
          <div className="form-group mb-0">
            <textarea
              className={`form-textarea min-h-[140px] ${/^https?:\/\/\S+$/.test(jobPosting.trim()) && !/jobkorea\.co\.kr/.test(jobPosting) ? 'border-amber-400 focus:border-amber-500' : ''}`}
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

        <div className="mt-8 flex justify-center">
          <button type="submit" className="btn btn-primary py-2.5 px-7 text-sm flex items-center gap-1.5">
            예상 기술 면접 질문 생성하기 <ChevronRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
