import React, { useState, useRef } from "react";
import {
  Sparkles,
  Github,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  FileCheck,
  Activity,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  FolderOpen,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  BarChart2,
  ArrowRight,
} from "lucide-react";
import { api, UnifiedAnalysisResponse, UserProfile } from "../utils/api";

interface AnalysisProps {
  user?: UserProfile | null;
  setCurrentPage?: (page: string) => void;
}

export default function Analysis({ user, setCurrentPage }: AnalysisProps) {
  const [resumeText, setResumeText] = useState("");
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [jobUrls, setJobUrls] = useState<string[]>([""]);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<UnifiedAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [resumeValidation, setResumeValidation] = useState<{
    valid: boolean;
    reason: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  // 등록된 채용공고
  const [registeredUrls, setRegisteredUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  // FileUpload inline state
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadFileRef = useRef<HTMLInputElement>(null);

  const githubUsername = user?.github_username || "";

  // ── 채용공고 URL 등록 ──────────────────────────────────
  const handleRegisterUrl = () => {
    if (!urlInput.trim()) return;
    if (registeredUrls.length >= 5) { setError("최대 5개까지 등록 가능합니다."); return; }
    setRegisteredUrls([...registeredUrls, urlInput.trim()]);
    setUrlInput("");
  };
  const handleRemoveRegistered = (i: number) => {
    setRegisteredUrls(registeredUrls.filter((_, idx) => idx !== i));
  };

  // ── 불러오기 / 저장하기 ────────────────────────────────
  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.registeredUrls) setRegisteredUrls(data.registeredUrls);
        if (data.resumeText) { setResumeText(data.resumeText); setResumeValidation(null); }
        setSaveNotice("불러오기 완료!");
      } catch {
        setSaveNotice("파일 형식 오류");
      }
      setTimeout(() => setSaveNotice(null), 2000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveFile = () => {
    const data = JSON.stringify({ registeredUrls, resumeText }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analysis_data.json"; a.click();
    URL.revokeObjectURL(url);
    setSaveNotice("저장되었습니다.");
    setTimeout(() => setSaveNotice(null), 2000);
  };

  // ── 이력서 검증 ───────────────────────────────────────
  const validateResumeText = async (text: string) => {
    if (!text.trim()) { setResumeValidation(null); return; }
    setValidating(true);
    try {
      const res = await fetch("http://localhost:8000/api/validate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResumeValidation(data);
    } catch {
      setResumeValidation(null);
    } finally {
      setValidating(false);
    }
  };

  // ── 파일 업로드 (인라인 compact) ──────────────────────
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
          const res = await fetch("http://localhost:8000/api/parse-resume", { method: "POST", body: fd });
          if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || "PDF 추출 실패"); }
          const data = await res.json();
          setResumeText(data.text);
          setOriginalResumeText(data.text);
          setResumeValidation(null);
          validateResumeText(data.text);
        } catch (e: any) {
          setFileError(e.message || "PDF 추출 오류");
          setFileInfo(null);
        } finally { setExtracting(false); }
      })();
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result && typeof ev.target.result === "string") {
        setResumeText(ev.target.result);
        setOriginalResumeText(ev.target.result);
        setResumeValidation(null);
        validateResumeText(ev.target.result);
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  // ── 채용공고 URL ───────────────────────────────────────
  const handleAddJobUrl = () => { if (jobUrls.length < 5) setJobUrls([...jobUrls, ""]); };
  const handleRemoveJobUrl = (i: number) => { if (jobUrls.length > 1) setJobUrls(jobUrls.filter((_, idx) => idx !== i)); };
  const handleUpdateJobUrl = (i: number, v: string) => { const u = [...jobUrls]; u[i] = v; setJobUrls(u); };

  // ── 분석 시작 ─────────────────────────────────────────
  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername) {
      setError("GitHub 계정이 설정되지 않았습니다. 마이페이지에서 GitHub 계정명을 먼저 등록해주세요.");
      return;
    }
    if (!resumeText.trim()) { setError("이력서 텍스트를 입력하거나 파일을 업로드해 주세요."); return; }
    const filteredJobs = registeredUrls.filter((u) => u.trim());
    if (filteredJobs.length === 0) { setError("채용공고 URL을 최소 하나 입력해주세요."); return; }

    setValidating(true);
    let validation = resumeValidation;
    try {
      const res = await fetch("http://localhost:8000/api/validate-resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });
      validation = await res.json();
      setResumeValidation(validation);
    } catch { /* 네트워크 오류 시 통과 */ } finally { setValidating(false); }
    if (validation && !validation.valid) return;

    setLoading(true); setError(null); setResult(null);
    setLoadingStep(1);
    const timers = [
      setTimeout(() => setLoadingStep(2), 1200),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3600),
    ];
    try {
      const data = await api.analyzeUnified(`https://github.com/${githubUsername}`, resumeText, filteredJobs);
      await new Promise((r) => setTimeout(r, 4000));
      setResult(data);
    } catch (err: any) {
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    const steps = [
      "GitHub 레포지토리 정보 및 소스코드 품질 스캔 중...",
      "이력서 기재 기술과 깃허브 코드 구현 상호 대조 중...",
      "채용 요구사항 기반 핵심 역량 Gap 분석 중...",
      "부족 스택 극복을 위한 맞춤형 프로젝트 설계 및 로드맵 도출 중...",
    ];
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="animate-spin rounded-full border-[3px] h-12 w-12"
            style={{ borderColor: '#F0FDF4', borderTopColor: '#16A34A' }}
          />
          <Sparkles size={18} className="absolute" style={{ color: '#16A34A' }} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-zinc-900">AI 커리어 코파일럿 진단 중</h2>
        <p className="text-sm text-zinc-500 mb-8">
          사용자의 코드 데이터와 이력서를 정밀 분석하여 맞춤형 커리어 레포트를 생성하고 있습니다.
        </p>
        <div className="w-full bg-white border border-zinc-100 rounded-2xl p-5 text-left shadow-sm">
          {steps.map((step, idx) => {
            const done = loadingStep > idx + 1;
            const cur = loadingStep === idx + 1;
            return (
              <div key={idx} className={`flex items-center gap-3 mb-3.5 transition-opacity duration-300 ${done || cur ? "opacity-100" : "opacity-35"}`}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-white"
                  style={{
                    background: done
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : cur
                      ? 'linear-gradient(135deg, #16A34A, #22C55E)'
                      : '#e5e5e5',
                    color: done || cur ? 'white' : '#999',
                  }}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span className={`text-xs ${cur ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 결과 렌더 (왼쪽 컬럼 안에서) ─────────────────────
  const ResultView = ({ r }: { r: UnifiedAnalysisResponse }) => {
    const { portfolio_rating, overall_match_pct, skill_match_pct, active_weeks, total_commits, repo_coverage_pct, repo_count, comparison_result, github_analysis, resume_analysis, skill_gap, recommended_projects } = r;
    const ai_comment = comparison_result?.ai_comment ?? "";

    const MetricBar = ({ pct, color }: { pct: number; color: string }) => (
      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden mt-2">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    );

    return (
      <div className="flex flex-col gap-5">
        {/* 헤더: 전체 매칭 비율 */}
        <div className="rounded-2xl px-5 py-4 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="72" height="72" viewBox="0 0 36 36">
              <path className="fill-none stroke-white/10 stroke-[3]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="fill-none stroke-linecap-round transition-all duration-700"
                style={{ stroke: '#22C55E', strokeWidth: '3', strokeDasharray: `${overall_match_pct}, 100` }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[13px] font-extrabold text-white">{overall_match_pct}%</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-0.5">전체 매칭 비율</div>
            <div className="text-lg font-extrabold text-white leading-none mb-1">{portfolio_rating}</div>
            <div className="text-[10px] text-zinc-500">기술일치 · 커밋활동 · 레포커버리지 각 33.3% 동일 가중치</div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition border border-white/10 shrink-0"
          >
            다시 분석
          </button>
        </div>

        {/* AI 총평 */}
        {ai_comment && (
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: '#16A34A' }} />
              <span className="text-[11px] font-bold text-zinc-600">AI 분석 총평</span>
              <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">GPT-4o-mini</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed m-0">{ai_comment}</p>
          </div>
        )}

        {/* 3개 지표 카드 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 기술스택 일치도 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={14} style={{ color: '#16A34A' }} />
              <span className="text-[11px] font-bold text-zinc-600">기술스택 일치도</span>
              <span className="ml-auto text-[10px] text-zinc-400">가중치 33.3%</span>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900">{skill_match_pct}<span className="text-sm font-semibold text-zinc-400">%</span></div>
            <MetricBar pct={skill_match_pct} color="#16A34A" />
            <p className="text-[10px] text-zinc-400 mt-2 m-0">GitHub 기술 ↔ 이력서 기술 일치율</p>
          </div>

          {/* 깃 커밋 활동 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} style={{ color: '#2563EB' }} />
              <span className="text-[11px] font-bold text-zinc-600">깃 커밋 활동</span>
              <span className="ml-auto text-[10px] text-zinc-400">가중치 33.3%</span>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900">{active_weeks}<span className="text-sm font-semibold text-zinc-400"> / 52주</span></div>
            <MetricBar pct={Math.round(active_weeks / 52 * 100)} color="#2563EB" />
            <p className="text-[10px] text-zinc-400 mt-2 m-0">총 커밋 {total_commits}회 · 최근 52주 활동</p>
          </div>

          {/* 레포 기술 커버리지 */}
          <div className="card col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck size={14} style={{ color: '#D97706' }} />
              <span className="text-[11px] font-bold text-zinc-600">레포 기술 커버리지</span>
              <span className="ml-auto text-[10px] text-zinc-400">가중치 33.3%</span>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900">{repo_coverage_pct}<span className="text-sm font-semibold text-zinc-400">%</span></div>
            <MetricBar pct={repo_coverage_pct} color="#D97706" />
            <p className="text-[10px] text-zinc-400 mt-2 m-0">이력서 기술이 사용된 레포 비율</p>
          </div>

        </div>

        {/* GitHub Analysis */}
        <div className="card">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
            <div className="flex items-center gap-2 text-zinc-900">
              <Github size={16} />
              <h2 className="text-sm font-bold">GitHub 포트폴리오 분석</h2>
            </div>
            <span className="badge badge-info">{github_analysis.repo_count}개 레포 스캔</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-zinc-50 rounded-lg p-3">
              <span className="text-[10px] text-zinc-400 block mb-1">분석 레포</span>
              <span className="text-xs font-semibold text-zinc-900">{github_analysis.repo_count}개</span>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <span className="text-[10px] text-zinc-400 block mb-1">총 커밋 수</span>
              <span className="text-xs font-semibold text-zinc-900">{github_analysis.total_commits}회</span>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <span className="text-[10px] text-zinc-400 block mb-1">README 상태</span>
              <span className="text-xs font-semibold text-zinc-900">{github_analysis.readme_quality}</span>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <span className="text-[10px] text-zinc-400 block mb-1">프로젝트 완성도</span>
              <span className="text-xs font-semibold text-zinc-900">{github_analysis.project_completeness}</span>
            </div>
          </div>
          <div className="mb-4">
            <span className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wide">감지된 기술 스택</span>
            <div className="flex flex-wrap gap-1.5">
              {github_analysis.tech_stack.map((t) => <span key={t} className="badge badge-info">{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {github_analysis.repo_details.map((repo) => (
              <div key={repo.url} className="border border-zinc-100 rounded-xl p-3 hover:border-zinc-200 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-zinc-900 inline-flex items-center gap-1 hover:underline">
                    {repo.name} <ExternalLink size={11} />
                  </a>
                  <span className="badge badge-success">{repo.quality_score}점</span>
                </div>
                {repo.description && (
                  <p className="text-[11px] text-zinc-500 m-0 mb-1.5">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                  <span>⭐ {repo.stars}</span>
                  <span>커밋 {repo.commit_count}회</span>
                  <span className="font-mono">{repo.primary_language}</span>
                  <span className={`${repo.readme_status.startsWith("미흡") ? "text-red-400" : repo.readme_status === "보통" ? "text-amber-400" : "text-emerald-500"}`}>
                    README {repo.readme_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {github_analysis.readme_suggestions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-50">
              <span className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wide">README 개선 제안</span>
              {github_analysis.readme_suggestions.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs text-zinc-600 leading-relaxed mb-1.5">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume Analysis */}
        <div className="card">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-zinc-900" />
              <h2 className="text-sm font-bold text-zinc-900">이력서 검증 결과</h2>
            </div>
            <span className="badge badge-success">일치율 {resume_analysis.tech_stack_matching}%</span>
          </div>
          <div className="bg-zinc-50 rounded-xl p-3 flex gap-3 items-start mb-4">
            <span className="text-lg">📄</span>
            <div>
              <h4 className="m-0 text-xs font-bold text-zinc-900 mb-0.5">이력서 품질 코멘트</h4>
              <p className="m-0 text-[11px] text-zinc-500 leading-relaxed">{resume_analysis.resume_quality}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold mb-1.5 block text-emerald-600">✓ 교차 검증 성공</span>
              <div className="flex flex-wrap gap-1.5">
                {resume_analysis.verified_skills.map((s) => <span key={s} className="badge badge-success">{s}</span>)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold mb-1.5 block text-amber-600">✗ 코드 증명 필요</span>
              <div className="flex flex-wrap gap-1.5">
                {resume_analysis.unverified_skills.length > 0
                  ? resume_analysis.unverified_skills.map((s) => <span key={s} className="badge badge-warning">{s}</span>)
                  : <span className="text-xs text-zinc-400 italic">모두 검증됨</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-zinc-900" />
            <h2 className="text-sm font-bold text-zinc-900">역량 Gap & 보완 로드맵</h2>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
            <span className="block text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-wide">미보유 보완 기술</span>
            <div className="flex flex-wrap gap-1.5">
              {skill_gap.missing_technologies.map((t) => <span key={t} className="badge badge-danger">{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {skill_gap.learning_roadmap.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
                >{i + 1}</div>
                <span className="text-xs text-zinc-600 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Projects */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#16A34A' }} />
            <h2 className="text-sm font-bold text-zinc-900">커리어 보완 추천 프로젝트</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">부족 스택을 이력서에 증빙할 수 있도록 설계된 맞춤 프로젝트 추천입니다.</p>
          <div className="flex flex-col gap-4">
            {recommended_projects.map((proj, i) => (
              <div key={i} className="border border-zinc-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-sm font-bold text-zinc-900 m-0">{proj.title}</h4>
                  <span className={`badge ${proj.difficulty.includes("Hard") || proj.difficulty.includes("상") ? "badge-danger" : "badge-warning"}`}>{proj.difficulty}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed m-0 mb-3">{proj.description}</p>
                <div className="flex flex-col gap-1 text-[11px] text-zinc-600 mb-3">
                  <div className="bg-zinc-50 rounded px-2 py-1"><strong>기술:</strong> {proj.technologies.join(", ")}</div>
                  <div className="bg-zinc-50 rounded px-2 py-1"><strong>보완:</strong> {proj.missing_skills_covered.join(", ")}</div>
                </div>
                <div className="bg-white border border-zinc-100 rounded-lg py-2 px-3 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 mb-1">
                    <BookOpen size={11} /><span>아키텍처 가이드</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed m-0">{proj.architecture}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-green-700 font-semibold">
                  <TrendingUp size={11} className="text-green-500" />
                  <span>{proj.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Empty placeholder ─────────────────────────────────
  const EmptyPlaceholder = () => (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center py-16 px-8"
      style={{ borderColor: 'rgba(22,163,74,0.15)', background: 'linear-gradient(160deg, #fff8f7, #ffffff)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, #F0FDF4, #FFF8F1)', border: '1px solid rgba(22,163,74,0.15)' }}
      >
        <BarChart2 size={24} style={{ color: '#16A34A' }} />
      </div>
      <h3 className="text-sm font-bold text-zinc-700 mb-2">분석 결과가 여기에 표시됩니다</h3>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
        채용공고 URL을 입력하고 이력서를 등록한 뒤<br />
        <strong style={{ color: '#16A34A' }}>분석 시작</strong> 버튼을 눌러주세요.
      </p>
      <div className="flex items-center gap-2 mt-6 text-[11px] text-zinc-400">
        <ArrowRight size={12} />
        <span>우측에서 이력서를 먼저 업로드하세요</span>
      </div>
    </div>
  );

  // ── Main Layout ────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto">

      {/* ── Top: 채용공고 URL 입력 + GitHub 아이콘 ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: '#16A34A' }} />
          <h2 className="text-sm font-bold text-zinc-700 m-0">채용공고 URL 연동</h2>
          <span className="text-[10px] text-zinc-400 font-mono">최대 5개</span>
          <div className="flex-1" />
          {/* GitHub 아이콘 */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{ background: '#fafafa', borderColor: '#eaeaea' }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1a1a1a' }}>
              <Github size={14} className="text-white" />
            </div>
            {githubUsername ? (
              <a href={githubUsername ? `https://github.com/${githubUsername}` : "#"} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-zinc-700 hover:underline flex items-center gap-1">
                @{githubUsername}<ExternalLink size={10} className="text-zinc-400" />
              </a>
            ) : (
              <span className="text-xs text-zinc-400">GitHub 미연동</span>
            )}
            {setCurrentPage && (
              <button onClick={() => setCurrentPage('mypage')}
                className="text-[10px] font-semibold px-2 py-0.5 rounded border-0 cursor-pointer"
                style={{ background: '#F0FDF4', color: '#16A34A' }}>
                {githubUsername ? '변경' : '설정'}
              </button>
            )}
          </div>
        </div>

        {/* URL 입력 + 등록 버튼 */}
        <div
          className="flex items-center bg-white rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{ border: '2px solid #e5e5e5', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(22,163,74,0.14)'; }}
          onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; } }}
        >
          <Search size={16} className="text-zinc-400 shrink-0 mr-3" />
          <input
            type="url"
            className="flex-grow border-0 outline-none text-sm text-zinc-900 bg-transparent py-1"
            placeholder="채용공고 URL을 입력하세요 (예: https://toss.im/career/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRegisterUrl(); } }}
          />
          <button
            type="button"
            onClick={handleRegisterUrl}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-1.5 px-4 rounded-xl shrink-0 ml-3 transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
          >
            <Plus size={13} />
            <span>등록</span>
          </button>
        </div>

        {/* 불러오기 / 저장하기 (URL 박스 바깥) */}
        <div className="flex items-center gap-2 mt-2">
          {saveNotice && (
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> {saveNotice}
            </span>
          )}
          <input ref={loadFileRef} type="file" accept=".json" onChange={handleLoadFile} className="hidden" />
          <button
            type="button"
            onClick={() => loadFileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3.5 rounded-lg cursor-pointer transition-all duration-150 border"
            style={{ background: '#F0FDF4', borderColor: 'rgba(22,163,74,0.2)', color: '#16A34A' }}
          >
            <FolderOpen size={12} /> 불러오기
          </button>
          <button
            type="button"
            onClick={handleSaveFile}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3.5 rounded-lg cursor-pointer transition-all duration-150 border"
            style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)', borderColor: 'transparent', color: '#ffffff', boxShadow: '0 2px 6px rgba(22,163,74,0.25)' }}
          >
            <Save size={12} /> 저장하기
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-5">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-12 gap-6 items-stretch">

        {/* ── Left: 등록된 채용공고 ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <div
            className="bg-white rounded-2xl p-5 border flex flex-col gap-3 flex-1"
            style={{ borderColor: '#eaeaea', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
              <FileCheck size={15} style={{ color: '#16A34A' }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">등록된 채용공고</h3>
              <span className="text-[10px] text-zinc-400 font-mono ml-1">({registeredUrls.length}/5)</span>
            </div>

            {registeredUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                <Search size={28} className="text-zinc-200 mb-3" />
                <p className="text-xs text-zinc-400">위 입력창에 채용공고 URL을 입력하고<br/>등록 버튼을 눌러주세요.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {registeredUrls.map((url, i) => (
                  <div key={i}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 border group transition-colors"
                    style={{ borderColor: '#eaeaea', background: '#fafafa' }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                      {i + 1}
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-xs text-zinc-700 hover:text-zinc-900 hover:underline truncate flex items-center gap-1 min-w-0">
                      <ExternalLink size={10} className="shrink-0 text-zinc-400" />
                      <span className="truncate">{url}</span>
                    </a>
                    <button
                      onClick={() => handleRemoveRegistered(i)}
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

        {/* ── Right: 이력서 업로드 ── */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <div
            className="bg-white rounded-2xl p-4 border flex flex-col gap-3 flex-1"
            style={{ borderColor: '#eaeaea', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <FileText size={14} style={{ color: '#16A34A' }} />
              <h3 className="text-sm font-bold text-zinc-900 m-0">이력서 업로드</h3>
            </div>

            {/* File Upload */}
            <div>
              <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf" onChange={handleFileChange} className="hidden" />
              <div
                onDragEnter={handleFileDrag} onDragOver={handleFileDrag}
                onDragLeave={handleFileDrag} onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-150"
                style={{
                  border: `1.5px dashed ${isDragActive ? '#16A34A' : fileInfo ? '#10b981' : '#d1d5db'}`,
                  background: isDragActive ? '#F0FDF4' : fileInfo ? '#f0fdf4' : '#fafafa',
                }}
              >
                {extracting ? (
                  <><Loader2 size={16} className="animate-spin shrink-0" style={{ color: '#16A34A' }} />
                  <div><div className="text-xs font-semibold text-zinc-700">PDF 추출 중...</div>
                  <div className="text-[10px] text-zinc-400">잠시만 기다려주세요</div></div></>
                ) : fileInfo ? (
                  <><CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-green-700 truncate">{fileInfo.name}</div>
                    <div className="text-[10px] text-zinc-400">{fileInfo.size} · 클릭하여 변경</div>
                  </div></>
                ) : (
                  <><Upload size={16} className="text-zinc-400 shrink-0" />
                  <div><div className="text-xs font-semibold text-zinc-700">파일 등록 (PDF/TXT/MD)</div>
                  <div className="text-[10px] text-zinc-400">드래그 또는 클릭</div></div></>
                )}
              </div>
              {fileError && (
                <div className="flex items-center gap-1.5 mt-1 text-red-500 text-[11px]">
                  <AlertCircle size={11} /><span>{fileError}</span>
                </div>
              )}
            </div>

            {/* Resume Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">이력서 텍스트</label>
                {originalResumeText && resumeText !== originalResumeText && (
                  <button type="button" onClick={() => setResumeText(originalResumeText)}
                    className="text-[11px] border-0 bg-transparent cursor-pointer p-0" style={{ color: '#16A34A' }}>
                    원본으로 초기화
                  </button>
                )}
              </div>
              <textarea
                className={`form-textarea text-xs! leading-relaxed ${
                  resumeValidation && !resumeValidation.valid ? "border-red-400"
                  : resumeValidation?.valid ? "border-green-400" : ""
                }`}
                style={{ minHeight: '160px', maxHeight: '300px' }}
                placeholder="이력서 파일 업로드 시 자동으로 채워집니다..."
                value={resumeText}
                onChange={(e) => { setResumeText(e.target.value); setResumeValidation(null); }}
                onBlur={(e) => { if (e.target.value.trim()) validateResumeText(e.target.value); }}
              />
              {validating && (
                <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> 이력서 확인 중...
                </p>
              )}
              {!validating && resumeValidation && !resumeValidation.valid && (
                <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-2.5 text-red-800 text-xs">
                  <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{resumeValidation.reason}</span>
                </div>
              )}
              {!validating && resumeValidation?.valid && (
                <div className="flex gap-2 bg-green-50 border border-green-100 rounded-xl p-2.5 text-green-800 text-xs">
                  <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                  <span>이력서 내용이 확인되었습니다.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 분석 시작하기 버튼 ── */}
      <div className="flex justify-center mt-8 mb-2">
        <button
          type="button"
          onClick={handleStartAnalysis}
          className="flex items-center gap-3 text-white font-bold rounded-2xl transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
            boxShadow: '0 6px 24px rgba(22,163,74,0.4)',
            fontSize: '1.125rem',
            padding: '0.875rem 3.75rem',
          }}
        >
          <Sparkles size={22} />
          분석 시작하기
        </button>
      </div>
    </div>
  );
}
