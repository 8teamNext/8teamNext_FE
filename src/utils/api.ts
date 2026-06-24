// const BASE_URL = 'http://localhost:8000/api';

import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 타입 정의 ──────────────────────────────────────────────────────────────

// 타입 추가

export interface MatchingSuccess {
  status: "success";

  url_index: number;

  title: string;
  company: string;
  job_type: string;

  confirmed_score: number;
  inferred_score: number;

  confirmed_matched: string[];
  inferred_matched: string[];

  missing: string[];

  extra_confirmed: string[];
}

export interface MatchingFailed {
  status: "failed";

  url_index: number;
  error: string;
}

export type MatchingResult = MatchingSuccess | MatchingFailed;

export interface AnalyzeResponse {
  github: GithubPreviewResponse;
  matching: MatchingResult[];
}

// export interface AnalyzeResponse {
//   github: GithubPreviewResponse;
//   matching: MatchingResult[];
// }

export interface GithubPreviewResponse {
  username: string;
  confirmed_skills: string[];
  inferred_skills: string[];
  raw_languages: Record<string, number>;
}

export interface RepoDetail {
  name: string;
  url: string;
  primary_language: string;
  languages: string[];
  readme_status: string;
  stars: number;
  quality_score: number;
  description: string;
  commit_count: number;
}

export interface RecommendedProject {
  title: string;
  description: string;
  technologies: string[];
  missing_skills_covered: string[];
  difficulty: string;
  impact: string;
  architecture: string;
}

export interface UnifiedGithubPart {
  repo_count: number;
  total_commits: number;
  tech_stack: string[];
  readme_quality: string;
  project_completeness: string;
  readme_suggestions: string[];
  repo_details: RepoDetail[];
}

export interface UnifiedResumePart {
  resume_quality: string;
  tech_stack_matching: number;
  verified_skills: string[];
  unverified_skills: string[];
  missing_skills: string[];
}

export interface UnifiedGapPart {
  missing_technologies: string[];
  learning_roadmap: string[];
}

export interface UnifiedAnalysisResponse {
  portfolio_rating: string;
  overall_match_pct: number;
  skill_match_pct: number;
  active_weeks: number;
  total_commits: number;
  repo_coverage_pct: number;
  repo_count: number;
  comparison_result: {
    service: string;
    overall_score: number;
    metrics: { key: string; label: string; score: number; detail: string }[];
    raw: {
      active_weeks: number;
      total_commits: number;
      repo_count: number;
      matched_skills: string[];
      unmatched_skills: string[];
    };
    ai_comment: string;
  };
  github_analysis: UnifiedGithubPart;
  resume_analysis: UnifiedResumePart;
  skill_gap: UnifiedGapPart;
  recommended_projects: RecommendedProject[];
}

export interface UserProfile {
  name: string;
  github_username?: string;
  default_resume?: string;
  default_cover_letter?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  type: string;
  date: string;
  summary: string;
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  intent: string;
  suggested_keywords: string[];
  sample_answer_tip: string;
  sample_answer: string;
}

export interface JobPostingAnalysis {
  summary: string;
  skills: string[];
  extracted_requirements: string[];
  matched: string[];
  unmatched: string[];
}

export interface InterviewGenResponse {
  questions: InterviewQuestion[];
  job_posting_analysis: JobPostingAnalysis | null;
}

export interface CoverLetterCompareResponse {
  overall_summary: string;
  improved_expressions: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
  added_experiences: string[];
  strengthened_techs: string[];
  remaining_gaps: string[];
}

export interface CrawlSuccess {
  url_index: number;
  status: "success";
  title: string;
  company: string;
  job_type: string;
  tech_stack: string[];
  tasks: string[];
}

export interface CrawlFailed {
  url_index: number;
  status: "failed";
  error: string;
}

export type CrawlResult = CrawlSuccess | CrawlFailed;

export interface CrawlResponse {
  results: CrawlResult[];
}

// ── Leancage 분석 타입 ────────────────────────────────────────────────────

export interface LeancageMetric {
  key: string;
  label: string;
  score: number;
  detail: string;
}

export interface LeancageJobComparison {
  url: string;
  company: string;
  title: string;
  job_type: string;
  overall_score: number;
  tech_score: number;
  domain_score: number;
  career_score: number;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
}

export interface LeancageResult {
  service: string;
  overall_score: number;
  metrics: LeancageMetric[];
  raw: {
    match_rate: number;
    matched_skills: string[];
    missing_skills: string[];
    extra_skills: string[];
    overall_evaluation: string;
    career_level: string;
  };
  detail: {
    resume_skills: string[];
    job_required_skills: string[];
    job_comparisons: LeancageJobComparison[];
  };
}
// 이력서-GitHub 분석 결과 타입
export interface ResumeGithubResponse {
  overall_evaluation: string;
  resume_skills: string[];
  github_skills: string[];
  verified_skills: string[];
  unverified_skills: string[];
  newly_discovered_skills: string[];
  supplement_advice: string;   // LLM 이력서 보완 권고
  update_suggestion: string;   // LLM 이력서 업데이트 제안
}

