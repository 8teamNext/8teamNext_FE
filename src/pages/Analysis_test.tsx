import React, { useState } from "react";
import {
  Sparkles,
  Github,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  FileCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FolderOpen,
  Save,
  CheckCircle,
} from "lucide-react";
import {
  api,
  MatchingResult,
  MatchingSuccess,
  MatchingFailed,
  AnalyzeResponse,
} from "../utils/api";
import Modal, { ModalActions } from "../components/Modal";
import {
  GROUPS,
  Group,
  saveGroup,
  loadGroup,
  GroupSelector,
} from "../components/Group";

export default function Analysistest() {
  const [githubUsername, setGithubUsername] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [registeredUrls, setRegisteredUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group>("A");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // ── URL 등록 ──────────────────────────────────────────
  const handleRegisterUrl = () => {
    if (!urlInput.trim()) return;
    if (registeredUrls.length >= 5) {
      setError("최대 5개까지 등록 가능합니다.");
      return;
    }
    setRegisteredUrls([...registeredUrls, urlInput.trim()]);
    setUrlInput("");
    setError(null);
  };

  const handleRemoveRegistered = (i: number) => {
    setRegisteredUrls(registeredUrls.filter((_, idx) => idx !== i));
  };

  // ── 저장하기 ──────────────────────────────────────────
  const handleSave = () => {
    if (registeredUrls.length === 0) {
      setError("저장할 채용공고 URL이 없습니다.");
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    saveGroup(selectedGroup, registeredUrls);
    setShowSaveModal(false);
    setSaveNotice(`그룹 ${selectedGroup}에 저장되었습니다.`);
    setTimeout(() => setSaveNotice(null), 2500);
  };

  // ── 불러오기 ──────────────────────────────────────────
  const handleLoadConfirm = () => {
    const urls = loadGroup(selectedGroup);
    if (urls.length === 0) {
      setShowLoadModal(false);
      setError(`그룹 ${selectedGroup}에 저장된 URL이 없습니다.`);
      return;
    }
    setRegisteredUrls(urls);
    setShowLoadModal(false);
    setError(null);
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
    setResult(null);
    setLoadingStep(1);
    const stepIntervals = [
      setTimeout(() => setLoadingStep(2), 1200),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3600),
    ];

    try {
      const data = await api.analyze(githubUsername, registeredUrls);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setResult(data);
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
      "매칭 분석 중...",
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
          GitHub와 채용공고를 분석하고 매칭하고 있습니다.
        </p>
        <div className="w-full bg-white border border-zinc-100 rounded-2xl p-5 text-left shadow-sm">
          {steps.map((step, idx) => {
            const done = loadingStep > idx + 1;
            const cur = loadingStep === idx + 1;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 mb-3.5 transition-opacity duration-300 ${done || cur ? "opacity-100" : "opacity-35"}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
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
                  className={`text-xs ${cur ? "font-semibold text-zinc-900" : "text-zinc-500"}`}
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
  if (result) {
    const { github, matching } = result;
    const successMatching = matching.filter(
      (r): r is MatchingSuccess => r.status === "success",
    );
    const failedMatching = matching.filter(
      (r): r is MatchingFailed => r.status === "failed",
    );

    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">분석 결과</h1>
          <button
            onClick={() => setResult(null)}
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
              GitHub 기술스택 — @{github.username}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                검증된 기술 스택
              </span>
              <div className="flex flex-wrap gap-1.5">
                {github.confirmed_skills.map((skill) => (
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
            {github.inferred_skills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                  LLM 기반 추정 기술 스택
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {github.inferred_skills.map((skill) => (
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

        {/* 실패 공고 */}
        {failedMatching.length > 0 && (
          <div className="mb-4">
            {failedMatching.map((r) => (
              <div
                key={r.url_index}
                className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-2"
              >
                <AlertTriangle
                  size={13}
                  className="shrink-0 mt-0.5 text-red-400"
                />
                <span>
                  공고 {r.url_index + 1}번 실패: {r.error}
                </span>
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

                {/* 합산 점수 */}
                <div
                  className="rounded-xl p-4 text-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, #F0FDF4, #EFF6FF)",
                    border: "1px solid rgba(22,163,74,0.15)",
                  }}
                >
                  <div
                    className="text-3xl font-extrabold mb-0.5"
                    style={{
                      color:
                        totalScore >= 60
                          ? "#16A34A"
                          : totalScore >= 30
                            ? "#2563EB"
                            : "#DC2626",
                    }}
                  >
                    {totalScore}%
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    전체 기술 매칭률
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="text-[10px]" style={{ color: "#16A34A" }}>
                      검증된 기술 스택 {r.confirmed_score}%
                    </span>
                    <span className="text-zinc-300 text-[10px]">+</span>
                    <span className="text-[10px]" style={{ color: "#2563EB" }}>
                      LLM 기반 추정 기술 스택 {r.inferred_score}%
                    </span>
                  </div>
                </div>

                {(r.confirmed_matched.length > 0 ||
                  r.inferred_matched.length > 0) && (
                  <div className="mb-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">
                      <CheckCircle2 size={11} className="text-green-500" />{" "}
                      매칭된 기술
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.confirmed_matched.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: "#F0FDF4",
                            color: "#16A34A",
                            border: "1px solid rgba(22,163,74,0.2)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {r.inferred_matched.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: "#EFF6FF",
                            color: "#2563EB",
                            border: "1px solid rgba(37,99,235,0.2)",
                          }}
                        >
                          {s} · 추론
                        </span>
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
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: "#FEF2F2",
                            color: "#DC2626",
                            border: "1px solid rgba(220,38,38,0.2)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {r.extra_confirmed.length > 0 && (
                  <div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">
                      <PlusCircle size={11} className="text-zinc-400" /> 추가
                      보유 기술
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.extra_confirmed.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: "#F4F4F5",
                            color: "#71717A",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          {s}
                        </span>
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

  // ── 입력 폼 ───────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: "#16A34A" }} />
          <h2 className="text-sm font-bold text-zinc-700 m-0">
            채용공고 URL 연동
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">최대 5개</span>
          <div className="flex-1" />
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

        {/* 불러오기 / 저장하기 */}
        <div className="flex items-center gap-2 mt-2">
          {saveNotice && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
              <CheckCircle size={12} /> {saveNotice}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowLoadModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
            style={{
              background: "#F0FDF4",
              borderColor: "rgba(22,163,74,0.2)",
              color: "#16A34A",
            }}
          >
            <FolderOpen size={13} /> 불러오기
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-white"
            style={{
              background: "linear-gradient(135deg, #16A34A, #22C55E)",
              borderColor: "transparent",
              boxShadow: "0 2px 6px rgba(22,163,74,0.25)",
            }}
          >
            <Save size={13} /> 저장하기
          </button>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-xs mb-5">
          <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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

      {/* 저장하기 모달 */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="그룹 선택"
        description={`현재 등록된 URL ${registeredUrls.length}개를 저장할 그룹을 선택하세요. 그룹당 최대 5개 저장 가능합니다.`}
        width={320}
      >
        <GroupSelector selected={selectedGroup} onChange={setSelectedGroup} />
        <ModalActions
          onCancel={() => setShowSaveModal(false)}
          onConfirm={handleSaveConfirm}
          confirmLabel="저장하기"
        />
      </Modal>

      {/* 불러오기 모달 */}
      <Modal
        open={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title="그룹 선택"
        description="불러올 그룹을 선택하세요. 현재 입력창의 URL은 선택한 그룹으로 덮어씌워집니다."
        width={320}
      >
        <GroupSelector selected={selectedGroup} onChange={setSelectedGroup} />
        <ModalActions
          onCancel={() => setShowLoadModal(false)}
          onConfirm={handleLoadConfirm}
          confirmLabel="불러오기"
        />
      </Modal>
    </div>
  );
}
