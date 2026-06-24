import React from 'react';
import {
  Compass,
  GitBranch,
  MessageSquare,
  LayoutDashboard,
  User,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../utils/api';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

function InfinityLogo() {
  return (
    <svg width="44" height="24" viewBox="0 0 88 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="infGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="35%" stopColor="#22C55E"/>
          <stop offset="65%" stopColor="#FFB347"/>
          <stop offset="100%" stopColor="#16A34A"/>
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#e0fce8"/>
        </radialGradient>
      </defs>

      {/* ∞ 몸통 */}
      <path
        d="M44,22
           C44,12 33,4 22,8
           C11,12 11,32 22,36
           C33,40 44,32 44,22
           C44,12 55,4 66,8
           C77,12 77,32 66,36
           C55,40 44,32 44,22 Z"
        stroke="url(#infGrad1)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 왼쪽 눈 흰자 */}
      <ellipse cx="22" cy="20" rx="6" ry="6.5" fill="url(#eyeGlow)" opacity="0.95"/>
      {/* 왼쪽 눈 홍채 */}
      <circle cx="22" cy="20.5" r="3.8" fill="#16A34A"/>
      {/* 왼쪽 눈 동공 */}
      <circle cx="22.7" cy="20" r="2.1" fill="#0a2010"/>
      {/* 왼쪽 눈 하이라이트 */}
      <circle cx="24" cy="18.5" r="1.0" fill="white" opacity="0.9"/>
      <circle cx="21.2" cy="22.2" r="0.5" fill="white" opacity="0.5"/>

      {/* 오른쪽 눈 흰자 */}
      <ellipse cx="66" cy="20" rx="6" ry="6.5" fill="url(#eyeGlow)" opacity="0.95"/>
      {/* 오른쪽 눈 홍채 */}
      <circle cx="66" cy="20.5" r="3.8" fill="#22C55E"/>
      {/* 오른쪽 눈 동공 */}
      <circle cx="66.7" cy="20" r="2.1" fill="#0a2010"/>
      {/* 오른쪽 눈 하이라이트 */}
      <circle cx="68" cy="18.5" r="1.0" fill="white" opacity="0.9"/>
      <circle cx="65.2" cy="22.2" r="0.5" fill="white" opacity="0.5"/>

      {/* 왼쪽 속눈썹 */}
      <path d="M17,14.5 Q22,12 27,14.5" stroke="#16A34A" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* 오른쪽 속눈썹 */}
      <path d="M61,14.5 Q66,12 71,14.5" stroke="#22C55E" strokeWidth="1.3" fill="none" strokeLinecap="round"/>

      {/* 왼쪽 볼 홍조 */}
      <ellipse cx="15" cy="25" rx="3.5" ry="2" fill="#FFB347" opacity="0.35"/>
      {/* 오른쪽 볼 홍조 */}
      <ellipse cx="73" cy="25" rx="3.5" ry="2" fill="#FFB347" opacity="0.35"/>
    </svg>
  );
}

export default function Navigation({ currentPage, setCurrentPage, user, onLogout }: NavigationProps) {
  const menuItems = [
    { id: 'home', label: '홈', icon: Compass },
    { id: 'analysis', label: '분석', icon: GitBranch },
    { id: 'interview', label: '모의 면접', icon: MessageSquare },
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header className="bg-white border-b border-zinc-100 sticky top-0 z-50 h-[56px] flex items-center shadow-sm">
      <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <InfinityLogo />
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-extrabold text-zinc-900 tracking-tight">AI Career</span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Copilot
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'analysis' && currentPage.startsWith('analysis'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 bg-transparent border-0 py-1.5 px-3 rounded-lg cursor-pointer text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                } : undefined}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="bg-transparent border-0 cursor-pointer flex items-center p-1.5 rounded-lg hover:bg-zinc-50 transition duration-150"
                title="로그아웃"
              >
                <LogOut size={14} className="text-zinc-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="text-white border-0 py-1.5 px-4 rounded-lg font-semibold text-xs cursor-pointer transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
              }}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
