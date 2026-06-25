import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Analysis from "./pages/Analysis";
import Analysistest from "./pages/Analysis_test";
import LeancageAnalysisTest from "./pages/leancageAnalysis_test";
import ResumeGithubDetail from "./pages/ResumeGithubDetail";
import MockInterview from "./pages/MockInterview";
import Dashboard from "./pages/Dashboard";
import MyPage from "./pages/MyPage";
import TotalAnalysis from "./pages/TotalAnalysis";
import { UserProfile, ResumeGithubResponse, api } from "./utils/api";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  // const [currentPage, setCurrentPage] = useState<string>("total-analysis");
  const [currentPage, setCurrentPage] = useState<string>("analysistest"); //민정님
  // const [currentPage, setCurrentPage] = useState<string>("leancage-test"); //팀장님
  // const [currentPage, setCurrentPage] = useState<string>("home"); //채란님
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumeGithubResult, setResumeGithubResult] =
    useState<ResumeGithubResponse | null>(null);

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
        return (
          <Analysis
            user={user}
            setCurrentPage={setCurrentPage}
            onResumeGithubResult={(r) => setResumeGithubResult(r)}
          />
        );
      case "analysistest":
        return <Analysistest />;
      case "resume-github-detail":
        return resumeGithubResult ? (
          <ResumeGithubDetail
            result={resumeGithubResult}
            githubUsername={user?.github_username || ""}
            onBack={() => setCurrentPage("analysis")}
          />
        ) : (
          <Analysis
            user={user}
            setCurrentPage={setCurrentPage}
            onResumeGithubResult={(r) => setResumeGithubResult(r)}
          />
        );
      case "analysistest":
        return <Analysistest />;
      case "total-analysis":
        return <TotalAnalysis />;
      case "leancage-test":
        return <LeancageAnalysisTest />;
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

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-6 py-12">
        {renderPage()}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-5 mt-auto">
        <div className="max-w-[1160px] w-full mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-xs text-zinc-500 m-0">
            © 2026 넥스트. All rights reserved.
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

      <ChatWidget user={user} />
    </div>
  );
}
