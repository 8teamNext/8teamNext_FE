import React, { useEffect } from "react";
import {
  // eslint-disable-next-line deprecation/deprecation
  Github,
  FileText,
  Sparkles,
  X,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  BarChart2,
  ExternalLink,
  Wrench,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ResumeGithubResponse } from "../utils/api";

// ── 외부에서 import해서 쓸 수 있는 모달 컴포넌트 ──────────
export interface ResumeGithubModalProps {
  result: ResumeGithubResponse;
  githubUsername: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeGithubModal({ result, githubUsername, isOpen, onClose }: ResumeGithubModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[860px] max-h-[90vh] flex flex-col rounded-2xl bg-[#fafafa]"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
      >
        {/* 고정 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0 rounded-t-2xl border-b border-zinc-100"
          style={{ background: "#fafafa" }}
        >
          <div className="flex items-center gap-2">
            <Github size={15} className="text-zinc-700" />
            <h2 className="text-base font-extrabold text-zinc-900 m-0">이력서 · GitHub 분석 상세 결과</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border-0 cursor-pointer transition-colors"
            style={{ background: "rgba(0,0,0,0.07)" }}
          >
            <X size={15} className="text-zinc-600" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1 p-6">
          <ResumeGithubDetailContent result={result} githubUsername={githubUsername} />
        </div>
      </div>
    </div>
  );
}

// ── 내부 컨텐츠 컴포넌트 (상세 페이지와 모달이 공유) ──────
interface Props {
  result: ResumeGithubResponse;
  githubUsername: string;
  // onBack은 페이지 단독 사용 시에만 필요하므로 optional
  onBack?: () => void;
}

function SkillBadge({ label, variant }: { label: string; variant: "verified" | "unverified" | "new" | "github" }) {
  const styles: Record<string, React.CSSProperties> = {
    verified: { background: "#ecfdf5", borderColor: "rgba(16,185,129,0.25)", color: "#065f46" },
    unverified: { background: "#fff7ed", borderColor: "rgba(249,115,22,0.25)", color: "#9a3412" },
    new: { background: "#f0fdf4", borderColor: "rgba(22,163,74,0.25)", color: "#15803d" },
    github: { background: "#eff6ff", borderColor: "rgba(37,99,235,0.2)", color: "#1d4ed8" },
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono border"
      style={styles[variant]}
    >
      {label}
    </span>
  );
}

const CHART_COLORS = {
  verified: "#16A34A",
  unverified: "#F59E0B",
  discovered: "#2563EB",
};

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs shadow-lg">
        <span className="font-bold text-zinc-800">{payload[0].name}</span>
        <span className="text-zinc-500 ml-1">{payload[0].value}개</span>
      </div>
    );
  }
  return null;
};

// 도넛 중앙 라벨
const DonutLabel = ({ cx, cy, total }: { cx: number; cy: number; total: number }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: 22, fontWeight: 800 }}>
      {total}
    </text>
    <text x={cx} y={cy + 10} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: 10 }}>
      전체 기술
    </text>
  </>
);

function ResumeGithubDetailContent({ result, githubUsername }: Props) {
  const total = result.resume_skills.length;
  const verified = result.verified_skills.length;
  const matchPct = total > 0 ? Math.round((verified / total) * 100) : 0;

  // 차트 데이터
  const pieData = [
    { name: "검증된 기술", value: result.verified_skills.length, color: CHART_COLORS.verified },
    { name: "미검증 기술", value: result.unverified_skills.length, color: CHART_COLORS.unverified },
    { name: "GitHub 추가 발견", value: result.newly_discovered_skills.length, color: CHART_COLORS.discovered },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "이력서 기술", value: result.resume_skills.length, fill: "#A1A1AA" },
    { name: "GitHub 검증", value: result.verified_skills.length, fill: "#22C55E" },
    { name: "미검증", value: result.unverified_skills.length, fill: "#F59E0B" },
    { name: "GitHub 발견", value: result.newly_discovered_skills.length, fill: "#2563EB" },
  ];

  const scoreColor =
    matchPct >= 80 ? "#16A34A" : matchPct >= 50 ? "#F59E0B" : "#EF4444";
  const scoreLabel =
    matchPct >= 80 ? "매우 우수" : matchPct >= 50 ? "보통" : "보완 필요";

  const circumference = 2 * Math.PI * 46;
  const dash = (matchPct / 100) * circumference;

  return (
    <div className="max-w-[860px] mx-auto">

      {/* 종합 점수 카드 */}
      <div
        className="rounded-2xl pl-6 pr-5 py-6 mb-6 flex items-center gap-8"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* 원형 게이지 */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="55" cy="55" r="46" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold text-white leading-none">{matchPct}%</span>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: scoreColor }}>일치율</span>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
            이력서 · GitHub 기술 정합성
          </div>
          <div className="text-2xl font-extrabold text-white mb-2">{scoreLabel}</div>
          <p className="text-sm text-zinc-400 leading-relaxed m-0">
            {result.overall_evaluation}
          </p>
        </div>

        {/* GitHub 링크 */}
        <a
          href={`https://github.com/${githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-center flex flex-col items-center gap-2 pl-2 pr-0 py-3 rounded-xl text-white hover:bg-white/10 transition-colors no-underline"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#fff1" }}>
            <Github size={22} />
          </div>
          <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-0.5">
            @{githubUsername}<ExternalLink size={9} />
          </span>
        </a>
      </div>

      {/* ① 이력서 보완 권고 + 이력서 업데이트 제안 */}
      <div className="flex flex-col gap-3 mb-6">
        {result.update_suggestion && (
          <div
            className="rounded-2xl p-5 border"
            style={{ borderColor: "rgba(22,163,74,0.2)", background: "#f0fdf4" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#bbf7d0" }}>
                <Wrench size={15} className="text-green-700" />
              </div>
              <div>
                <div className="text-sm font-bold text-green-900 mb-1.5 flex items-center justify-between">
                  이력서에 추가할 기술 발견
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full" style={{ background: "#e4e4e7", color: "#71717a" }}>GPT-4o-mini</span>
                </div>
                <p className="text-xs text-green-800 leading-relaxed m-0">{result.update_suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {result.supplement_advice && (
          <div
            className="rounded-2xl p-5 border"
            style={{ borderColor: "rgba(249,115,22,0.2)", background: "#fff7ed" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#fed7aa" }}>
                <Sparkles size={15} className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-orange-900 mb-1.5 flex items-center justify-between">
                  포트폴리오 보완이 필요해요
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full" style={{ background: "#e4e4e7", color: "#71717a" }}>GPT-4o-mini</span>
                </div>
                <p className="text-xs text-orange-800 leading-relaxed m-0">{result.supplement_advice}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ② 검증된 기술 / 미검증 기술 / GitHub 추가 발견 (3열) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* 검증된 기술 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#ecfdf5" }}>
              <ShieldCheck size={14} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">검증된 기술</div>
              <div className="text-[10px] text-zinc-400">이력서 & GitHub 모두 확인</div>
            </div>
          </div>
          {result.verified_skills.length === 0 ? (
            <p className="text-xs text-zinc-400">검증된 기술이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {result.verified_skills.map((s) => <SkillBadge key={s} label={s} variant="verified" />)}
            </div>
          )}
        </div>

        {/* 미검증 기술 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fff7ed" }}>
              <AlertTriangle size={14} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">미검증 기술</div>
              <div className="text-[10px] text-zinc-400">이력서에만 있고 GitHub 미확인</div>
            </div>
          </div>
          {result.unverified_skills.length === 0 ? (
            <p className="text-xs text-zinc-400">미검증 기술이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {result.unverified_skills.map((s) => <SkillBadge key={s} label={s} variant="unverified" />)}
            </div>
          )}
        </div>

        {/* GitHub 추가 발견 (회색) */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff" }}>
              <PlusCircle size={14} style={{ color: "#2563EB" }} />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">GitHub 추가 발견</div>
              <div className="text-[10px] text-zinc-400">GitHub에 있지만 이력서 미기재</div>
            </div>
          </div>
          {result.newly_discovered_skills.length === 0 ? (
            <p className="text-xs text-zinc-400">추가 발견 기술이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {result.newly_discovered_skills.map((s) => <SkillBadge key={s} label={s} variant="github" />)}
            </div>
          )}
        </div>
      </div>

      {/* ③ 기술 분포 차트 */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: "#eaeaea", background: "#fff" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f4f4f5" }}>
            <BarChart2 size={14} className="text-zinc-500" />
          </div>
          <span className="text-xs font-bold text-zinc-900">기술 스택 분포</span>
        </div>

        {/* 서브 타이틀 — 같은 라인 */}
        <div className="hidden lg:grid grid-cols-2 gap-6 mb-2">
          <span className="text-[11px] text-zinc-500 font-semibold text-center">이력서 기술 구성 비율</span>
          <span className="text-[11px] text-zinc-500 font-semibold">카테고리별 기술 수</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* 도넛 차트 — 이력서 기술 비율 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-zinc-500 mb-3 font-semibold lg:hidden">이력서 기술 구성 비율</span>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  {/* 중앙 라벨은 recharts에서 customized label로 처리 */}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-zinc-400">데이터 없음</div>
            )}
            {/* 범례 */}
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          {/* 가로 막대 차트 — 카테고리별 수 */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 mb-3 font-semibold lg:hidden">카테고리별 기술 수</span>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#52525b" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// default export — 단독 페이지로 쓸 때 사용 (현재는 모달 방식 권장)
export default ResumeGithubDetailContent;
