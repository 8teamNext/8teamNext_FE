// const BASE_URL = 'http://localhost:8000/api';

import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 타입 정의 ──────────────────────────────────────────────────────────────

export interface RepoDetail {
  name: string;
  url: string;
  primary_language: string;
  languages: string[];
  readme_status: string;
  stars: number;
  quality_score: number;
  description: string;
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
  overall_score: number;
  portfolio_rating: string;
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

// 크롤링 타입
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

// ── API 함수 ───────────────────────────────────────────────────────────────

export const api = {
  // 채용공고 URL 크롤링
  crawlJobs: (urls: string[]): Promise<CrawlResponse> =>
    client.post<CrawlResponse>("/crawl", { urls }).then((r) => r.data),

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

  // GitHub 분석
  analyzeGithub: (repoUrls: string[], jobUrls: string[]): Promise<any> =>
    client
      .post("/analyze/github", { repo_urls: repoUrls, job_urls: jobUrls })
      .then((r) => r.data),

  // Gap 분석
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

  // 이력서-GitHub 연계 분석
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

  // 면접 질문 생성
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

  // 자소서 비교
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

  // 프로필 조회
  getProfile: (): Promise<UserProfile> =>
    client.get<UserProfile>("/profile").then((r) => r.data),

  // 프로필 수정
  updateProfile: (profileData: UserProfile): Promise<UserProfile> =>
    client.post<UserProfile>("/profile", profileData).then((r) => r.data),

  // 히스토리 조회
  getHistory: (): Promise<AnalysisHistoryItem[]> =>
    client.get<AnalysisHistoryItem[]>("/history").then((r) => r.data),

  // 히스토리 삭제
  deleteHistoryItem: (
    id: string,
  ): Promise<{ status: string; message: string }> =>
    client
      .delete<{ status: string; message: string }>(`/history/${id}`)
      .then((r) => r.data),
};
