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
  const [jobUrls, setJobUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<CrawlResult[] | null>(null);
  const [githubResult, setGithubResult] =
    useState<GithubPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddJobUrl = () => {
    if (jobUrls.length < 5) {
      setJobUrls([...jobUrls, ""]);
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

    if (!githubUsername.trim()) {
      setError("GitHub 아이디를 입력해주세요.");
      return;
    }

    const filteredJobs = jobUrls.filter((url) => url.trim() !== "");
    if (filteredJobs.length === 0) {
      setError("최소 하나의 채용공고 URL을 입력해주세요.");
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
      // crawlJobs + getGithubPreview 병렬 호출
      const [crawlData, githubData] = await Promise.all([
        api.crawlJobs(filteredJobs),
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

  // ── 로딩 화면 ────────────────────────────────────────────────────────
  if (loading) {
    const steps = [
      "GitHub 기술스택 분석 중...",
      "채용공고 크롤링 중...",
      "기술스택 키워드 추출 중...",
      "결과 정리 중...",
    ];

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900 h-10 w-10"></div>
          <Sparkles size={18} className="absolute text-[#0070f3]" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-neutral-900">분석 중</h2>
        <p className="text-sm text-neutral-500 mb-8">
          GitHub와 채용공고를 분석하고 있습니다.
        </p>

        <div className="w-full bg-white border border-neutral-200 rounded-xl p-5 text-left shadow-xs">
          {steps.map((step, idx) => {
            const isCompleted = loadingStep > idx + 1;
            const isCurrent = loadingStep === idx + 1;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 mb-3.5 transition-opacity duration-200 ${
                  isCompleted || isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-[#0070f3] text-white"
                        : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    isCurrent
                      ? "font-semibold text-neutral-900"
                      : "font-normal text-neutral-500"
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

  // ── 결과 화면 ────────────────────────────────────────────────────────
  if (results) {
    const successResults = results.filter(
      (r): r is CrawlSuccess => r.status === "success",
    );
    const failedResults = results.filter(
      (r): r is CrawlFailed => r.status === "failed",
    );

    return (
      <div className="max-w-[960px] mx-auto px-4">
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <button
            onClick={() => {
              setResults(null);
              setGithubResult(null);
            }}
            className="btn btn-secondary inline-flex items-center text-xs gap-1.5 mb-4"
          >
            ← 다시 분석하기
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">분석 결과</h1>
        </div>

        {/* GitHub 기술스택 섹션 */}
        {githubResult && (
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs mb-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
              <Github size={18} />
              <h2 className="text-sm font-bold text-neutral-900">
                GitHub 기술스택 — {githubResult.username}
              </h2>
            </div>

            {/* confirmed */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-neutral-700 mb-2 block">
                확인된 기술
              </span>
              <div className="flex flex-wrap gap-1.5">
                {githubResult.confirmed_skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* inferred */}
            {githubResult.inferred_skills.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-neutral-700 mb-2 block">
                  추론된 기술
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {githubResult.inferred_skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                    >
                      {skill} · 추론
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 실패 공고 */}
        {failedResults.length > 0 && (
          <div className="mb-6">
            {failedResults.map((r) => (
              <div
                key={r.url_index}
                className="flex gap-2 bg-red-50 border border-red-100 rounded-lg p-3 text-red-800 text-xs mb-2"
              >
                <AlertTriangle
                  size={15}
                  className="shrink-0 mt-0.5 text-red-500"
                />
                <span>
                  공고 {r.url_index + 1}번 크롤링 실패: {r.error}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 성공 공고 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {successResults.map((r) => (
            <div
              key={r.url_index}
              className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs"
            >
              <div className="mb-4 pb-3 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {r.title || "제목 없음"}
                  </h3>
                  <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded shrink-0">
                    #{r.url_index + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-2">
                  {r.company && (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Building2 size={11} />
                      {r.company}
                    </span>
                  )}
                  {r.job_type && (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Briefcase size={11} />
                      {r.job_type}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-2">
                  <Layers size={13} />
                  기술스택
                </span>
                {r.tech_stack.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {r.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
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

  // ── 입력 폼 ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-[960px] mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-neutral-900">
          채용공고 기술스택 분석
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          GitHub 아이디와 채용공고 URL을 입력하면 기술스택을 추출하여
          분석합니다.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-lg p-3 text-red-800 text-xs mb-6">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleStartAnalysis}
        className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs"
      >
        {/* GitHub 아이디 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
            <Github size={18} />
            <h3 className="text-sm font-bold text-neutral-900">
              1. GitHub 아이디
            </h3>
          </div>
          <input
            type="text"
            className="form-input w-full"
            placeholder="kimcoding-dev"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required
          />
          <span className="block text-xs text-neutral-400 mt-1">
            github.com/ 뒤의 아이디를 입력하세요.
          </span>
        </div>

        {/* 채용공고 URL */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
            <Code2 size={18} />
            <h3 className="text-sm font-bold text-neutral-900">
              2. 채용공고 URL (최대 5개)
            </h3>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {jobUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  className="form-input flex-1"
                  placeholder="https://www.jobkorea.co.kr/..."
                  value={url}
                  onChange={(e) => handleUpdateJobUrl(index, e.target.value)}
                  required
                />
                {jobUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveJobUrl(index)}
                    className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
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
              className="btn btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
            >
              <Plus size={13} /> 채용공고 추가
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-center">
          <button
            type="submit"
            className="btn btn-primary py-3 px-8 text-sm font-semibold rounded-lg w-full max-w-[320px]"
          >
            <Sparkles size={15} /> 분석 시작
          </button>
        </div>
      </form>
    </div>
  );
}
