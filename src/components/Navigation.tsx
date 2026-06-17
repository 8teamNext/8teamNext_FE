import React from 'react';
import { 
  Compass, 
  GitBranch, 
  MessageSquare, 
  LayoutDashboard,
  User, 
  Sparkles,
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
  // Simplified menu items (5 top-level items)
  const menuItems = [
    { id: 'home', label: '홈', icon: Compass },
    { id: 'analysis', label: '분석', icon: GitBranch },
    { id: 'interview', label: '모의 면접', icon: MessageSquare },
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 h-[52px] flex items-center">
      <div className="max-w-[1160px] w-full mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="bg-black w-6.5 h-6.5 rounded-md flex items-center justify-center">
            <Sparkles size={15} className="text-white -rotate-10" />
          </div>
          <span className="text-sm font-bold text-zinc-900 tracking-tight">AI Career Copilot</span>
        </div>
        
        <nav className="flex items-center gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'analysis' && currentPage.startsWith('analysis'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 bg-transparent border-0 py-1.5 px-2 cursor-pointer text-xs font-medium transition duration-150 border-b-2 ${
                  isActive 
                    ? 'text-zinc-900 font-semibold border-black' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 bg-zinc-50 py-0.5 px-1.5 rounded border border-zinc-200 font-mono">
                {user.name}
              </span>
              <button 
                onClick={onLogout} 
                className="bg-transparent border-0 cursor-pointer flex items-center p-1 rounded hover:bg-zinc-50 transition duration-150"
                title="로그아웃"
              >
                <LogOut size={14} className="text-zinc-400" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')} 
              className="bg-black text-white border-0 py-1.5 px-3 rounded-md font-semibold text-xs cursor-pointer hover:bg-zinc-800 transition duration-150"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
