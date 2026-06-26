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


export default function Navigation({ currentPage, setCurrentPage, user, onLogout }: NavigationProps) {
  const menuItems = [
    { id: 'home', label: '홈', icon: Compass },
    { id: 'total-analysis', label: '분석', icon: GitBranch },
    { id: 'interview', label: '모의 면접', icon: MessageSquare },
    { id: 'dashboard', label: '고객센터', icon: LayoutDashboard },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header className="bg-white border-b border-zinc-100 sticky top-0 z-50 h-[68px] flex items-center shadow-sm">
      <div className="max-w-[1160px] w-full mx-auto px-6 flex items-center">
        {/* 좌측 고정 영역 */}
        <div
          className="flex items-center gap-1 cursor-pointer shrink-0 w-[140px]"
          onClick={() => setCurrentPage('home')}
        >
          <img src="/logo.png" width={35} alt="" />
          <span
            style={{
              background: 'linear-gradient(135deg, #0D7A35 0%, #16A34A 60%, #E5A020 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              display: 'inline-block',
              width: '60px',
            }}
          >NEXT</span>
        </div>

        {/* 중앙 네비게이션 — flex-1로 남은 공간 채운 뒤 내부 중앙 정렬 */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'analysis' && currentPage.startsWith('analysis'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 border-0 py-2 px-4 rounded-lg cursor-pointer text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                } : undefined}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 우측 고정 영역 */}
        <div className="flex items-center justify-end shrink-0 w-[140px]">
          {user ? (
            <button
              onClick={onLogout}
              className="bg-transparent border-0 cursor-pointer flex items-center p-1.5 rounded-lg hover:bg-zinc-50 transition-colors duration-150"
              title="로그아웃"
            >
              <LogOut size={14} className="text-zinc-400" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="text-white border-0 py-1.5 px-4 rounded-lg font-semibold text-sm cursor-pointer transition-colors duration-150"
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
