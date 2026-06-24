import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Upload,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Pencil,
} from 'lucide-react';

import { api, UserProfile, AnalysisHistoryItem } from "../utils/api";
import { Group, loadGroupName, saveGroupName } from "../components/Group";
import {
  GROUPS,
  saveGroup,
  loadGroup,
  GroupSelector,
} from "../components/Group";
interface MyPageProps {
  user: UserProfile | null;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
}

export default function MyPage({ user, onProfileUpdate }: MyPageProps) {
  const [activeTab, setActiveTab] = useState("profile"); // profile, history

  //채용공고 저장
  const [groupUrls, setGroupUrls] = useState<Record<Group, string[]>>({
    A: [],
    B: [],
    C: [],
  });

  const [groupNames, setGroupNames] = useState<Record<Group, string>>({
    A: loadGroupName("A"),
    B: loadGroupName("B"),
    C: loadGroupName("C"),
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<Group, boolean>>({
    A: true,
    B: false,
    C: false,
  });
  //디폴트 a그룹 열어둠..
  const [dirtyGroups, setDirtyGroups] = useState<Record<Group, boolean>>({
    A: false,
    B: false,
    C: false,
  });

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [githubUsername, setGithubUsername] = useState(
    user?.github_username || "",
  );
  const [resumeText, setResumeText] = useState(user?.default_resume || "");
  const [coverLetter, setCoverLetter] = useState(
    user?.default_cover_letter || "",
  );

  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 이력서 파일업로드 상태
  const [resumeFileInfo, setResumeFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [resumeFileError, setResumeFileError] = useState<string | null>(null);
  const [resumeExtracting, setResumeExtracting] = useState(false);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  // 자소서 파일업로드 상태
  const [coverFileInfo, setCoverFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [coverFileError, setCoverFileError] = useState<string | null>(null);
  const [coverExtracting, setCoverExtracting] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // 텍스트 추출 후 DB 자동 저장 (백엔드에서 암호화)
  const saveTextToDb = async (newResumeText: string, newCoverLetter: string) => {
    try {
      const updated = await api.updateProfile({
        name,
        github_username: githubUsername,
        default_resume: newResumeText,
        default_cover_letter: newCoverLetter,
      });
      onProfileUpdate(updated);
      setSuccess('파일이 암호화되어 저장되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('파일 저장 중 오류가 발생했습니다.');
    }
  };

  const extractText = async (
    file: File,
    setInfo: (i: { name: string; size: string } | null) => void,
    setFileError: (e: string | null) => void,
    setExtracting: (b: boolean) => void,
  ): Promise<string | null> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(ext ?? '')) {
      setFileError('지원 형식: PDF, TXT, MD');
      setInfo(null);
      return null;
    }
    setInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    setFileError(null);

    if (ext === 'pdf') {
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('http://localhost:8000/api/parse-resume', { method: 'POST', body: fd });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'PDF 추출 실패'); }
        const data = await res.json();
        return data.text as string;
      } catch (e: any) {
        setFileError(e.message || 'PDF 추출 오류');
        setInfo(null);
        return null;
      } finally { setExtracting(false); }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string ?? null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    });
  };

  const handleResumeFile = async (file: File) => {
    const text = await extractText(file, setResumeFileInfo, setResumeFileError, setResumeExtracting);
    if (text === null) return;
    setResumeText(text);
    await saveTextToDb(text, coverLetter);
  };

  const handleCoverFile = async (file: File) => {
    const text = await extractText(file, setCoverFileInfo, setCoverFileError, setCoverExtracting);
    if (text === null) return;
    setCoverLetter(text);
    await saveTextToDb(resumeText, text);
  };

  // user prop이 바뀌면 (App.tsx의 API fetch 완료 시) 폼 상태 동기화
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGithubUsername(user.github_username || '');
      setResumeText(user.default_resume || '');
      setCoverLetter(user.default_cover_letter || '');
      if (user.default_resume && !resumeFileInfo) {
        setResumeFileInfo({ name: '저장된 이력서', size: '암호화 저장됨' });
      }
      if (user.default_cover_letter && !coverFileInfo) {
        setCoverFileInfo({ name: '저장된 자기소개서', size: '암호화 저장됨' });
      }
    }
  }, [user]);

  useEffect(() => {
    // console.log("A", loadGroup("A"));
    // console.log("B", loadGroup("B"));
    // console.log("C", loadGroup("C"));
    //디버깅(채용공고 url)
    setGroupUrls({
      A: loadGroup("A"),
      B: loadGroup("B"),
      C: loadGroup("C"),
    });
  }, []);

  // Fetch initial profile & history on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile();
        setName(profileData.name);
        setGithubUsername(profileData.github_username ?? '');
        setResumeText(profileData.default_resume ?? '');
        setCoverLetter(profileData.default_cover_letter ?? '');
        if (profileData.default_resume) {
          setResumeFileInfo({ name: '저장된 이력서', size: '암호화 저장됨' });
        }
        if (profileData.default_cover_letter) {
          setCoverFileInfo({ name: '저장된 자기소개서', size: '암호화 저장됨' });
        }
      } catch (err) {
        setError("프로필 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const historyData = await api.getHistory();
        setHistory(historyData);
      } catch {
        // 히스토리 조회 실패는 조용히 처리
      }
    };

    fetchProfile();
    fetchHistory();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const payload = {
      name,
      github_username: githubUsername,
      default_resume: resumeText,
      default_cover_letter: coverLetter,
    };

    try {
      const updated = await api.updateProfile(payload);
      onProfileUpdate(updated);
      setSuccess("프로필 및 기본 문서가 성공적으로 업데이트되었습니다.");
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        detail
          ? `저장 오류: ${detail}`
          : "프로필을 저장하는 도중 오류가 발생했습니다.",
      );
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm("이 분석 기록을 삭제하시겠습니까?")) return;

    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      setError("분석 기록을 삭제하는 중 오류가 발생했습니다.");
    }
  };
  // 채용공고
  const handleAddUrl = (group: Group) => {
    setGroupUrls((prev) => ({
      ...prev,
      [group]: [...prev[group], ""],
    }));

    setDirtyGroups((prev) => ({
      ...prev,
      [group]: true,
    }));
  };

  const handleChangeUrl = (group: Group, index: number, value: string) => {
    setGroupUrls((prev) => ({
      ...prev,
      [group]: prev[group].map((url, i) => (i === index ? value : url)),
    }));

    setDirtyGroups((prev) => ({
      ...prev,
      [group]: true,
    }));
  };

  const handleRemoveUrl = (group: Group, index: number) => {
    setGroupUrls((prev) => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== index),
    }));

    setDirtyGroups((prev) => ({
      ...prev,
      [group]: true,
    }));
  };
  const toggleGroup = (group: Group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleGroupNameChange = (group: Group, value: string) => {
    setGroupNames((prev) => ({
      ...prev,
      [group]: value,
    }));

    setDirtyGroups((prev) => ({
      ...prev,
      [group]: true,
    }));
  };

  const handleSaveGroup = (group: Group) => {
    const cleaned = groupUrls[group].map((url) => url.trim()).filter(Boolean);

    saveGroup(group, cleaned);

    saveGroupName(group, groupNames[group].trim());

    setDirtyGroups((prev) => ({
      ...prev,
      [group]: false,
    }));

    setSuccess(`그룹 ${group} 저장 완료`);

    setTimeout(() => {
      setSuccess(null);
    }, 2000);
  };
  //여기까지
  // console.log(localStorage.getItem("job_urls_group_A"));
  const getHistoryBadgeClass = (type: string) => {
    switch (type) {
      case "github":
        return "badge badge-success";
      case "gap":
        return "badge badge-warning";
      case "resume-github":
        return "badge badge-info";
      case "interview":
        return "badge badge-info";
      default:
        return "badge badge-info";
    }
  };

  const getHistoryBadgeText = (type: string) => {
    switch (type) {
      case "github":
        return "GitHub 분석";
      case "gap":
        return "Gap 분석";
      case "resume-github":
        return "이력서-GitHub 검증";
      case "interview":
        return "AI 면접 질문";
      case "cover-letter":
        return "자소서 비교";
      default:
        return "진단 분석";
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "github":
        return <Github size={16} className="text-zinc-600" />;
      case "gap":
        return <Activity size={16} className="text-amber-600" />;
      case "resume-github":
        return <FileText size={16} className="text-blue-600" />;
      case "interview":
        return <MessageSquare size={16} className="text-indigo-600" />;
      case "cover-letter":
        return <Sparkles size={16} className="text-purple-600" />;
      default:
        return <History size={16} className="text-zinc-600" />;
    }
  };

  const getHistoryIconBg = (type: string) => {
    switch (type) {
      case "github":
        return "bg-zinc-100";
      case "gap":
        return "bg-amber-50";
      case "resume-github":
        return "bg-blue-50";
      case "interview":
        return "bg-indigo-50";
      case "cover-letter":
        return "bg-purple-50";
      default:
        return "bg-zinc-100";
    }
  };

  return (
    <div className="pb-12 px-4">
      <div className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-bold text-zinc-900 m-0 mb-1.5 font-sans">
          마이페이지
        </h1>
        <p className="text-xs text-zinc-500 m-0">
          기본 인적 사항 및 이력서/자기소개서 파일을 관리하고 이전의 AI 분석
          기록을 확인합니다.
        </p>
      </div>

      {/* Profile / History Tab buttons */}
      <div className="flex gap-1 border-b border-zinc-200 pb-2 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-2 px-3.5 text-xs font-medium cursor-pointer rounded-md transition duration-150 ${
            activeTab === "profile"
              ? "bg-zinc-100 text-zinc-900 font-semibold"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Settings size={15} />
          <span>내 정보 & 기본 문서 관리</span>
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-2 px-3.5 text-xs font-medium cursor-pointer rounded-md transition duration-150 ${
            activeTab === "groups"
              ? "bg-zinc-100 text-zinc-900 font-semibold"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <FolderOpen size={15} />
          <span>채용공고 그룹</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-2 px-3.5 text-xs font-medium cursor-pointer rounded-md transition duration-150 ${
            activeTab === "history"
              ? "bg-zinc-100 text-zinc-900 font-semibold"
              : "text-zinc-500 hover:text-zinc-900"
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
      {activeTab === "profile" ? (
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Settings */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 m-0 mb-0.5">
                인적 사항 및 깃허브 설정
              </h3>
              <p className="text-xs text-zinc-500 m-0 mb-5">
                기본 분석 요청에 사용될 계정 정보입니다.
              </p>

              <div className="form-group mb-5">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  이름
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  기본 GitHub 계정명
                </label>
                <div className="flex items-center border border-zinc-200 rounded-md px-2 py-0.5 bg-white">
                  <Github size={15} className="text-zinc-400 mr-1.5 shrink-0" />
                  <span className="text-xs text-zinc-400 font-mono shrink-0 select-none">
                    github.com/
                  </span>
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
              <p className="text-xs text-zinc-500 m-0 mb-5">파일을 업로드하면 암호화되어 저장되며, 분석 시 자동으로 불러옵니다.</p>

              {/* 이력서 업로드 */}
              <div className="form-group mb-5">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">기본 이력서</label>
                <input ref={resumeFileRef} type="file" accept=".txt,.md,.pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleResumeFile(e.target.files[0]); }} />
                <div
                  onClick={() => resumeFileRef.current?.click()}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-150 mb-2"
                  style={{
                    border: `1.5px dashed ${resumeFileInfo ? '#10b981' : '#d1d5db'}`,
                    background: resumeFileInfo ? '#f0fdf4' : '#fafafa',
                  }}
                >
                  {resumeExtracting ? (
                    <><Loader2 size={16} className="animate-spin shrink-0 text-zinc-500" />
                    <span className="text-xs text-zinc-600">PDF 추출 중...</span></>
                  ) : resumeFileInfo ? (
                    <><CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-green-700 truncate">{resumeFileInfo.name}</div>
                      <div className="text-[10px] text-zinc-400">{resumeFileInfo.size} · 클릭하여 변경</div>
                    </div></>
                  ) : (
                    <><Upload size={16} className="text-zinc-400 shrink-0" />
                    <div><div className="text-xs font-semibold text-zinc-700">이력서 업로드 (PDF/TXT/MD)</div>
                    <div className="text-[10px] text-zinc-400">{resumeText ? '파일 교체 또는 클릭' : '클릭하여 파일 선택'}</div></div></>
                  )}
                </div>
                {resumeFileError && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={11} />{resumeFileError}</p>}
              </div>

              {/* 자소서 업로드 */}
              <div className="form-group mb-0">
                <label className="form-label block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">기본 자기소개서</label>
                <input ref={coverFileRef} type="file" accept=".txt,.md,.pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleCoverFile(e.target.files[0]); }} />
                <div
                  onClick={() => coverFileRef.current?.click()}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-150 mb-2"
                  style={{
                    border: `1.5px dashed ${coverFileInfo ? '#10b981' : '#d1d5db'}`,
                    background: coverFileInfo ? '#f0fdf4' : '#fafafa',
                  }}
                >
                  {coverExtracting ? (
                    <><Loader2 size={16} className="animate-spin shrink-0 text-zinc-500" />
                    <span className="text-xs text-zinc-600">PDF 추출 중...</span></>
                  ) : coverFileInfo ? (
                    <><CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-green-700 truncate">{coverFileInfo.name}</div>
                      <div className="text-[10px] text-zinc-400">{coverFileInfo.size} · 클릭하여 변경</div>
                    </div></>
                  ) : (
                    <><Upload size={16} className="text-zinc-400 shrink-0" />
                    <div><div className="text-xs font-semibold text-zinc-700">자기소개서 업로드 (PDF/TXT/MD)</div>
                    <div className="text-[10px] text-zinc-400">{coverLetter ? '파일 교체 또는 클릭' : '클릭하여 파일 선택'}</div></div></>
                  )}
                </div>
                {coverFileError && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={11} />{coverFileError}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary py-2 px-5 text-xs">
              <Save size={15} /> 변경 내용 저장하기
            </button>
          </div>
        </form>
      ) : // 채용공고 그룹 화면
      activeTab === "groups" ? (
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div
              key={group}
              className="bg-white border border-zinc-200 rounded-xl p-5"
            >
              {/* <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    그룹 {group}
                  </h3>
                  <p className="text-xs text-zinc-500">저장된 채용공고 URL</p>
                </div>

                <span className="text-xs text-zinc-400">
                  {groupUrls[group].length}개
                </span>
              </div> */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleGroup(group)}
                >
                  {expandedGroups[group] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}

                  <input
                    value={groupNames[group]}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleGroupNameChange(group, e.target.value)
                    }
                    className="font-semibold bg-transparent border-none outline-none"
                  />

                  <Pencil size={12} className="text-zinc-400" />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="
                    px-2 py-1
                    text-xs
                    rounded-full
                    bg-green-50
                    text-green-700
                  "
                  >
                    {groupUrls[group].length}
                  </span>

                  {dirtyGroups[group] && (
                    <span className="text-xs text-amber-600">저장 안됨</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveGroup(group)}
                    className="
                    text-xs
                    px-2 py-1
                    rounded-lg
                    bg-green-600
                    text-white
                  "
                  >
                    저장
                  </button>
                </div>
              </div>
              {/*  */}
              {expandedGroups[group] && (
                <>
                  <div className="space-y-2">
                    {groupUrls[group].map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) =>
                            handleChangeUrl(group, index, e.target.value)
                          }
                          className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-xs"
                        />

                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg hover:bg-zinc-100"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => handleRemoveUrl(group, index)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleAddUrl(group)}
                      className="flex items-center gap-1 px-3 py-2 text-xs border rounded-lg"
                    >
                      <Plus size={12} />
                      URL 추가
                    </button>
                  </div>
                </>
              )}
              {/*  */}
            </div>
          ))}
        </div>
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
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getHistoryIconBg(item.type)}`}
                    >
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
                        alert(
                          `해당 분석 레포트는 분석 결과 탭 또는 대시보드 페이지에서 상세하게 확인하실 수 있습니다.`,
                        );
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
              <h4 className="text-sm font-semibold text-zinc-900 m-0">
                저장된 분석 기록이 없습니다.
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                GitHub 분석이나 Gap 분석을 진행하여 레포트를 생성해보세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
