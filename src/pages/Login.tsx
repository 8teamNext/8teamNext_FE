import React, { useState } from 'react';
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { UserProfile } from '../utils/api';

interface LoginProps {
  setCurrentPage: (page: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ setCurrentPage, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate API authentication call
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: email,
        name: email.split('@')[0],
        github_username: 'github-user',
        default_resume: '',
        default_cover_letter: ''
      });
      setCurrentPage('home');
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: `${provider.toLowerCase()}_user@example.com`,
        name: provider === 'Google' ? '구글 사용자' : '카카오 사용자',
        github_username: `${provider.toLowerCase()}-dev`,
        default_resume: '',
        default_cover_letter: ''
      });
      setCurrentPage('home');
    }, 600);
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-[400px] w-full">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-black w-9 h-9 rounded-lg flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 m-0 mb-1.5">AI Career Copilot</h2>
            <p className="text-xs text-zinc-500 m-0">계정에 로그인하여 상세 분석 보고서를 관리해보세요.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-md text-xs flex items-center gap-2 mb-5">
              <AlertCircle size={15} className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="w-full">
            <div className="form-group mb-5">
              <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">이메일 주소</label>
              <div className="relative flex items-center">
                <Mail size={15} className="text-zinc-400 absolute left-3 z-10" />
                <input
                  type="email"
                  className="form-input pl-9"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-5">
              <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">비밀번호</label>
              <div className="relative flex items-center">
                <Lock size={15} className="text-zinc-400 absolute left-3 z-10" />
                <input
                  type="password"
                  className="form-input pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm mt-2"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </form>

          <div className="flex items-center justify-center my-5 w-full">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="px-2.5 text-[10px] text-zinc-400 font-medium whitespace-nowrap">또는 소셜 로그인</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={() => handleSocialLogin('Kakao')}
              disabled={loading}
              className="w-full py-2.5 border-0 rounded-md font-semibold text-xs cursor-pointer flex items-center justify-center transition duration-150 bg-[#FEE500] text-[#191919]"
            >
              <span>카카오로 로그인</span>
            </button>
            
            <button
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              className="w-full py-2.5 border border-zinc-200 rounded-md font-semibold text-xs cursor-pointer flex items-center justify-center transition duration-150 bg-white text-zinc-900 hover:bg-zinc-50"
            >
              <span>Google 계정으로 로그인</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
