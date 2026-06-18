import React, { useState } from "react";
import {
  Sparkles,
  Github,
  FileText,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  FileCheck,
  Activity,
  Code2,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import FileUpload from "../components/FileUpload";
import { api, UnifiedAnalysisResponse } from "../utils/api";

export default function Analysis() {
  // Input states
  const [githubUrl, setGithubUrl] = useState(
    "https://github.com/kimcoding-dev/book-rental-service",
  );
  const [resumeText, setResumeText] = useState("");
  const [jobUrls, setJobUrls] = useState<string[]>([""]);

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
    if (!githubUrl.trim()) {
      setError("GitHub URL을 입력해주세요.");
      return;
    }
    if (!resumeText.trim()) {
      setError("이력서 텍스트를 입력하거나 이력서 파일을 업로드해 주세요.");
      return;
    }

    const filteredJobs = jobUrls.filter((url) => url.trim() !== "");
    if (filteredJobs.length === 0) {
      setError("최소 하나의 채용공고 URL을 입력해주세요.");
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
      const data = await api.analyzeUnified(
        githubUrl,
        resumeText,
        filteredJobs,
      );
      // Wait slightly so user sees the final step of analyzing
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setResult(data);
    } catch (err: any) {
      setError(err.message || "종합 커리어 분석 중 오류가 발생했습니다.");
    } finally {
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // 1. Loading Phase View
  if (loading) {
    const steps = [
      "GitHub 레포지토리 정보 및 소스코드 품질 스캔 중...",
      "이력서 기재 기술과 깃허브 코드 구현 상호 대조 중...",
      "채용 요구사항 기반 핵심 역량 Gap 분석 중...",
      "부족 스택 극복을 위한 맞춤형 프로젝트 설계 및 로드맵 도출 중...",
    ];

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-[520px] mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900 h-10 w-10"></div>
          <Sparkles size={18} className="absolute text-[#0070f3]" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-neutral-900">
          AI 커리어 코파일럿 진단 중
        </h2>
        <p className="text-sm text-neutral-500 mb-8">
          사용자의 코드 데이터와 이력서를 정밀 분석하여 맞춤형 커리어 레포트를
          생성하고 있습니다.
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

  // 2. Report Phase View
  if (result) {
    const {
      overall_score,
      portfolio_rating,
      github_analysis,
      resume_analysis,
      skill_gap,
      recommended_projects,
    } = result;

    return (
      <div className="max-w-[1160px] mx-auto px-4">
        {/* Header navigation bar */}
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <button
            onClick={() => setResult(null)}
            className="btn btn-secondary inline-flex items-center text-xs gap-1.5"
          >
            <ArrowLeft size={14} /> 진단 다시하기
          </button>

          <div className="flex justify-between items-end mt-4 flex-wrap gap-6">
            <div>
              <span className="inline-block bg-blue-50 text-[#0070f3] px-2 py-0.5 rounded text-[11px] font-semibold mb-2">
                AI 종합 분석 레포트
              </span>
              <h1 className="text-3xl font-bold tracking-tight m-0 text-neutral-900">
                AI Career Report
              </h1>
              <p className="mt-1 mb-0 text-sm text-neutral-500">
                GitHub 소스코드 및 이력서 기반 종합 커리어 역량 평가
                보고서입니다.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl py-3 px-5 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <svg width="68" height="68" viewBox="0 0 36 36">
                    <path
                      className="fill-none stroke-neutral-100 stroke-[2.8]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="fill-none stroke-black stroke-[2.8] stroke-linecap-round transition-[stroke-dasharray] duration-300"
                      style={{
                        strokeDasharray: `${overall_score}, 100`,
                      }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-neutral-900">
                    {overall_score}점
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    종합 스택 역량
                  </div>
                  <div className="text-lg font-bold text-neutral-900 leading-none">
                    {portfolio_rating}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 1 & 2: GitHub & Resume Verification */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* GitHub Analysis */}
            <div className="card">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3.5 mb-4">
                <div className="flex items-center gap-2 text-neutral-900">
                  <Github size={18} />
                  <h2 className="text-base font-bold">
                    GitHub 포트폴리오 분석 결과
                  </h2>
                </div>
                <span className="badge badge-info">
                  {github_analysis.repo_count}개 레포지토리 스캔
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex flex-col">
                  <span className="text-[11px] text-neutral-400 mb-1">
                    README 상태
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {github_analysis.readme_quality}
                  </span>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex flex-col">
                  <span className="text-[11px] text-neutral-400 mb-1">
                    프로젝트 완성도
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {github_analysis.project_completeness}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <span className="block text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
                  감지된 주요 기술 스택
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {github_analysis.tech_stack.map((tech) => (
                    <span key={tech} className="badge badge-info">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <span className="block text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
                  레포지토리별 세부 정보
                </span>
                <div className="flex flex-col gap-3">
                  {github_analysis.repo_details.map((repo) => (
                    <div
                      key={repo.url}
                      className="border border-neutral-200 rounded-lg p-3.5 bg-white hover:border-neutral-400 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-neutral-900 inline-flex items-center gap-1 hover:underline"
                        >
                          {repo.name} <ExternalLink size={12} />
                        </a>
                        <span className="badge badge-success">
                          {repo.quality_score}점
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 m-0 mb-2 leading-relaxed">
                        {repo.description}
                      </p>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span>
                          주요 언어:{" "}
                          <strong className="text-neutral-700">
                            {repo.primary_language}
                          </strong>
                        </span>
                        <span className="text-neutral-200">•</span>
                        <span>
                          리드미:{" "}
                          <strong
                            style={{
                              color:
                                repo.readme_status.includes("보통") ||
                                repo.readme_status.includes("Needs")
                                  ? "#b45309"
                                  : "#047857",
                            }}
                          >
                            {repo.readme_status}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {github_analysis.readme_suggestions &&
                github_analysis.readme_suggestions.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-neutral-200">
                    <span className="block text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
                      깃허브 README 개선 제안
                    </span>
                    <ul className="list-none p-0 mt-2 flex flex-col gap-2">
                      {github_analysis.readme_suggestions.map(
                        (suggestion, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-neutral-600 leading-relaxed flex gap-2 items-start"
                          >
                            <AlertTriangle
                              size={14}
                              color="#f59e0b"
                              className="shrink-0 mt-0.5"
                            />
                            <span>{suggestion}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </div>

            {/* Resume Analysis */}
            <div className="card">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3.5 mb-4">
                <div className="flex items-center gap-2 text-neutral-900">
                  <FileCheck size={18} />
                  <h2 className="text-base font-bold">이력서 검증 및 적합성</h2>
                </div>
                <span className="badge badge-success">
                  일치율 {resume_analysis.tech_stack_matching}%
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex gap-3 items-start mb-5">
                <div className="text-xl leading-none">📄</div>
                <div>
                  <h4 className="m-0 text-xs font-bold text-neutral-900">
                    이력서 품질 코멘트
                  </h4>
                  <p className="m-0 text-[11px] text-neutral-500 leading-normal">
                    {resume_analysis.resume_quality}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold mb-1 text-emerald-600">
                    ✓ 교차 검증 성공 (Verified)
                  </span>
                  <p className="text-[10px] text-neutral-400 m-0 mb-2 leading-relaxed">
                    이력서와 깃허브 코드 이력에서 교차 확인된 스택
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {resume_analysis.verified_skills.map((skill) => (
                      <span key={skill} className="badge badge-success">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold mb-1 text-amber-600">
                    ✗ 소스코드 증명 필요 (Unverified)
                  </span>
                  <p className="text-[10px] text-neutral-400 m-0 mb-2 leading-relaxed">
                    이력서에는 적혀있으나 깃허브 코드 확인이 어려운 스택
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {resume_analysis.unverified_skills.length > 0 ? (
                      resume_analysis.unverified_skills.map((skill) => (
                        <span key={skill} className="badge badge-warning">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        모든 스택이 증명되었습니다.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Col: Skill Gap, Roadmap, Recommended Projects */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Skill Gap & Roadmap */}
            <div className="card">
              <div className="flex items-center gap-2 text-neutral-900 mb-2">
                <Activity size={18} />
                <h2 className="text-base font-bold">역량 Gap & 보완 로드맵</h2>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                채용 시장 요건 대비 현재 부족한 기술 목록과 우선 보완 순위
                가이드라인입니다.
              </p>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3.5">
                <span className="block text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
                  미보유 보완 기술 스택
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skill_gap.missing_technologies.map((tech) => (
                    <span key={tech} className="badge badge-danger">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <span className="block text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
                  AI 성장 추천 로드맵
                </span>
                <div className="flex flex-col gap-3">
                  {skill_gap.learning_roadmap.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-4.5 h-4.5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-neutral-600 leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Projects */}
            <div className="card">
              <div className="flex items-center gap-2 text-neutral-900 mb-2">
                <Sparkles size={18} />
                <h2 className="text-base font-bold">
                  커리어 보완 추천 프로젝트
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mb-5">
                부족 스택을 이력서에 증빙할 수 있도록 설계된 맞춤 프로젝트
                추천입니다.
              </p>

              <div className="flex flex-col gap-4">
                {recommended_projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="border border-neutral-200 rounded-lg p-4 bg-neutral-50"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="text-sm font-bold text-neutral-900 m-0">
                        {proj.title}
                      </h4>
                      <span
                        className={`badge ${proj.difficulty.includes("Hard") || proj.difficulty.includes("상") ? "badge-danger" : "badge-warning"}`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        {proj.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed m-0 mb-3">
                      {proj.description}
                    </p>

                    <div className="flex flex-col gap-1 text-[11px] text-neutral-600 mb-3">
                      <div className="bg-white border border-neutral-200 rounded px-1.5 py-0.5">
                        <strong>기술:</strong> {proj.technologies.join(", ")}
                      </div>
                      <div className="bg-white border border-neutral-200 rounded px-1.5 py-0.5">
                        <strong>보완:</strong>{" "}
                        {proj.missing_skills_covered.join(", ")}
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-md py-2 px-3 mb-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-900 mb-1">
                        <BookOpen size={12} />
                        <span>구현 및 아키텍처 가이드</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-relaxed m-0">
                        {proj.architecture}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                      <TrendingUp size={12} className="text-emerald-500" />
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
    <div className="max-w-[960px] mx-auto px-4">
      <div className="header-section">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-neutral-900">
          Unified AI Career Report
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          GitHub Repository 소스코드와 이력서를 한 번에 입력하여 종합적인 기술
          역량 분석, 이력서 검증 및 개인 맞춤형 성장 로드맵을 설계받습니다.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left section: GitHub & Role */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-2 text-neutral-900 font-bold text-base">
              <Github size={18} />
              <h3 className="m-0 text-sm font-bold text-neutral-900">
                1. GitHub 포트폴리오 연동
              </h3>
            </div>

            <div className="form-group mb-6">
              <label className="form-label block text-xs font-medium text-neutral-700 mb-1">
                메인 GitHub Repository URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username/project-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
              <span className="block text-xs text-neutral-400 mt-1">
                검증하고자 하는 메인 프로젝트가 포함된 공개 저장소 주소를 정확히
                입력해주세요.
              </span>
            </div>

            <div className="form-group">
              <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-2 text-neutral-900 font-bold text-base">
                <Code2 size={18} />
                <h3 className="m-0 text-sm font-bold text-neutral-900">
                  2. 채용공고 URL 연동 (최대 5개)
                </h3>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                {jobUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://toss.im/career/job-detail/backend-developer"
                      value={url}
                      onChange={(e) =>
                        handleUpdateJobUrl(index, e.target.value)
                      }
                      required
                    />
                    {jobUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJobUrl(index)}
                        className="bg-transparent border-none cursor-pointer p-1 rounded flex items-center justify-center hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors duration-150"
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
                  className="btn btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1 mt-1 mb-2"
                >
                  <Plus size={13} /> 채용공고 추가하기
                </button>
              )}

              <span className="block text-xs text-neutral-400 mt-1">
                입력하신 각 채용공고의 자격 요건 및 우대 기술 스택을 상세
                대조하여 직무 적합도와 기술 갭을 평가합니다.
              </span>
            </div>
          </div>

          {/* Right section: Resume File Uploader */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-2 text-neutral-900 font-bold text-base">
              <FileText size={18} />
              <h3 className="m-0 text-sm font-bold text-neutral-900">
                3. 이력서(Resume) 업로드
              </h3>
            </div>

            <FileUpload
              accept=".txt,.md,.pdf"
              onTextLoaded={handleFileUpload}
              placeholderText="이력서 파일 등록 (PDF/TXT)"
            />

            <div className="form-group mt-5">
              <label className="form-label block text-xs font-medium text-neutral-700 mb-1">
                이력서 텍스트 직접 입력 / 편집
              </label>
              <textarea
                className="form-textarea min-h-[180px] text-xs! leading-relaxed"
                placeholder="이력서 파일 업로드 시 텍스트가 자동으로 채워집니다. 직접 작성하시거나 수정하셔도 좋습니다..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-center">
          <button
            type="submit"
            className="btn btn-primary py-3 px-8 text-sm font-semibold rounded-lg w-full max-w-[320px]"
          >
            <Sparkles size={15} /> AI 커리어 분석 시작하기
          </button>
        </div>
      </form>
    </div>
  );
}
