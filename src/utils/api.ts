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
  question: string;
  intent: string;
  suggested_keywords: string[];
  sample_answer_tip: string;
  sample_answer: string;
}

export interface InterviewGenResponse {
  questions: InterviewQuestion[];
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
  task_score: number;
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
  ): Promise<InterviewGenResponse> =>
    client
      .post<InterviewGenResponse>("/analyze/interview-questions", {
        cover_letter: coverLetter,
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
