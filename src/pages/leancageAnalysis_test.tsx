import React, { useState, useRef } from "react";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Upload,
  Loader2,
  AlertCircle,
  ExternalLink,
  BarChart2,
  Briefcase,
  Code2,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api, LeancageResult, LeancageJobComparison } from "../utils/api";

const METRIC_COLORS: Record<string, string> = {
  tech_match:   "#16A34A",
  domain_match: "#2563EB",
  career_fit:   "#7C3AED",
};

const METRIC_ICONS: Record<string, React.ReactNode> = {
  tech_match:   <Code2 size={13} />,
  domain_match: <Briefcase size={13} />,
  career_fit:   <UserCheck size={13} />,
};

const CAREER_LABEL: Record<string, string> = {
  경력:    "경력자",
  신입:    "신입",
  unknown: "경력 미확인",
};

// ── 점수 바 ──────────────────────────────────────────────────────────────────
const ScoreBar = ({ score, color }: { score: number; color: string }) => (
  <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-1">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${score}%`, background: color }}
    />
  </div>
);

// ── 공고별 카드 ───────────────────────────────────────────────────────────────
const JobCard = ({ job }: { job: LeancageJobComparison }) => {
  const [open, setOpen] = useState(false);
  const scoreColor =
    job.overall_score >= 70 ? "#16A34A"
    : job.overall_score >= 50 ? "#D97706"
    : "#DC2626";

  return (
    <div
      className="border rounded-xl overflow-hidden transition-colors"
      style={{ borderColor: "#eaeaea" }}
    >
      {/* 헤더 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white hover:bg-zinc-50 transition-colors border-0 cursor-pointer"
      >
        {/* 종합 점수 */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc)` }}
        >
          {job.overall_score}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-zinc-900 truncate">
            {job.company || "회사명 미확인"} · {job.title || "직무명 미확인"}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-2">
            {job.job_type && (
              <span className="flex items-center gap-1">
                <Briefcase size={9} /> {job.job_type}
              </span>
            )}
            <span className="text-green-600">매칭 {job.tech_score}%</span>
            <span className="text-blue-600">도메인 {job.domain_score}%</span>
            <span className="text-purple-600">경력 {job.career_score}%</span>
          </div>
        </div>

        {open ? <ChevronUp size={14} className="text-zinc-400 shrink-0" /> : <ChevronDown size={14} className="text-zinc-400 shrink-0" />}
      </button>

      {/* 펼침 상세 */}
      {open && (
        <div className="px-4 pb-4 border-t border-zinc-100 bg-zinc-50">
          {/* 3개 점수 바 */}
          <div className="grid grid-cols-3 gap-3 pt-3 mb-3">
            {[
              { label: "기술 매칭", score: job.tech_score,   color: "#16A34A" },
              { label: "도메인 일치", score: job.domain_score, color: "#2563EB" },
              { label: "경력 조건", score: job.career_score, color: "#7C3AED" },
            ].map(({ label, score, color }) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-zinc-500">{label}</span>
                  <span className="text-[11px] font-bold" style={{ color }}>{score}%</span>
                </div>
                <ScoreBar score={score} color={color} />
              </div>
            ))}
          </div>

          {/* 기술 태그 */}
          {job.matched_skills.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-bold text-zinc-500 block mb-1">✓ 보유 기술</span>
              <div className="flex flex-wrap gap-1">
                {job.matched_skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {job.missing_skills.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-bold text-zinc-500 block mb-1">✗ 부족 기술</span>
              <div className="flex flex-wrap gap-1">
                {job.missing_skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#FFF1F2", color: "#E11D48", border: "1px solid rgba(225,29,72,0.2)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 원본 URL */}
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 mt-1">
              <ExternalLink size={10} /> 공고 원문 보기
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ── 결과 뷰 ──────────────────────────────────────────────────────────────────
const ResultView = ({
  result,
  onReset,
}: {
  result: LeancageResult;
  onReset: () => void;
}) => {
  const { overall_score, metrics, raw, detail } = result;
  const careerLabel = CAREER_LABEL[raw.career_level] ?? raw.career_level;

  return (
    <div className="flex flex-col gap-5">
      {/* 종합 점수 헤더 */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="72" height="72" viewBox="0 0 36 36">
            <path
              className="fill-none stroke-white/10 stroke-[3]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-linecap-round transition-all duration-700"
              style={{
                stroke: "#22C55E",
                strokeWidth: "3",
                strokeDasharray: `${overall_score}, 100`,
              }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[13px] font-extrabold text-white">
            {overall_score}
          </span>
        </div>

        <div className="flex-1">
          <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-0.5">
            이력서 × 채용공고 종합 점수
          </div>
          <div className="text-lg font-extrabold text-white leading-none mb-1">
            {overall_score >= 70 ? "우수한 적합도" : overall_score >= 50 ? "보통 적합도" : "개선 필요"}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}
            >
              {careerLabel}
            </span>
            <span className="text-[10px] text-zinc-500">
              {detail.job_comparisons.length}개 공고 분석 · 기술60% 업무30% 경력10%
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition border border-white/10 shrink-0"
        >
          다시 분석
        </button>
      </div>

      {/* AI 총평 */}
      {raw.overall_evaluation && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: "#16A34A" }} />
            <span className="text-[11px] font-bold text-zinc-600">AI 분석 총평</span>
            <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              GPT-4o-mini
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed m-0">
            {raw.overall_evaluation}
          </p>
        </div>
      )}

      {/* 3개 지표 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.key} className="card">
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ color: METRIC_COLORS[m.key] ?? "#16A34A" }}>
                {METRIC_ICONS[m.key]}
              </span>
              <span className="text-[10px] font-bold text-zinc-600">{m.label}</span>
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{ color: METRIC_COLORS[m.key] ?? "#16A34A" }}
            >
              {m.score}
              <span className="text-sm font-semibold text-zinc-400">%</span>
            </div>
            <ScoreBar score={m.score} color={METRIC_COLORS[m.key] ?? "#16A34A"} />
            <p className="text-[10px] text-zinc-400 mt-2 m-0">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* 공고별 상세 */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={15} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-900 m-0">공고별 비교 결과</h2>
          <span className="text-[10px] text-zinc-400 ml-auto">
            점수 높은 순 · 클릭해서 상세 보기
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {detail.job_comparisons.map((job, i) => (
            <JobCard key={i} job={job} />
          ))}
        </div>
      </div>

      {/* 전체 기술 현황 */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Code2 size={15} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-900 m-0">전체 기술 현황</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] font-bold text-green-600 block mb-1.5">
              ✓ 보유 · 공고 매칭 ({raw.matched_skills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {raw.matched_skills.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>
                  {s}
                </span>
              ))}
              {raw.matched_skills.length === 0 && <span className="text-[10px] text-zinc-400 italic">없음</span>}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-500 block mb-1.5">
              ✗ 공고 요구 · 미보유 ({raw.missing_skills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {raw.missing_skills.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#FFF1F2", color: "#E11D48", border: "1px solid rgba(225,29,72,0.2)" }}>
                  {s}
                </span>
              ))}
              {raw.missing_skills.length === 0 && <span className="text-[10px] text-zinc-400 italic">없음</span>}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block mb-1.5">
              ◎ 보유 · 공고 미요구 ({raw.extra_skills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {raw.extra_skills.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#F4F4F5", color: "#71717A", border: "1px solid #E4E4E7" }}>
                  {s}
                </span>
              ))}
              {raw.extra_skills.length === 0 && <span className="text-[10px] text-zinc-400 italic">없음</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function LeancageAnalysisTest() {
  const [resumeText, setResumeText]           = useState("");
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [urlInput, setUrlInput]               = useState("");
  const [registeredUrls, setRegisteredUrls]   = useState<string[]>([]);

  const [loading, setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult]       = useState<LeancageResult | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const [fileInfo, setFileInfo]   = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── URL 등록 ───────────────────────────────────────────────────────────────
  const handleRegisterUrl = () => {
    if (!urlInput.trim()) return;
    if (registeredUrls.length >= 5) { setError("최대 5개까지 등록 가능합니다."); return; }
    setRegisteredUrls([...registeredUrls, urlInput.trim()]);
    setUrlInput("");
    setError(null);
  };
  const handleRemoveUrl = (i: number) =>
    setRegisteredUrls(registeredUrls.filter((_, idx) => idx !== i));

  // ── 파일 업로드 ────────────────────────────────────────────────────────────
  const processFile = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt", "md"].includes(ext ?? "")) {
      setFileError("지원 형식: PDF, TXT, MD");
      setFileInfo(null);
      return;
    }
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB" });
    setFileError(null);

    if (ext === "pdf") {
      setExtracting(true);
      (async () => {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
          if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error((e as any).detail || "PDF 추출 실패");
          }
          const data = await res.json();
          setResumeText(data.text);
          setOriginalResumeText(data.text);
        } catch (e: any) {
          setFileError(e.message || "PDF 추출 오류");
          setFileInfo(null);
        } finally {
          setExtracting(false);
        }
      })();
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result && typeof ev.target.result === "string") {
        setResumeText(ev.target.result);
        setOriginalResumeText(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  // ── 분석 시작 ──────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError("이력서 텍스트를 입력하거나 파일을 업로드해 주세요."); return; }
    if (registeredUrls.length === 0) { setError("채용공고 URL을 최소 하나 등록해주세요."); return; }

    setLoading(true); setError(null); setResult(null); setLoadingStep(1);
    const timers = [
      setTimeout(() => setLoadingStep(2), 1000),
      setTimeout(() => setLoadingStep(3), 2200),
      setTimeout(() => setLoadingStep(4), 3200),
    ];
    try {
      const data = await api.analyzeLeancage(resumeText, registeredUrls);
      await new Promise((r) => setTimeout(r, 3800));
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err.message ?? "분석 중 오류가 발생했습니다.");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // ── 로딩 ───────────────────────────────────────────────────────────────────
  if (loading) {
    const steps = [
      "채용공고 URL 파싱 중...",
      "이력서 기술 추출 중...",
      "공고별 기술 · 업무 · 경력 매칭 중...",
      "AI 종합 평가 생성 중...",
    ];
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="animate-spin rounded-full border-[3px] h-12 w-12"
            style={{ borderColor: "#F0FDF4", borderTopColor: "#16A34A" }}
          />
          <Sparkles size={18} className="absolute" style={{ color: "#16A34A" }} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-zinc-900">이력서 × 채용공고 분석 중</h2>
        <p className="text-sm text-zinc-500 mb-8">
          공고별 기술 매칭 · 업무 연관도 · 경력 조건을 동시에 분석합니다.
        </p>
        <div className="w-full bg-white border border-zinc-100 rounded-2xl p-5 text-left shadow-sm">
          {steps.map((step, idx) => {
            const done = loadingStep > idx + 1;
            const cur  = loadingStep === idx + 1;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 mb-3.5 transition-opacity duration-300 ${
                  done || cur ? "opacity-100" : "opacity-35"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-white"
                  style={{
                    background: done
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : cur
                      ? "linear-gradient(135deg, #16A34A, #22C55E)"
                      : "#e5e5e5",
                    color: done || cur ? "white" : "#999",
                  }}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span className={`text-xs ${cur ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 결과 ───────────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-[900px] mx-auto">
        <ResultView result={result} onReset={() => setResult(null)} />
      </div>
    );
  }

  // ── 입력 폼 ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* 상단 URL 입력 바 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-700 m-0">채용공고 URL 연동</h2>
          <span className="text-[10px] text-zinc-400 font-mono">최대 5개</span>
        </div>
        <div
          className="flex items-center bg-white rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{ border: "2px solid #e5e5e5", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = "#16A34A"; }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
          <Search size={16} className="text-zinc-400 shrink-0 mr-3" />
          <input
            type="url"
            className="flex-grow border-0 outline-none text-sm text-zinc-900 bg-transparent py-1"
            placeholder="채용공고 URL을 입력하세요 (예: https://www.jobkorea.co.kr/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRegisterUrl(); } }}
          />
          <button
            type="button"
            onClick={handleRegisterUrl}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-1.5 px-4 rounded-xl shrink-0 ml-3"
            style={{
              background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
              boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
            }}
          >
            <Plus size={13} /> 등록
          </button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-5">
          <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 2컬럼: 채용공고 목록 | 이력서 업로드 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 등록된 채용공고 */}
        <div className="col-span-12 lg:col-span-7">
          <div
            className="bg-white rounded-2xl p-5 border h-full"
            style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
              <Search size={14} style={{ color: "#16A34A" }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">등록된 채용공고</h3>
              <span className="text-[10px] text-zinc-400 font-mono ml-1">
                ({registeredUrls.length}/5)
              </span>
            </div>

            {registeredUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search size={28} className="text-zinc-200 mb-3" />
                <p className="text-xs text-zinc-400">
                  위 입력창에 채용공고 URL을 입력하고<br />등록 버튼을 눌러주세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {registeredUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 border group transition-colors"
                    style={{ borderColor: "#eaeaea", background: "#fafafa" }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                    >
                      {i + 1}
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-zinc-700 hover:underline truncate flex items-center gap-1 min-w-0"
                    >
                      <ExternalLink size={10} className="shrink-0 text-zinc-400" />
                      <span className="truncate">{url}</span>
                    </a>
                    <button
                      onClick={() => handleRemoveUrl(i)}
                      className="p-1 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-400 transition-colors border-0 bg-transparent cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 이력서 업로드 */}
        <div className="col-span-12 lg:col-span-5">
          <div
            className="bg-white rounded-2xl p-4 border h-full flex flex-col gap-3"
            style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <FileText size={14} style={{ color: "#16A34A" }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">이력서 업로드</h3>
            </div>

            {/* 파일 드롭존 */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                className="hidden"
              />
              <div
                onDragEnter={handleFileDrag} onDragOver={handleFileDrag}
                onDragLeave={handleFileDrag} onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-150"
                style={{
                  border: `1.5px dashed ${isDragActive ? "#16A34A" : fileInfo ? "#10b981" : "#d1d5db"}`,
                  background: isDragActive ? "#F0FDF4" : fileInfo ? "#f0fdf4" : "#fafafa",
                }}
              >
                {extracting ? (
                  <>
                    <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "#16A34A" }} />
                    <div>
                      <div className="text-xs font-semibold text-zinc-700">PDF 추출 중...</div>
                      <div className="text-[10px] text-zinc-400">잠시만 기다려주세요</div>
                    </div>
                  </>
                ) : fileInfo ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-green-700 truncate">{fileInfo.name}</div>
                      <div className="text-[10px] text-zinc-400">{fileInfo.size} · 클릭하여 변경</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={16} className="text-zinc-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-zinc-700">파일 등록 (PDF / TXT / MD)</div>
                      <div className="text-[10px] text-zinc-400">드래그 또는 클릭</div>
                    </div>
                  </>
                )}
              </div>
              {fileError && (
                <div className="flex items-center gap-1.5 mt-1 text-red-500 text-[11px]">
                  <AlertCircle size={11} /><span>{fileError}</span>
                </div>
              )}
            </div>

            {/* 이력서 텍스트 */}
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">이력서 텍스트</label>
                {originalResumeText && resumeText !== originalResumeText && (
                  <button
                    type="button"
                    onClick={() => setResumeText(originalResumeText)}
                    className="text-[11px] border-0 bg-transparent cursor-pointer p-0"
                    style={{ color: "#16A34A" }}
                  >
                    원본으로 초기화
                  </button>
                )}
              </div>
              <textarea
                className="form-textarea text-xs! leading-relaxed flex-1"
                style={{ minHeight: "180px", maxHeight: "360px", resize: "vertical" }}
                placeholder="이력서 파일 업로드 시 자동으로 채워집니다. 직접 붙여넣기도 가능합니다."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 분석 시작 버튼 */}
      <div className="flex justify-center mt-8 mb-2">
        <button
          type="button"
          onClick={handleAnalyze}
          className="flex items-center gap-3 text-white font-bold rounded-2xl transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
            boxShadow: "0 6px 24px rgba(22,163,74,0.4)",
            fontSize: "1.125rem",
            padding: "0.875rem 3.75rem",
          }}
        >
          <Sparkles size={22} />
          이력서 × 공고 분석 시작
        </button>
      </div>
    </div>
  );
}
