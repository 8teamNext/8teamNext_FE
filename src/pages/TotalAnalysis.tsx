import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Upload,
  Loader2,
  AlertCircle,
  ExternalLink,
  Github,
  X,
  CheckCircle2,
  ChevronRight,
  BarChart2,
  RefreshCw,
  Building2,
  Briefcase,
  XCircle,
  PlusCircle,
} from "lucide-react";
import {
  api,
  AnalyzeResponse,
  LeancageResult,
  ResumeGithubResponse,
  MatchingSuccess,
  MatchingFailed,
} from "../utils/api";
import { ResumeGithubModal } from "./ResumeGithubDetail";
import { ResultView as LeancageResultView } from "./leancageAnalysis_test";

type Status = "idle" | "loading" | "done" | "error";

// ── 채용공고×GitHub 결과 뷰 (민정님 화면 그대로, 모달용) ─────────────────────
function JobGithubResultView({ result }: { result: AnalyzeResponse }) {
  const { github, matching } = result;
  const successMatching = matching.filter(
    (r): r is MatchingSuccess => r.status === "success",
  );
  const failedMatching = matching.filter(
    (r): r is MatchingFailed => r.status === "failed",
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* GitHub 기술스택 */}
      <div
        className="bg-white rounded-2xl p-5 border mb-6"
        style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#1a1a1a" }}>
            <Github size={14} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900">
            GitHub 기술스택 — @{github.username}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">검증된 기술 스택</span>
            <div className="flex flex-wrap gap-1.5">
              {github.confirmed_skills.map((skill) => (
                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {github.inferred_skills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">LLM 기반 추정 기술 스택</span>
              <div className="flex flex-wrap gap-1.5">
                {github.inferred_skills.map((skill) => (
                  <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)" }}>
                    {skill} · 추론
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 실패 공고 */}
      {failedMatching.length > 0 && (
        <div className="mb-4">
          {failedMatching.map((r) => (
            <div key={r.url_index} className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-2">
              <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-400" />
              <span>공고 {r.url_index + 1}번 실패: {r.error}</span>
            </div>
          ))}
        </div>
      )}

      {/* 매칭 결과 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {successMatching.map((r) => {
          const totalScore = Math.min(
            Math.round((r.confirmed_score + r.inferred_score) * 10) / 10,
            100,
          );
          return (
            <div key={r.url_index} className="bg-white rounded-2xl p-5 border"
              style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div className="mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-zinc-900">{r.title || "제목 없음"}</h3>
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full shrink-0 font-mono">
                    #{r.url_index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  {r.company && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Building2 size={11} /> {r.company}
                    </span>
                  )}
                  {r.job_type && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Briefcase size={11} /> {r.job_type}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-4 text-center mb-4"
                style={{ background: "linear-gradient(135deg, #F0FDF4, #EFF6FF)", border: "1px solid rgba(22,163,74,0.15)" }}>
                <div className="text-3xl font-extrabold mb-0.5"
                  style={{ color: totalScore >= 60 ? "#16A34A" : totalScore >= 30 ? "#2563EB" : "#DC2626" }}>
                  {totalScore}%
                </div>
                <div className="text-[10px] text-zinc-500">전체 기술 매칭률</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="text-[10px]" style={{ color: "#16A34A" }}>검증된 기술 스택 {r.confirmed_score}%</span>
                  <span className="text-zinc-300 text-[10px]">+</span>
                  <span className="text-[10px]" style={{ color: "#2563EB" }}>LLM 기반 추정 기술 스택 {r.inferred_score}%</span>
                </div>
              </div>

              {(r.confirmed_matched.length > 0 || r.inferred_matched.length > 0) && (
                <div className="mb-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">
                    <CheckCircle2 size={11} className="text-green-500" /> 매칭된 기술
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.confirmed_matched.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>{s}</span>
                    ))}
                    {r.inferred_matched.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)" }}>{s} · 추론</span>
                    ))}
                  </div>
                </div>
              )}

              {r.missing.length > 0 && (
                <div className="mb-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">
                    <XCircle size={11} className="text-red-400" /> 부족한 기술
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.missing.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {r.extra_confirmed.length > 0 && (
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">
                    <PlusCircle size={11} className="text-zinc-400" /> 추가 보유 기술
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.extra_confirmed.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F4F4F5", color: "#71717A", border: "1px solid rgba(0,0,0,0.08)" }}>{s}</span>
                    ))}
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

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function TotalAnalysis() {
  // ── 입력 ────────────────────────────────────────────────────────────────
  const [resumeText, setResumeText] = useState("");
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  useEffect(() => {
    api.getProfile()
      .then((profile) => {
        if (profile.github_username) setGithubUsername(profile.github_username);
        if (profile.default_resume) {
          setResumeText(profile.default_resume);
          setOriginalResumeText(profile.default_resume);
        }
      })
      .catch(() => {});
  }, []);
  const [urlInput, setUrlInput] = useState("");
  const [registeredUrls, setRegisteredUrls] = useState<string[]>([]);

  // ── 파일 업로드 ──────────────────────────────────────────────────────────
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 분석 상태 ────────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusRG, setStatusRG] = useState<Status>("idle");
  const [statusJG, setStatusJG] = useState<Status>("idle");
  const [statusJR, setStatusJR] = useState<Status>("idle");
  const [statusInsight, setStatusInsight] = useState<Status>("idle");
  const [resultRG, setResultRG] = useState<ResumeGithubResponse | null>(null);
  const [resultJG, setResultJG] = useState<AnalyzeResponse | null>(null);
  const [resultJR, setResultJR] = useState<LeancageResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  // ── 모달 ─────────────────────────────────────────────────────────────────
  const [modalRG, setModalRG] = useState(false);
  const [modalJG, setModalJG] = useState(false);
  const [modalJR, setModalJR] = useState(false);

  // ── 파일 처리 ────────────────────────────────────────────────────────────
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

  // ── URL 등록 ─────────────────────────────────────────────────────────────
  const handleRegisterUrl = () => {
    if (!urlInput.trim()) return;
    if (registeredUrls.length >= 5) { setFormError("최대 5개까지 등록 가능합니다."); return; }
    setRegisteredUrls([...registeredUrls, urlInput.trim()]);
    setUrlInput("");
    setFormError(null);
  };

  const handleRemoveUrl = (i: number) =>
    setRegisteredUrls(registeredUrls.filter((_, idx) => idx !== i));

  // ── 분석 시작 ────────────────────────────────────────────────────────────
  const handleStartAnalysis = async () => {
    if (!githubUsername.trim()) { setFormError("GitHub 아이디를 입력해주세요."); return; }
    if (!resumeText.trim()) { setFormError("이력서를 입력하거나 파일을 업로드해주세요."); return; }
    if (registeredUrls.length === 0) { setFormError("채용공고 URL을 최소 하나 등록해주세요."); return; }

    setIsAnalyzing(true);
    setFormError(null);
    setHasResult(false);
    setResultRG(null);
    setResultJG(null);
    setResultJR(null);
    setStatusRG("loading");
    setStatusJG("loading");
    setStatusJR("loading");

    // 3가지 분석을 병렬 실행, 각각 완료될 때 즉시 상태 업데이트
    const [rgSettled, jgSettled, jrSettled] = await Promise.allSettled([
      api.analyzeResumeGithub(resumeText, null, githubUsername, [])
        .then((data) => { setResultRG(data); setStatusRG("done"); return data; })
        .catch((err) => { setStatusRG("error"); throw err; }),
      api.analyze(githubUsername, registeredUrls)
        .then((data) => { setResultJG(data); setStatusJG("done"); return data; })
        .catch((err) => { setStatusJG("error"); throw err; }),
      api.analyzeLeancage(resumeText, registeredUrls)
        .then((data) => { setResultJR(data); setStatusJR("done"); return data; })
        .catch((err) => { setStatusJR("error"); throw err; }),
    ]);

    const anySuccess = [rgSettled, jgSettled, jrSettled].some((r) => r.status === "fulfilled");
    if (anySuccess) {
      setStatusInsight("loading");
      await new Promise((r) => setTimeout(r, 50));
      setStatusInsight("done");
    }
    setIsAnalyzing(false);
    if (anySuccess) setHasResult(true);
    else setFormError("모든 분석이 실패했습니다. 입력값을 확인해주세요.");
  };

  // ── 로딩 화면 ─────────────────────────────────────────────────────────────
  if (isAnalyzing) {
    const allStatuses = [statusRG, statusJG, statusJR, statusInsight];
    const steps: { label: string; status: Status }[] = [
      { label: "이력서 × GitHub 기술 정합성 분석 중...", status: statusRG },
      { label: "채용공고 × GitHub 매칭 분석 중...", status: statusJG },
      { label: "채용공고 × 이력서 적합도 분석 중...", status: statusJR },
      { label: "종합 인사이트 도출 중...", status: statusInsight },
    ];
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="animate-spin rounded-full border-[3px] h-12 w-12"
            style={{ borderColor: "#F0FDF4", borderTopColor: "#16A34A" }} />
          <Sparkles size={18} className="absolute" style={{ color: "#16A34A" }} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-zinc-900">종합 분석 중</h2>
        <p className="text-sm text-zinc-500 mb-8">
          이력서, GitHub, 채용공고를 동시에 분석하고 있습니다.
        </p>
        <div className="w-full bg-white border border-zinc-100 rounded-2xl p-5 text-left shadow-sm">
          {steps.map(({ label, status }, idx) => {
            const done = status === "done";
            const err = status === "error";
            const prevAllDone = allStatuses.slice(0, idx).every((s) => s === "done" || s === "error");
            const isActive = status === "loading" && prevAllDone;
            return (
              <div key={idx}
                className={`flex items-center gap-3 mb-3.5 last:mb-0 transition-opacity duration-300 ${done || isActive || err ? "opacity-100" : "opacity-35"}`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{
                    background: done ? "linear-gradient(135deg, #10b981, #059669)"
                      : err ? "#EF4444"
                      : isActive ? "linear-gradient(135deg, #16A34A, #22C55E)"
                      : "#e5e5e5",
                    color: done || isActive || err ? "white" : "#999",
                  }}>
                  {done ? "✓" : err ? "✗" : isActive ? <Loader2 size={11} className="animate-spin" /> : idx + 1}
                </div>
                <span className={`text-xs ${isActive ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 결과 화면 (대시보드) ──────────────────────────────────────────────────
  if (hasResult) {
    const rgMatchPct =
      resultRG && resultRG.resume_skills.length > 0
        ? Math.round((resultRG.verified_skills.length / resultRG.resume_skills.length) * 100)
        : null;

    const jgAvgScore = resultJG
      ? (() => {
          const successes = resultJG.matching.filter(
            (r): r is MatchingSuccess => r.status === "success",
          );
          return successes.length > 0
            ? Math.round(
                successes.reduce((sum, r) =>
                  sum + Math.min((r.confirmed_score + r.inferred_score), 100), 0
                ) / successes.length
              )
            : 0;
        })()
      : null;

    const jrScore = resultJR?.overall_score ?? null;

    const verifiedSkills = resultRG?.verified_skills ?? [];

    const allMissing = Array.from(new Set([
      ...(resultRG?.unverified_skills ?? []),
      ...(resultJR?.raw.missing_skills ?? []),
    ])).slice(0, 10);

    // 종합 점수: 성공한 분석들의 평균
    const availableScores = ([
      resultRG ? (rgMatchPct ?? 0) : null,
      resultJG ? (jgAvgScore ?? 0) : null,
      resultJR ? (jrScore ?? 0) : null,
    ] as (number | null)[]).filter((s): s is number => s !== null);
    const overallScore = availableScores.length > 0
      ? Math.round(availableScores.reduce((a, b) => a + b, 0) / availableScores.length)
      : null;
    const overallGrade = overallScore === null ? null
      : overallScore >= 80 ? { label: "우수", color: "#16A34A" }
      : overallScore >= 60 ? { label: "양호", color: "#F59E0B" }
      : overallScore >= 40 ? { label: "보통", color: "#F97316" }
      : { label: "미흡", color: "#EF4444" };

    const scoreColor = (val: number, hi: number, mid: number) =>
      val >= hi ? "#16A34A" : val >= mid ? "#F59E0B" : "#EF4444";

    return (
      <div className="max-w-[1200px] mx-auto pb-12">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 mb-1">종합 분석 결과</h1>
            <p className="text-xs text-zinc-500">이력서, GitHub, 채용공고를 종합적으로 분석한 결과입니다.</p>
          </div>
          <button
            onClick={() => { setHasResult(false); setStatusRG("idle"); setStatusJG("idle"); setStatusJR("idle"); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "#eaeaea", background: "#fafafa", color: "#555" }}
          >
            <RefreshCw size={12} /> 다시 분석하기
          </button>
        </div>

        {/* 종합 준비도 */}
        {overallScore !== null && overallGrade !== null && (
          <div className="bg-white rounded-2xl px-6 py-5 border mb-5 flex items-center gap-6"
            style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="shrink-0">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">종합 준비도</div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold" style={{ color: overallGrade.color }}>{overallScore}</span>
                <span className="text-sm font-bold mb-1" style={{ color: overallGrade.color }}>{overallGrade.label}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative w-full h-3 bg-zinc-100 rounded-full overflow-visible mb-1">
                <div className="h-3 rounded-full transition-all"
                  style={{ width: `${overallScore}%`, background: `linear-gradient(90deg, ${overallGrade.color}99, ${overallGrade.color})` }} />
                {[40, 60, 80].map((mark) => (
                  <div key={mark} className="absolute top-0 h-3 w-px bg-white opacity-80" style={{ left: `${mark}%` }} />
                ))}
              </div>
              <div className="relative w-full">
                {[{ v: 40, label: "보통" }, { v: 60, label: "양호" }, { v: 80, label: "우수" }].map(({ v, label }) => (
                  <div key={v} className="absolute text-[9px] text-zinc-400 -translate-x-1/2" style={{ left: `${v}%` }}>{label}</div>
                ))}
              </div>
              <div className="text-[10px] text-zinc-400 mt-4">{availableScores.length}개 분석 평균</div>
            </div>
          </div>
        )}

        {/* KPI 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                <Github size={14} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">이력서 × GitHub</div>
                <div className="text-[10px] text-zinc-400">기술 정합성</div>
              </div>
            </div>
            {resultRG ? (
              <>
                <div className="text-3xl font-extrabold mb-1" style={{ color: scoreColor(rgMatchPct ?? 0, 70, 40) }}>
                  {rgMatchPct ?? 0}%
                </div>
                <div className="text-[10px] text-zinc-500 mb-3">기술 일치율</div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${rgMatchPct ?? 0}%`, background: scoreColor(rgMatchPct ?? 0, 70, 40) }} />
                </div>
              </>
            ) : <div className="flex items-center gap-2 text-red-400 text-xs py-2"><AlertTriangle size={14} />분석 실패</div>}
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <BarChart2 size={14} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">채용공고 × GitHub</div>
                <div className="text-[10px] text-zinc-400">공고 기술 매칭</div>
              </div>
            </div>
            {resultJG ? (
              <>
                <div className="text-3xl font-extrabold mb-1" style={{ color: scoreColor(jgAvgScore ?? 0, 60, 30) }}>
                  {jgAvgScore ?? 0}%
                </div>
                <div className="text-[10px] text-zinc-500 mb-3">평균 매칭률</div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${jgAvgScore ?? 0}%`, background: scoreColor(jgAvgScore ?? 0, 60, 30) }} />
                </div>
              </>
            ) : <div className="flex items-center gap-2 text-red-400 text-xs py-2"><AlertTriangle size={14} />분석 실패</div>}
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#7C3AED" }}>
                <FileText size={14} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">채용공고 × 이력서</div>
                <div className="text-[10px] text-zinc-400">직무 적합도</div>
              </div>
            </div>
            {resultJR ? (
              <>
                <div className="text-3xl font-extrabold mb-1" style={{ color: scoreColor(jrScore ?? 0, 70, 50) }}>
                  {jrScore ?? 0}
                </div>
                <div className="text-[10px] text-zinc-500 mb-3">종합 점수</div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(jrScore ?? 0, 100)}%`, background: scoreColor(jrScore ?? 0, 70, 50) }} />
                </div>
              </>
            ) : <div className="flex items-center gap-2 text-red-400 text-xs py-2"><AlertTriangle size={14} />분석 실패</div>}
          </div>
        </div>

        {/* 핵심 인사이트 패널 */}
        {(verifiedSkills.length > 0 || allMissing.length > 0) && (
          <div className="bg-white rounded-2xl p-6 border mb-5" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-zinc-100">
              <Sparkles size={14} style={{ color: "#16A34A" }} />
              <h2 className="text-sm font-bold text-zinc-900 m-0">핵심 인사이트</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold mb-2.5" style={{ color: "#16A34A" }}>
                  <CheckCircle2 size={13} /> 검증된 기술
                </div>
                {verifiedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {verifiedSkills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>{s}</span>
                    ))}
                  </div>
                ) : <span className="text-xs text-zinc-400">-</span>}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold mb-2.5" style={{ color: "#EF4444" }}>
                  <XCircle size={13} /> 보완 필요 기술
                </div>
                {allMissing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allMissing.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : <span className="text-xs text-zinc-400">없음</span>}
              </div>
            </div>
          </div>
        )}

        {/* 세부 분석 상세 */}
        <h2 className="text-sm font-bold text-zinc-700 mb-4">세부 분석 결과</h2>

        {/* 이력서 × GitHub */}
        <div className="bg-white rounded-2xl border mb-4" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                <Github size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">이력서 × GitHub</div>
                <div className="text-[10px] text-zinc-400">기술 정합성 분석</div>
              </div>
            </div>
            <button onClick={() => setModalRG(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl"
              style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "white", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
              원본 화면 <ChevronRight size={13} />
            </button>
          </div>
          {resultRG ? (
            <div className="p-6">
              {resultRG.overall_evaluation && (
                <p className="text-sm text-zinc-600 leading-relaxed mb-5">{resultRG.overall_evaluation}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold mb-2" style={{ color: "#16A34A" }}>
                    <CheckCircle2 size={11} /> 검증된 기술 ({resultRG.verified_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultRG.verified_skills.length > 0 ? resultRG.verified_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold mb-2" style={{ color: "#F59E0B" }}>
                    <AlertCircle size={11} /> 미검증 기술 ({resultRG.unverified_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultRG.unverified_skills.length > 0 ? resultRG.unverified_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#FFF7ED", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold mb-2" style={{ color: "#2563EB" }}>
                    <Github size={11} /> GitHub 신규 발견 ({resultRG.newly_discovered_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultRG.newly_discovered_skills.length > 0 ? resultRG.newly_discovered_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
              </div>
              {(resultRG.supplement_advice || resultRG.update_suggestion) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resultRG.supplement_advice && (
                    <div className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">이력서 보완 권고</div>
                      <p className="text-xs text-zinc-700 leading-relaxed">{resultRG.supplement_advice}</p>
                    </div>
                  )}
                  {resultRG.update_suggestion && (
                    <div className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">업데이트 제안</div>
                      <p className="text-xs text-zinc-700 leading-relaxed">{resultRG.update_suggestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 text-xs p-6"><AlertTriangle size={14} />분석 실패</div>
          )}
        </div>

        {/* 채용공고 × GitHub */}
        <div className="bg-white rounded-2xl border mb-4" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <BarChart2 size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">채용공고 × GitHub</div>
                <div className="text-[10px] text-zinc-400">공고 기술 매칭 분석</div>
              </div>
            </div>
            <button onClick={() => setModalJG(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl"
              style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "white", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
              원본 화면 <ChevronRight size={13} />
            </button>
          </div>
          {resultJG ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">검증된 기술 스택</div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultJG.github.confirmed_skills.length > 0 ? resultJG.github.confirmed_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">LLM 기반 추정 기술 스택</div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultJG.github.inferred_skills.length > 0 ? resultJG.github.inferred_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)" }}>{s} · 추론</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
              </div>
              {resultJG.matching.filter((r): r is MatchingSuccess => r.status === "success").length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-3">공고별 매칭 결과</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resultJG.matching.filter((r): r is MatchingSuccess => r.status === "success").map((r) => {
                      const totalScore = Math.min(Math.round((r.confirmed_score + r.inferred_score) * 10) / 10, 100);
                      return (
                        <div key={r.url_index} className="rounded-xl p-4" style={{ border: "1px solid #eaeaea", background: "#fafafa" }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="text-xs font-bold text-zinc-900 truncate">{r.title || "제목 없음"}</div>
                              {r.company && <div className="text-[10px] text-zinc-500 mt-0.5">{r.company}{r.job_type ? ` · ${r.job_type}` : ""}</div>}
                            </div>
                            <div className="text-xl font-extrabold shrink-0"
                              style={{ color: totalScore >= 60 ? "#16A34A" : totalScore >= 30 ? "#2563EB" : "#DC2626" }}>
                              {totalScore}%
                            </div>
                          </div>
                          {(r.confirmed_matched.length > 0 || r.inferred_matched.length > 0) && (
                            <div className="mb-2">
                              <div className="text-[10px] text-zinc-400 mb-1">매칭 기술</div>
                              <div className="flex flex-wrap gap-1">
                                {r.confirmed_matched.map((s) => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                    style={{ background: "#F0FDF4", color: "#16A34A" }}>{s}</span>
                                ))}
                                {r.inferred_matched.map((s) => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                    style={{ background: "#EFF6FF", color: "#2563EB" }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {r.missing.length > 0 && (
                            <div>
                              <div className="text-[10px] text-zinc-400 mb-1">부족 기술</div>
                              <div className="flex flex-wrap gap-1">
                                {r.missing.map((s) => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                    style={{ background: "#FEF2F2", color: "#DC2626" }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {resultJG.matching.filter((r): r is MatchingFailed => r.status === "failed").map((r) => (
                <div key={r.url_index} className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mt-3">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-400" />
                  <span>공고 {r.url_index + 1}번 실패: {r.error}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 text-xs p-6"><AlertTriangle size={14} />분석 실패</div>
          )}
        </div>

        {/* 채용공고 × 이력서 */}
        <div className="bg-white rounded-2xl border mb-5" style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#7C3AED" }}>
                <FileText size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">채용공고 × 이력서</div>
                <div className="text-[10px] text-zinc-400">직무 적합도 분석</div>
              </div>
            </div>
            <button onClick={() => setModalJR(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl"
              style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "white", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
              원본 화면 <ChevronRight size={13} />
            </button>
          </div>
          {resultJR ? (
            <div className="p-6">
              {resultJR.raw.overall_evaluation && (
                <p className="text-sm text-zinc-600 leading-relaxed mb-5">{resultJR.raw.overall_evaluation}</p>
              )}
              {resultJR.metrics.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-3">지표별 점수</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resultJR.metrics.map((m) => (
                      <div key={m.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-700 font-medium">{m.label}</span>
                          <span className="text-xs font-extrabold"
                            style={{ color: m.score >= 70 ? "#16A34A" : m.score >= 50 ? "#F59E0B" : "#EF4444" }}>
                            {m.score}점
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-1">
                          <div className="h-1.5 rounded-full"
                            style={{ width: `${m.score}%`, background: m.score >= 70 ? "#16A34A" : m.score >= 50 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        {m.detail && <p className="text-[10px] text-zinc-400">{m.detail}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <div className="text-[10px] font-bold mb-2" style={{ color: "#16A34A" }}>매칭 기술</div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultJR.raw.matched_skills.length > 0 ? resultJR.raw.matched_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold mb-2" style={{ color: "#EF4444" }}>부족 기술</div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultJR.raw.missing_skills.length > 0 ? resultJR.raw.missing_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold mb-2 text-zinc-400">추가 보유 기술</div>
                  <div className="flex flex-wrap gap-1.5">
                    {resultJR.raw.extra_skills.length > 0 ? resultJR.raw.extra_skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#F4F4F5", color: "#71717A", border: "1px solid rgba(0,0,0,0.08)" }}>{s}</span>
                    )) : <span className="text-[11px] text-zinc-400">없음</span>}
                  </div>
                </div>
              </div>
              {resultJR.detail.job_comparisons.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-3">공고별 상세 비교</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resultJR.detail.job_comparisons.map((job, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ border: "1px solid #eaeaea", background: "#fafafa" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="text-xs font-bold text-zinc-900 truncate">{job.title || job.company || `공고 ${i + 1}`}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{job.company}{job.job_type ? ` · ${job.job_type}` : ""}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xl font-extrabold leading-none"
                              style={{ color: job.overall_score >= 80 ? "#16A34A" : job.overall_score >= 60 ? "#F59E0B" : job.overall_score >= 40 ? "#F97316" : "#EF4444" }}>
                              {job.overall_score}
                              <span className="text-xs font-normal text-zinc-400 ml-0.5">/ 100</span>
                            </div>
                            <div className="text-[10px] font-bold mt-0.5"
                              style={{ color: job.overall_score >= 80 ? "#16A34A" : job.overall_score >= 60 ? "#F59E0B" : job.overall_score >= 40 ? "#F97316" : "#EF4444" }}>
                              {job.overall_score >= 80 ? "우수" : job.overall_score >= 60 ? "양호" : job.overall_score >= 40 ? "보통" : "미흡"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 text-[10px] text-zinc-500 mb-3">
                          <span>기술 <strong style={{ color: "#1e293b" }}>{job.tech_score}</strong></span>
                          <span>도메인 <strong style={{ color: "#1e293b" }}>{job.domain_score}</strong></span>
                          <span>경력 <strong style={{ color: "#1e293b" }}>{job.career_score}</strong></span>
                        </div>
                        {job.matched_skills.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[10px] text-zinc-400 mb-1">매칭 기술</div>
                            <div className="flex flex-wrap gap-1">
                              {job.matched_skills.map((s) => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: "#F0FDF4", color: "#16A34A" }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {job.missing_skills.length > 0 && (
                          <div>
                            <div className="text-[10px] text-zinc-400 mb-1">부족 기술</div>
                            <div className="flex flex-wrap gap-1">
                              {job.missing_skills.map((s) => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: "#FEF2F2", color: "#DC2626" }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 text-xs p-6"><AlertTriangle size={14} />분석 실패</div>
          )}
        </div>

        {/* ── 모달: 이력서 × GitHub (채란님 화면 그대로) ──────────────────── */}
        {resultRG && (
          <ResumeGithubModal
            result={resultRG}
            githubUsername={githubUsername}
            isOpen={modalRG}
            onClose={() => setModalRG(false)}
          />
        )}

        {/* ── 모달: 채용공고 × GitHub (민정님 화면 그대로) ────────────────── */}
        {modalJG && resultJG && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalJG(false); }}>
            <div className="relative w-full max-w-[1100px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <h2 className="text-base font-extrabold text-zinc-900 m-0">채용공고 × GitHub 분석 상세 결과</h2>
                <button onClick={() => setModalJG(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border-0 cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.07)" }}>
                  <X size={15} className="text-zinc-600" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <JobGithubResultView result={resultJG} />
              </div>
            </div>
          </div>
        )}

        {/* ── 모달: 채용공고 × 이력서 (팀장님 화면 그대로) ───────────────── */}
        {modalJR && resultJR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalJR(false); }}>
            <div className="relative w-full max-w-[820px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <h2 className="text-base font-extrabold text-zinc-900 m-0">채용공고 × 이력서 분석 상세 결과</h2>
                <button onClick={() => setModalJR(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border-0 cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.07)" }}>
                  <X size={15} className="text-zinc-600" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-8" style={{ fontSize: "13.5px" }}>
                <LeancageResultView result={resultJR} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 입력 폼 ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* URL 입력 바 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-700 m-0">채용공고 URL 연동</h2>
          <span className="text-[10px] text-zinc-400 font-mono">최대 5개</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{ background: "#fafafa", borderColor: "#eaeaea" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#1a1a1a" }}>
              <Github size={14} className="text-white" />
            </div>
            <input
              type="text"
              className="border-0 outline-none text-xs font-semibold text-zinc-700 bg-transparent w-36"
              placeholder="GitHub 아이디 입력"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center bg-white rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{ border: "2px solid #e5e5e5", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = "#16A34A"; }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              e.currentTarget.style.borderColor = "#e5e5e5";
          }}>
          <Search size={16} className="text-zinc-400 shrink-0 mr-3" />
          <input
            type="url"
            className="flex-grow border-0 outline-none text-sm text-zinc-900 bg-transparent py-1"
            placeholder="채용공고 URL을 입력하세요 (예: https://www.jobkorea.co.kr/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRegisterUrl(); } }}
          />
          <button type="button" onClick={handleRegisterUrl}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-1.5 px-4 rounded-xl shrink-0 ml-3"
            style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
            <Plus size={13} /> 등록
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-5">
          <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* 2컬럼: 채용공고 목록 | 이력서 업로드 */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl p-5 border h-full"
            style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
              <Search size={14} style={{ color: "#16A34A" }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">등록된 채용공고</h3>
              <span className="text-[10px] text-zinc-400 font-mono ml-1">({registeredUrls.length}/5)</span>
            </div>
            {registeredUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search size={28} className="text-zinc-200 mb-3" />
                <p className="text-xs text-zinc-400">위 입력창에 채용공고 URL을 입력하고<br />등록 버튼을 눌러주세요.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {registeredUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border group transition-colors"
                    style={{ borderColor: "#eaeaea", background: "#fafafa" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                      {i + 1}
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-xs text-zinc-700 hover:underline truncate flex items-center gap-1 min-w-0">
                      <ExternalLink size={10} className="shrink-0 text-zinc-400" />
                      <span className="truncate">{url}</span>
                    </a>
                    <button onClick={() => handleRemoveUrl(i)}
                      className="p-1 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-400 transition-colors border-0 bg-transparent cursor-pointer shrink-0 opacity-0 group-hover:opacity-100">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl p-4 border h-full flex flex-col gap-3"
            style={{ borderColor: "#eaeaea", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <FileText size={14} style={{ color: "#16A34A" }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">이력서 업로드</h3>
            </div>

            <div>
              <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf"
                onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                className="hidden" />
              <div
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-150"
                style={{
                  border: `1.5px dashed ${isDragActive ? "#16A34A" : fileInfo ? "#10b981" : "#d1d5db"}`,
                  background: isDragActive ? "#F0FDF4" : fileInfo ? "#f0fdf4" : "#fafafa",
                }}>
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

            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">이력서 텍스트</label>
                {originalResumeText && resumeText !== originalResumeText && (
                  <button type="button" onClick={() => setResumeText(originalResumeText)}
                    className="text-[11px] border-0 bg-transparent cursor-pointer p-0" style={{ color: "#16A34A" }}>
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

      <div className="flex justify-center mt-4 mb-2">
        <button type="button" onClick={handleStartAnalysis}
          className="flex items-center gap-3 text-white font-bold rounded-2xl transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
            boxShadow: "0 6px 24px rgba(22,163,74,0.4)",
            fontSize: "1.125rem",
            padding: "0.875rem 3.75rem",
          }}>
          <Sparkles size={22} /> 분석 시작하기
        </button>
      </div>
    </div>
  );
}
