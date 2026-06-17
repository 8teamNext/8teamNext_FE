import React, { useState } from 'react';
import { 
  Github, 
  GitBranch, 
  FileCheck, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import Card from '../components/Card';
import { UserProfile } from '../utils/api';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  user: UserProfile | null;
}

export default function Home({ setCurrentPage, user }: HomeProps) {
  const [queryInput, setQueryInput] = useState('');

  const handleQuerySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (queryInput.trim()) {
      // Directs to the Analysis Hub
      setCurrentPage('analysis');
    }
  };

  const handleSuggestionClick = (pageId: string) => {
    setCurrentPage(pageId);
  };

  const features = [
    {
      id: 'analysis',
      title: '종합 AI 커리어 리포트',
      desc: 'GitHub 소스코드 분석, 이력서 상호 검증, 목표 직무와의 기술 Gap 분석 및 보완 프로젝트 추천을 단 한 번의 클릭으로 모두 확인합니다.',
      icon: Sparkles,
      badge: '통합 역량 평가'
    },
    {
      id: 'interview',
      title: 'AI 모의 면접 대비',
      desc: '자기소개서나 이력서에 작성된 프로젝트 경험과 기술 키워드를 추출하여 면접관의 의도를 담은 예상 질문과 모범 팁을 제공합니다.',
      icon: MessageSquare,
      badge: '실전 모의대비'
    },
    {
      id: 'dashboard',
      title: '커리어 대시보드',
      desc: '지금까지 진단받은 종합 분석 및 이력 상세 로그를 관리하고, 나의 취업 스택 성장 추이를 한눈에 모니터링합니다.',
      icon: GitBranch,
      badge: '스택 로그 관리'
    }
  ];

  return (
    <div className="flex flex-col gap-14 pb-12">
      {/* Perplexity-inspired Hero Section */}
      <section className="bg-white rounded-xl border border-zinc-200 py-20 px-10 text-center bg-[radial-gradient(at_top,_#fafafa_0%,_#ffffff_80%)] flex flex-col items-center">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
          <div className="inline-flex items-center bg-zinc-50 text-zinc-900 px-3 py-1 rounded-md text-[10px] font-semibold mb-6 border border-zinc-200 font-mono tracking-wider uppercase">
            <Sparkles size={12} className="text-zinc-900 mr-1" />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 leading-tight mb-4 tracking-tight">
            개발자 취업 합격 확률을 높이는<br />
            당신만을 위한 <span className="text-blue-600">AI 커리어 코파일럿</span>
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-xl">
            이력서 검증, 포트폴리오 분석, 역량 Gap 보완 프로젝트 추천까지.<br />
            취업 성공률을 높일 구체적인 기술 스택 보완 액션 플랜을 제공합니다.
          </p>

          {/* Perplexity style search prompt bar */}
          <form onSubmit={handleQuerySubmit} className="w-full max-w-2xl flex items-center bg-white border border-zinc-200 rounded-lg p-1.5 shadow-sm focus-within:border-black transition duration-150 mb-5">
            <div className="pl-3 flex items-center justify-center">
              <Search size={16} className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="무엇이든 물어보세요 (예: 내 깃허브 저장소를 분석해서 우대기술 스택과 비교해줘)"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-grow border-0 outline-none text-sm text-zinc-900 py-2 px-3 bg-transparent"
            />
            <button type="submit" className="bg-black text-white border-0 py-2 px-4 rounded-md text-xs font-semibold cursor-pointer flex items-center hover:bg-zinc-800 transition duration-150 shrink-0">
              <Sparkles size={14} className="text-white mr-1" />
              <span>진단 시작</span>
            </button>
          </form>

          {/* Quick Suggestions tags */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-2">
            <span className="text-xs text-zinc-400 mr-1 font-medium">추천 진단 바로가기:</span>
            <button onClick={() => handleSuggestionClick('analysis')} className="bg-white border border-zinc-200 py-1.5 px-3 rounded-md text-xs text-zinc-500 font-medium cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 transition duration-150">
              📊 종합 AI 커리어 리포트 시작
            </button>
            <button onClick={() => handleSuggestionClick('interview')} className="bg-white border border-zinc-200 py-1.5 px-3 rounded-md text-xs text-zinc-500 font-medium cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 transition duration-150">
              💬 AI 모의 면접
            </button>
            <button onClick={() => handleSuggestionClick('dashboard')} className="bg-white border border-zinc-200 py-1.5 px-3 rounded-md text-xs text-zinc-500 font-medium cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 transition duration-150">
              📈 대시보드 로그 확인
            </button>
          </div>
        </div>
      </section>

      {/* Quick Launch Services Grid */}
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
                <Card 
                  title={feat.title} 
                  icon={Icon} 
                  badgeText={feat.badge}
                  badgeType="info"
                  className="group-hover:border-zinc-300 group-hover:shadow-md transition duration-150"
                >
                  <p className="text-xs text-zinc-500 leading-relaxed flex-grow m-0">{feat.desc}</p>
                  <div className="flex items-center justify-end gap-1 mt-4 pt-2.5 border-t border-zinc-100">
                    <span className="text-xs font-semibold text-blue-600">시작하기</span>
                    <ArrowRight size={12} className="text-blue-600 group-hover:translate-x-0.5 transition duration-150" />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step Guide Section */}
      <section className="bg-white rounded-xl py-12 px-8 text-center border border-zinc-200">
        <h2 className="mb-8 text-lg font-bold text-zinc-900">효율적인 취업 준비 플로우</h2>
        <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-6">
          <div className="flex-1 min-w-[200px] flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
            <h4 className="text-sm font-semibold text-zinc-900 m-0">GitHub & 채용공고 분석</h4>
            <p className="text-xs text-zinc-500 m-0">분석할 깃허브 저장소와 가고 싶은 기업의 채용 정보 링크를 넣습니다.</p>
          </div>
          <div className="w-10 h-px bg-zinc-200 shrink-0 md:block hidden" />
          <div className="flex-1 min-w-[200px] flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
            <h4 className="text-sm font-semibold text-zinc-900 m-0">기술 Gap & 이력서 검증</h4>
            <p className="text-xs text-zinc-500 m-0">이력서 내용과 실제 깃허브 코드 내역을 대조하여 부족 스택과 보완점을 진단합니다.</p>
          </div>
          <div className="w-10 h-px bg-zinc-200 shrink-0 md:block hidden" />
          <div className="flex-1 min-w-[200px] flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs font-mono">3</div>
            <h4 className="text-sm font-semibold text-zinc-900 m-0">맞춤형 프로젝트 보완</h4>
            <p className="text-xs text-zinc-500 m-0">도출된 부족 스택(예: Docker, AWS)을 확보할 수 있는 구체적 빌드업 프로젝트를 진행합니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
