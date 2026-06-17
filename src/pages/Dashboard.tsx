import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  AlertCircle,
  Code2
} from 'lucide-react';
import Card from '../components/Card';
import { api, UserProfile } from '../utils/api';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile();
        setProfile(profileData);
      } catch (err) {
        setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900 h-10 w-10 mb-4"></div>
        <h3 className="text-sm font-bold text-neutral-900">대시보드 로딩 중...</h3>
      </div>
    );
  }

  // Mock list of target companies for Stripe progress bar display
  const targetCompanies = [
    { name: 'Toss', role: 'Backend Developer', fit: 82, status: 'High' },
    { name: 'Naver', role: 'Spring Engineer', fit: 74, status: 'Medium' },
    { name: 'Kakao', role: 'Server Developer', fit: 65, status: 'Medium' }
  ];

  const mockVerifiedSkills = ['Java', 'Spring Boot', 'MySQL', 'Git', 'TypeScript', 'React.js'];

  return (
    <div className="pb-12 px-4">
      <div className="header-section">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-neutral-900 font-sans">커리어 분석 대시보드 (Dashboard)</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">나의 핵심 기술 입증 현황과 채용 적합도 데이터를 한눈에 파악합니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 py-2.5 px-3.5 rounded-lg mb-4 flex items-center gap-2 text-xs">
          <AlertCircle size={16} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Stripe-style Core Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="포트폴리오 평가 등급" icon={Sparkles}>
          <div className="flex flex-col justify-center h-full py-2">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">A+</span>
            <span className="text-xs text-neutral-500 mt-1">상위 8% 수준 저장소 품질</span>
          </div>
        </Card>
        
        <Card title="검증 완료 기술" icon={ShieldCheck}>
          <div className="flex flex-col justify-center h-full py-2">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">{mockVerifiedSkills.length}개 스택</span>
            <span className="text-xs text-neutral-500 mt-1">이력서 내용 중 코드 입증 완료</span>
          </div>
        </Card>

        <Card title="평균 기업 적합도" icon={TrendingUp}>
          <div className="flex flex-col justify-center h-full py-2">
            <span className="text-3xl font-extrabold text-[#0070f3] tracking-tight leading-none">73.6%</span>
            <span className="text-xs text-neutral-500 mt-1">3개 목표 기업 평균 점수</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Verified tech list */}
        <Card title="입증된 기술 현황 (Verified Skills)" icon={Code2}>
          <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
            나의 GitHub 프로젝트 소스코드에서 정상적으로 구조 및 작동이 식별되어 기재 신뢰도가 입증된 기술입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {mockVerifiedSkills.map(s => (
              <span key={s} className="badge badge-success text-xs py-1 px-2.5">{s}</span>
            ))}
          </div>
        </Card>

        {/* Target Job fit progresses */}
        <Card title="목표 기업 적합도 트래킹" icon={TrendingUp}>
          <div className="flex flex-col gap-4">
            {targetCompanies.map(c => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-neutral-900">{c.name}</span>
                    <span className="text-[11px] text-neutral-500"> - {c.role}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${c.fit >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {c.fit}%
                  </span>
                </div>
                
                {/* Stripe style progress bar */}
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${c.fit}%`,
                      backgroundColor: c.fit >= 80 ? '#10b981' : '#f59e0b'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
