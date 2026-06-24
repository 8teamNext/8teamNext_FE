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
    <svg width="34" height="18" viewBox="0 0 68 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="infGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="35%" stopColor="#22C55E"/>
          <stop offset="65%" stopColor="#FFB347"/>
          <stop offset="100%" stopColor="#16A34A"/>
        </linearGradient>
      </defs>
      <path
        d="M34,18
           C34,10 26,4 18,7
           C10,10 10,26 18,29
           C26,32 34,26 34,18
           C34,10 42,4 50,7
           C58,10 58,26 50,29
           C42,32 34,26 34,18 Z"
        stroke="url(#infGrad1)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
