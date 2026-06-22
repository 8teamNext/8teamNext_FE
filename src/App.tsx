import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Analysis from "./pages/Analysis";
import Analysistest from "./pages/Analysis_test";
import MockInterview from "./pages/MockInterview";
import Dashboard from "./pages/Dashboard";
import MyPage from "./pages/MyPage";
import { UserProfile, api } from "./utils/api";

export default function App() {
  // const [currentPage, setCurrentPage] = useState<string>("analysistest");
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    api
      .getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {});
  }, []);

  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedProfile,
      };
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home setCurrentPage={setCurrentPage} user={user} />;
      case "login":
        return (
          <Login
            setCurrentPage={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "analysis":
        return <Analysis user={user} setCurrentPage={setCurrentPage} />;
      case "analysistest":
        return <Analysistest />;
      case "interview":
        return <MockInterview />;
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "mypage":
        return <MyPage user={user} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <Home setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      {user !== null && !user.name && currentPage !== "mypage" && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-between gap-4">
          <span>
            프로필이 설정되지 않았습니다. 마이페이지에서 기본정보를
            입력해주세요.
          </span>
          <button
            onClick={() => setCurrentPage("mypage")}
            className="shrink-0 font-semibold underline bg-transparent border-0 cursor-pointer text-amber-900 text-xs"
          >
            지금 설정하기
          </button>
        </div>
      )}

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-6 py-12">
        {renderPage()}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-5 mt-auto">
        <div className="max-w-[1160px] w-full mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-xs text-zinc-500 m-0">
            © 2026 AI Career Copilot. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a
              href="#privacy"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition duration-150"
            >
              개인정보처리방침
            </a>
            <a
              href="#terms"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition duration-150"
            >
              이용약관
            </a>
            <a
              href="#support"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition duration-150"
            >
              고객지원
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
