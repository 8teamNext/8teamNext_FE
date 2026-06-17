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
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900 h-10 w-10 mb-5"></div>
        <h3 className="text-lg font-bold text-zinc-900 m-0 mb-2">AI 예상 기술 면접 질문 생성 중</h3>
        <p className="max-w-[480px] text-xs text-zinc-500 m-0 leading-relaxed">
          자기소개서에 작성된 프로젝트 경험, 트러블슈팅 사례, 사용 기술 명세를 스캔하여 기술면접 단골 주제와 연계한 예상 질문을 추론하고 있습니다.
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
          <h1 className="text-xl font-bold text-zinc-900 m-0">AI 모의 면접 질문 (Mock Interview)</h1>
          <p className="text-xs text-zinc-500 m-0 mt-1">자기소개서 기반으로 도출된 고부가가치 실전 면접 질문집입니다.</p>
        </div>

        {/* Questions Grid/Accordion */}
        <div className="flex flex-col gap-3.5">
          {result.questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4 cursor-pointer mb-2.5" onClick={() => toggleExpand(q.id)}>
                  <div className="flex items-start gap-2.5">
                    <div className="bg-black text-white text-[10px] font-bold py-0.5 px-1.5 rounded font-mono shrink-0 mt-0.5">Q{idx + 1}</div>
                    <h3 className="text-sm font-semibold text-zinc-900 m-0 leading-relaxed">{q.question}</h3>
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

        <div className="mt-8 flex justify-center">
          <button type="submit" className="btn btn-primary py-2.5 px-7 text-sm flex items-center gap-1.5">
            예상 기술 면접 질문 생성하기 <ChevronRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
