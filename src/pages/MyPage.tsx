import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  History, 
  Trash2, 
  Save, 
  Github, 
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api, UserProfile, AnalysisHistoryItem } from '../utils/api';

interface MyPageProps {
  user: UserProfile | null;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
}

export default function MyPage({ user, onProfileUpdate }: MyPageProps) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, history
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [githubUsername, setGithubUsername] = useState(user?.github_username || '');
  const [resumeText, setResumeText] = useState(user?.default_resume || '');
  const [coverLetter, setCoverLetter] = useState(user?.default_cover_letter || '');
  
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch initial profile & history on mount
  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile();
        setName(profileData.name);
        setEmail(profileData.email);
        setGithubUsername(profileData.github_username);
        setResumeText(profileData.default_resume);
        setCoverLetter(profileData.default_cover_letter);

        const historyData = await api.getHistory();
        setHistory(historyData);
      } catch (err) {
        setError('마이페이지 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const payload = {
      email,
      name,
      github_username: githubUsername,
      default_resume: resumeText,
      default_cover_letter: coverLetter
    };

    try {
      const updated = await api.updateProfile(payload);
      onProfileUpdate(updated);
      setSuccess('프로필 및 기본 문서가 성공적으로 업데이트되었습니다.');
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('프로필을 저장하는 도중 오류가 발생했습니다.');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('이 분석 기록을 삭제하시겠습니까?')) return;
    
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      setError('분석 기록을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const getHistoryBadgeClass = (type: string) => {
    switch (type) {
      case 'github': return 'badge badge-success';
      case 'gap': return 'badge badge-warning';
      case 'resume-github': return 'badge badge-info';
      case 'interview': return 'badge badge-info';
      default: return 'badge badge-info';
    }
  };

  const getHistoryBadgeText = (type: string) => {
    switch (type) {
      case 'github': return 'GitHub 분석';
      case 'gap': return 'Gap 분석';
      case 'resume-github': return '이력서-GitHub 검증';
      case 'interview': return 'AI 면접 질문';
      case 'cover-letter': return '자소서 비교';
      default: return '진단 분석';
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github size={16} className="text-zinc-600" />;
      case 'gap': return <Activity size={16} className="text-amber-600" />;
      case 'resume-github': return <FileText size={16} className="text-blue-600" />;
      case 'interview': return <MessageSquare size={16} className="text-indigo-600" />;
      case 'cover-letter': return <Sparkles size={16} className="text-purple-600" />;
      default: return <History size={16} className="text-zinc-600" />;
    }
  };

  const getHistoryIconBg = (type: string) => {
    switch (type) {
      case 'github': return 'bg-zinc-100';
      case 'gap': return 'bg-amber-50';
      case 'resume-github': return 'bg-blue-50';
      case 'interview': return 'bg-indigo-50';
      case 'cover-letter': return 'bg-purple-50';
      default: return 'bg-zinc-100';
    }
  };

  return (
    <div className="pb-12 px-4">
      <div className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-bold text-zinc-900 m-0 mb-1.5 font-sans">마이페이지</h1>
        <p className="text-xs text-zinc-500 m-0">기본 인적 사항 및 이력서/자기소개서 파일을 관리하고 이전의 AI 분석 기록을 확인합니다.</p>
      </div>

      {/* Profile / History Tab buttons */}
      <div className="flex gap-1 border-b border-zinc-200 pb-2 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-2 px-3.5 text-xs font-medium cursor-pointer rounded-md transition duration-150 ${
            activeTab === 'profile' ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Settings size={15} />
          <span>내 정보 & 기본 문서 관리</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-2 px-3.5 text-xs font-medium cursor-pointer rounded-md transition duration-150 ${
            activeTab === 'history' ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <History size={15} />
          <span>과거 분석 기록 ({history.length}건)</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-md text-xs flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-md text-xs font-semibold mb-4">
          <span>{success}</span>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Settings */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 m-0 mb-0.5">인적 사항 및 깃허브 설정</h3>
              <p className="text-xs text-zinc-500 m-0 mb-5">기본 분석 요청에 사용될 계정 정보입니다.</p>

              <div className="form-group mb-5">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">이름</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-5">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">이메일 주소</label>
                <input
                  type="email"
                  className="form-input bg-zinc-50 text-zinc-400 cursor-not-allowed"
                  value={email}
                  disabled
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">기본 GitHub 계정명</label>
                <div className="flex items-center border border-zinc-200 rounded-md px-2 py-0.5 bg-white">
                  <Github size={15} className="text-zinc-400 mr-1.5 shrink-0" />
                  <span className="text-xs text-zinc-400 font-mono shrink-0 select-none">github.com/</span>
                  <input
                    type="text"
                    className="flex-grow border-0 outline-none p-1 text-xs text-zinc-900 font-mono bg-transparent"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Resume & CV Storage */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 m-0 mb-0.5">기본 이력서 및 자기소개서</h3>
              <p className="text-xs text-zinc-500 m-0 mb-5">분석 실행 시 파일이 제공되지 않을 때 자동 대입될 기본 문서 내용입니다.</p>

              <div className="form-group mb-5">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">기본 이력서 텍스트</label>
                <textarea
                  className="form-textarea min-h-[110px] text-xs"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">기본 자기소개서 텍스트</label>
                <textarea
                  className="form-textarea min-h-[110px] text-xs"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary py-2 px-5 text-xs">
              <Save size={15} /> 변경 내용 저장하기
            </button>
          </div>
        </form>
      ) : (
        /* History Log List - Premium Activity Feed Design */
        <div className="w-full">
          {history.length > 0 ? (
            <div className="flex flex-col gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-xs transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Left Icon circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getHistoryIconBg(item.type)}`}>
                      {getHistoryIcon(item.type)}
                    </div>

                    {/* Middle Info */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={getHistoryBadgeClass(item.type)}>
                          {getHistoryBadgeText(item.type)}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {item.date}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-950 m-0 leading-normal">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0 border-t border-zinc-50 pt-3 md:border-0 md:pt-0">
                    <button
                      onClick={() => {
                        alert(`해당 분석 레포트는 분석 결과 탭 또는 대시보드 페이지에서 상세하게 확인하실 수 있습니다.`);
                      }}
                      className="btn btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
                    >
                      상세 보기 <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="bg-transparent border-0 cursor-pointer p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors duration-150 inline-flex items-center justify-center"
                      title="기록 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 px-8 bg-white rounded-xl border border-zinc-200 text-center gap-1.5 shadow-xs">
              <AlertCircle size={28} className="text-zinc-400" />
              <h4 className="text-sm font-semibold text-zinc-900 m-0">저장된 분석 기록이 없습니다.</h4>
              <p className="text-xs text-zinc-500 m-0">GitHub 분석이나 Gap 분석을 진행하여 레포트를 생성해보세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