// ── 챗봇 타입 ─────────────────────────────────────────────────────────────

export interface ChatSession {
  session_id: number;
  owner_key: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  message_id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ── API 함수 ───────────────────────────────────────────────────────────────

export const api = {
  // 이력서-채용공고 비교 분석 (leancage)
  analyzeLeancage: (resumeText: string, jobUrls: string[]): Promise<LeancageResult> =>
    client
      .post<LeancageResult>("/leancage/analyze", {
        resume_text: resumeText,
        job_urls: jobUrls,
      })
      .then((r) => r.data),

  // 채용공고 URL 크롤링
  crawlJobs: (urls: string[]): Promise<CrawlResponse> =>
    client.post<CrawlResponse>("/crawl", { urls }).then((r) => r.data),

  // 깃허브
  getGithubPreview: (username: string): Promise<GithubPreviewResponse> =>
    client
      .get<GithubPreviewResponse>("/github/preview", {
        params: { username },
      })
      .then((r) => r.data),

  analyze: (githubUsername: string, jobUrls: string[]) =>
    client
      .post<AnalyzeResponse>("/analyze", {
        github_username: githubUsername,
        job_urls: jobUrls,
      })
      .then((r) => r.data),

  // 종합 분석
  analyzeUnified: (
    githubUrl: string,
    resumeText: string,
    jobUrls: string[],
  ): Promise<UnifiedAnalysisResponse> =>
    client
      .post<UnifiedAnalysisResponse>("/analyze/unified", {
        github_url: githubUrl,
        resume_text: resumeText,
        job_urls: jobUrls,
      })
      .then((r) => r.data),

  analyzeGithub: (repoUrls: string[], jobUrls: string[]): Promise<any> =>
    client
      .post("/analyze/github", {
        repo_urls: repoUrls,
        job_urls: jobUrls,
      })
      .then((r) => r.data),

  analyzeGap: (
    repoUrls: string[],
    resumeText: string,
    jobUrls: string[],
  ): Promise<any> =>
    client
      .post("/analyze/gap", {
        repo_urls: repoUrls,
        resume_text: resumeText,
        job_urls: jobUrls,
      })
      .then((r) => r.data),

  analyzeResumeGithub: (
    resumeText: string,
    resumeUrl: string | null,
    githubUsername: string,
    techStack: string[],
  ): Promise<any> =>
    client
      .post("/analyze/resume-github", {
        resume_text: resumeText,
        resume_url: resumeUrl,
        github_username: githubUsername,
        tech_stack: techStack,
      })
      .then((r) => r.data),

  generateInterviewQuestions: (
    coverLetter: string,
    jobPosting?: string,
  ): Promise<InterviewGenResponse> =>
    client
      .post<InterviewGenResponse>("/analyze/interview-questions", {
        cover_letter: coverLetter,
        job_posting: jobPosting ?? "",
      })
      .then((r) => r.data),

  compareCoverLetters: (
    originalText: string,
    improvedText: string,
  ): Promise<CoverLetterCompareResponse> =>
    client
      .post<CoverLetterCompareResponse>("/analyze/cover-letter-compare", {
        original_text: originalText,
        improved_text: improvedText,
      })
      .then((r) => r.data),

  getProfile: (): Promise<UserProfile> =>
    client.get<UserProfile>("/profile").then((r) => r.data),

  updateProfile: (profileData: UserProfile): Promise<UserProfile> =>
    client.post<UserProfile>("/profile", profileData).then((r) => r.data),

  getHistory: (): Promise<AnalysisHistoryItem[]> =>
    client.get<AnalysisHistoryItem[]>("/history").then((r) => r.data),

  deleteHistoryItem: (
    id: string,
  ): Promise<{ status: string; message: string }> =>
    client
      .delete<{ status: string; message: string }>(`/history/${id}`)
      .then((r) => r.data),

  // ── 챗봇 ─────────────────────────────────────────────────────────────
  chatListSessions: (owner: string): Promise<ChatSession[]> =>
    client.get<ChatSession[]>("/chat/sessions", { params: { owner } }).then((r) => r.data),

  chatCreateSession: (owner: string, title?: string): Promise<ChatSession> =>
    client.post<ChatSession>("/chat/sessions", { owner, title }).then((r) => r.data),

  chatDeleteSession: (sessionId: number): Promise<void> =>
    client.delete(`/chat/sessions/${sessionId}`).then(() => undefined),

  chatRenameSession: (sessionId: number, title: string): Promise<void> =>
    client.patch(`/chat/sessions/${sessionId}`, { title }).then(() => undefined),

  chatGetMessages: (sessionId: number): Promise<ChatMessage[]> =>
    client.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`).then((r) => r.data),

  chatSendMessage: (
    sessionId: number,
    content: string,
  ): Promise<{ role: "assistant"; content: string }> =>
    client
      .post<{ role: "assistant"; content: string }>(
        `/chat/sessions/${sessionId}/messages`,
        { content },
      )
      .then((r) => r.data),
};