import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Search,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';
import Card from '../components/Card';
import { UserProfile, api } from '../utils/api';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  user: UserProfile | null;
}

export default function Home({ setCurrentPage, user }: HomeProps) {
  const [totalCount, setTotalCount] = useState<string>('집계중');

  useEffect(() => {
    api.getHistory()
      .then((history) => {
        setTotalCount(String(history.length) + '건');
      })
      .catch(() => {
        setTotalCount('집계중');
      });
  }, []);

  const handleGetStarted = () => {
    setCurrentPage('analysis');
  };

  const features = [
    {
      id: 'analysis',
      title: 'AI 통합 분석',
      desc: 'GitHub 소스코드 분석, 이력서 상호 검증, 목표 직무와의 기술 Gap 분석 및 보완 프로젝트 추천을 단 한 번의 클릭으로 확인합니다.',
      icon: Sparkles,
      badge: '통합 역량 평가',
      color: '#16A34A',
    },
    {
      id: 'interview',
      title: 'AI 모의 면접 대비',
      desc: '자기소개서나 이력서에 작성된 프로젝트 경험과 기술 키워드를 추출하여 면접관의 의도를 담은 예상 질문과 모범 팁을 제공합니다.',
      icon: MessageSquare,
      badge: '실전 모의대비',
      color: '#16A34A',
    },
    {
      id: 'mypage-history',
      title: '커리어 대시보드',
      desc: '지금까지 진단받은 종합 분석 및 이력 상세 로그를 관리하고, 나의 취업 스택 성장 추이를 한눈에 모니터링합니다.',
      icon: GitBranch,
      badge: '스택 로그 관리',
      color: '#FFB347',
    },
  ];

  const stats = [
    { icon: Zap, label: '평균 분석 시간', value: '30초', sub: '초고속 AI 분석', accent: '#E53E3E' },
    { icon: BarChart3, label: '검증 정확도', value: '집계중', sub: 'AI 교차 검증', accent: '#FFB347' },
    { icon: Search, label: '누적 분석 건수', value: totalCount, sub: '지금도 분석 중', accent: '#16A34A' },
  ];

  return (
    <div className="flex flex-col gap-14 pb-12">
      {/* Hero Section */}
      <section
        className="rounded-2xl py-20 px-10 text-center flex flex-col items-center overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, #ffffff 0%, #fff5f3 40%, #fff8f1 80%, #ffffff 100%)',
          border: '1px solid rgba(22, 163, 74, 0.1)',
          boxShadow: '0 4px 24px rgba(22, 163, 74, 0.06)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #16A34A, transparent)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-8"
          style={{ background: 'radial-gradient(circle, #22C55E, transparent)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="max-w-3xl w-full mx-auto flex flex-col items-center relative z-10">
          <div
            className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold mb-6 border tracking-wider uppercase gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #F0FDF4, #FFF8F1)',
              borderColor: 'rgba(22, 163, 74, 0.2)',
              color: '#16A34A',
            }}
          >
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1 className="text-4xl font-extrabold text-zinc-900 leading-tight mb-4 tracking-tight">
            개발자 취업 합격 확률을 높이는<br />
            당신만을 위한{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 60%, #FFB347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              맞춤형 서비스
            </span>
          </h1>

          <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-xl">
            이력서 검증, 포트폴리오 분석, 역량 Gap 보완 프로젝트 추천까지<br />
            취업 성공률을 높일 구체적인 기술 스택 보완 액션 플랜을 제공합니다.
          </p>

          {/* Get Started button */}
          <button
            onClick={handleGetStarted}
            className="text-white border-0 py-2.5 px-8 rounded-xl text-base font-extrabold cursor-pointer flex items-center transition-all duration-150 mb-5"
            style={{
              background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
            }}
          >
            <span>Get Started</span>
          </button>

          {/* Quick action buttons */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-1">
            <span className="text-xs text-zinc-400 mr-1 font-medium"></span>
            <button
              onClick={() => setCurrentPage('analysis')}
              className="bg-white border border-zinc-200 py-1.5 px-3.5 rounded-full text-xs text-zinc-600 font-medium cursor-pointer hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              📊 AI 통합 분석
            </button>
            <button
              onClick={() => setCurrentPage('interview')}
              className="bg-white border border-zinc-200 py-1.5 px-3.5 rounded-full text-xs text-zinc-600 font-medium cursor-pointer hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              💬 AI 모의 면접
            </button>
            <button
              onClick={() => setCurrentPage('mypage-history')}
              className="bg-white border border-zinc-200 py-1.5 px-3.5 rounded-full text-xs text-zinc-600 font-medium cursor-pointer hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              📈 대시보드 로그 확인
            </button>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 flex items-center gap-4 border"
              style={{
                boxShadow: `0 2px 12px ${stat.accent}18`,
                borderColor: `${stat.accent}99`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${stat.accent}18, ${stat.accent}08)`,
                  border: `1px solid ${stat.accent}30`,
                }}
              >
                <Icon size={18} style={{ color: stat.accent }} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-zinc-700">{stat.label}</div>
                <div className="text-[10px] text-zinc-400">{stat.sub}</div>
              </div>
              <div className="text-xl font-extrabold leading-none ml-auto text-zinc-900">{stat.value}</div>
            </div>
          );
        })}
      </section>

      {/* Feature Cards */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 mb-1.5">핵심 진단 도구</h2>
          <p className="text-xs text-zinc-500 m-0">분석받고자 하는 진단을 선택해 취업 경쟁력을 높여보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="cursor-pointer group" onClick={() => setCurrentPage(feat.id)}>
                <div
                  className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${feat.color}18, ${feat.color}08)`,
                        border: `1px solid ${feat.color}22`,
                      }}
                    >
                      <Icon size={18} style={{ color: feat.color }} />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${feat.color}12`,
                        color: feat.color,
                        border: `1px solid ${feat.color}20`,
                      }}
                    >
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 m-0">{feat.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed flex-grow m-0">{feat.desc}</p>
                  <div className="flex items-center gap-1 mt-1 pt-3 border-t border-zinc-50">
                    <span className="text-xs font-bold" style={{ color: feat.color }}>시작하기</span>
                    <ArrowRight size={12} style={{ color: feat.color }} className="group-hover:translate-x-0.5 transition-transform duration-150" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step Guide */}
      <section
        className="rounded-2xl py-12 px-8 text-center"
        style={{
          background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <div className="mb-2">
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(22,163,74,0.2)', color: '#FF8060', border: '1px solid rgba(22,163,74,0.3)' }}
          >
            HOW IT WORKS
          </span>
        </div>
        <h2 className="mb-8 text-lg font-bold text-white mt-3">효율적인 취업 준비 플로우</h2>
        <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-6">
          {[
            { n: '1', title: 'GitHub & 채용공고 분석', desc: '분석할 깃허브 저장소와 가고 싶은 기업의 채용 정보 링크를 넣습니다.' },
            { n: '2', title: '기술 Gap & 이력서 검증', desc: '이력서 내용과 실제 깃허브 코드 내역을 대조하여 부족 스택과 보완점을 진단합니다.' },
            { n: '3', title: '맞춤형 프로젝트 보완', desc: '도출된 부족 스택(예: Docker, AWS)을 확보할 수 있는 구체적 빌드업 프로젝트를 진행합니다.' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 min-w-[200px] flex flex-col items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono text-white"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)', boxShadow: '0 3px 10px rgba(22,163,74,0.4)' }}
                >
                  {step.n}
                </div>
                <h4 className="text-sm font-semibold text-white m-0">{step.title}</h4>
                <p className="text-xs text-zinc-400 m-0">{step.desc}</p>
              </div>
              {i < 2 && <div className="w-10 h-px bg-zinc-700 shrink-0 md:block hidden" />}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
