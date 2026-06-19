import React, { useState } from "react";
import {
  Sparkles,
  Github,
  AlertTriangle,
  Code2,
  Plus,
  Trash2,
  Building2,
  Briefcase,
  Layers,
  Search,
  ExternalLink,
  FileCheck,
  BarChart2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  api,
  CrawlResult,
  CrawlSuccess,
  CrawlFailed,
  GithubPreviewResponse,
} from "../utils/api";

export default function Analysistest() {
  const [githubUsername, setGithubUsername] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [registeredUrls, setRegisteredUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<CrawlResult[] | null>(null);
  const [githubResult, setGithubResult] =
    useState<GithubPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── URL 등록 ──────────────────────────────────────────
  const handleRegisterUrl = () => {
    if (!urlInput.trim()) return;
    if (registeredUrls.length >= 5) {
      setError("최대 5개까지 등록 가능합니다.");
      return;
    }
    setRegisteredUrls([...registeredUrls, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemoveRegistered = (i: number) => {
    setRegisteredUrls(registeredUrls.filter((_, idx) => idx !== i));
  };

  // ── 분석 시작 ─────────────────────────────────────────
  const handleStartAnalysis = async () => {
    if (!githubUsername.trim()) {
      setError("GitHub 아이디를 입력해주세요.");
      return;
    }
    if (registeredUrls.length === 0) {
      setError("최소 하나의 채용공고 URL을 등록해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setGithubResult(null);

    setLoadingStep(1);
    const stepIntervals = [
      setTimeout(() => setLoadingStep(2), 1200),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3600),
    ];

    try {
      const [crawlData, githubData] = await Promise.all([
        api.crawlJobs(registeredUrls),
        api.getGithubPreview(githubUsername),
      ]);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setResults(crawlData.results);
      setGithubResult(githubData);
    } catch (err: any) {
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // ── 로딩 화면 ─────────────────────────────────────────
  if (loading) {
    const steps = [
      "GitHub 기술스택 분석 중...",
      "채용공고 크롤링 중...",
      "기술스택 키워드 추출 중...",
      "결과 정리 중...",
    ];

    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="animate-spin rounded-full border-[3px] h-12 w-12"
            style={{ borderColor: "#F0FDF4", borderTopColor: "#16A34A" }}
          />
          <Sparkles
            size={18}
            className="absolute"
            style={{ color: "#16A34A" }}
          />
        </div>
        <h2 className="text-xl font-bold mb-2 text-zinc-900">분석 중</h2>
        <p className="text-sm text-zinc-500 mb-8">
          GitHub와 채용공고를 분석하고 있습니다.
        </p>
        <div className="w-full bg-white border border-zinc-100 rounded-2xl p-5 text-left shadow-sm">
          {steps.map((step, idx) => {
            const done = loadingStep > idx + 1;
            const cur = loadingStep === idx + 1;
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
                <span
                  className={`text-xs ${
                    cur ? "font-semibold text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 결과 화면 ─────────────────────────────────────────
  if (results) {
    const successResults = results.filter(
      (r): r is CrawlSuccess => r.status === "success",
    );
    const failedResults = results.filter(
      (r): r is CrawlFailed => r.status === "failed",
    );

    return (
      <div className="max-w-[1200px] mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">분석 결과</h1>
          <button
            onClick={() => {
              setResults(null);
              setGithubResult(null);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: "#eaeaea",
              background: "#fafafa",
              color: "#555",
            }}
          >
            ← 다시 분석하기
          </button>
        </div>

        {/* GitHub 기술스택 */}
        {githubResult && (
          <div
            className="bg-white rounded-2xl p-5 border mb-6"
            style={{
              borderColor: "#eaeaea",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "#1a1a1a" }}
              >
                <Github size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">
                GitHub 기술스택 — @{githubResult.username}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* confirmed */}
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                  확인된 기술
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {githubResult.confirmed_skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "#F0FDF4",
                        color: "#16A34A",
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* inferred */}
              {githubResult.inferred_skills.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                    추론된 기술
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {githubResult.inferred_skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid rgba(37,99,235,0.2)",
                        }}
                      >
                        {skill} · 추론
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 실패 공고 */}
        {failedResults.length > 0 && (
          <div className="mb-4">
            {failedResults.map((r) => (
              <div
                key={r.url_index}
                className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-2"
              >
                <AlertTriangle
                  size={13}
                  className="shrink-0 mt-0.5 text-red-400"
                />
                <span>
                  공고 {r.url_index + 1}번 크롤링 실패: {r.error}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 성공 공고 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {successResults.map((r) => (
            <div
              key={r.url_index}
              className="bg-white rounded-2xl p-5 border"
              style={{
                borderColor: "#eaeaea",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {r.title || "제목 없음"}
                  </h3>
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full shrink-0 font-mono">
                    #{r.url_index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
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

              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  <Layers size={12} /> 기술스택
                </span>
                {r.tech_stack.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {r.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid rgba(37,99,235,0.15)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    기술스택을 추출하지 못했습니다.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 입력 폼 ───────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* URL 입력 + GitHub 아이디 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-700 m-0">
            채용공고 URL 연동
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">최대 5개</span>
          <div className="flex-1" />
          {/* GitHub 아이디 입력 */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{ background: "#fafafa", borderColor: "#eaeaea" }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#1a1a1a" }}
            >
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

        {/* URL 입력창 */}
        <div
          className="flex items-center bg-white rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{
            border: "2px solid #e5e5e5",
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "#16A34A";
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              e.currentTarget.style.borderColor = "#e5e5e5";
            }
          }}
        >
          <Search size={16} className="text-zinc-400 shrink-0 mr-3" />
          <input
            type="url"
            className="flex-grow border-0 outline-none text-sm text-zinc-900 bg-transparent py-1"
            placeholder="채용공고 URL을 입력하세요 (예: https://www.jobkorea.co.kr/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRegisterUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleRegisterUrl}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-1.5 px-4 rounded-xl shrink-0 ml-3 transition-all duration-150"
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

      {/* 등록된 채용공고 */}
      <div
        className="bg-white rounded-2xl p-5 border mb-6"
        style={{
          borderColor: "#eaeaea",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
          <FileCheck size={15} style={{ color: "#16A34A" }} />
          <h3 className="text-sm font-bold text-zinc-900 m-0">
            등록된 채용공고
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono ml-1">
            ({registeredUrls.length}/5)
          </span>
        </div>

        {registeredUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search size={28} className="text-zinc-200 mb-3" />
            <p className="text-xs text-zinc-400">
              위 입력창에 채용공고 URL을 입력하고
              <br />
              등록 버튼을 눌러주세요.
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
                  style={{
                    background: "linear-gradient(135deg, #16A34A, #22C55E)",
                  }}
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

      {/* 분석 버튼 */}
      <div className="flex justify-center mt-4 mb-2">
        <button
          type="button"
          onClick={handleStartAnalysis}
          className="flex items-center gap-3 text-white font-bold rounded-2xl transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
            boxShadow: "0 6px 24px rgba(22,163,74,0.4)",
            fontSize: "1.125rem",
            padding: "0.875rem 3.75rem",
          }}
        >
          <Sparkles size={22} /> 분석 시작하기
        </button>
      </div>
    </div>
  );
}
