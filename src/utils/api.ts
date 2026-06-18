const BASE_URL = 'http://localhost:8000/api';

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
  email: string;
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
  improved_expressions: Array<{ original: string; improved: string; reason: string }>;
  added_experiences: string[];
  strengthened_techs: string[];
  remaining_gaps: string[];
}

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP error! Status: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null as unknown as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Unified AI Career Analysis
  analyzeUnified: (githubUrl: string, resumeText: string, jobUrls: string[]): Promise<UnifiedAnalysisResponse> => {
    return request<UnifiedAnalysisResponse>('/analyze/unified', {
      method: 'POST',
      body: { github_url: githubUrl, resume_text: resumeText, job_urls: jobUrls }
    });
  },

  // 1. GitHub Analysis
  analyzeGithub: (repoUrls: string[], jobUrls: string[]): Promise<any> => {
    return request<any>('/analyze/github', {
      method: 'POST',
      body: { repo_urls: repoUrls, job_urls: jobUrls }
    });
  },

  // 2. Gap Analysis
  analyzeGap: (repoUrls: string[], resumeText: string, jobUrls: string[]): Promise<any> => {
    return request<any>('/analyze/gap', {
      method: 'POST',
      body: { repo_urls: repoUrls, resume_text: resumeText, job_urls: jobUrls }
    });
  },

  // 3. Resume-GitHub Link Analysis
  analyzeResumeGithub: (resumeText: string, resumeUrl: string | null, githubUsername: string, techStack: string[]): Promise<any> => {
    return request<any>('/analyze/resume-github', {
      method: 'POST',
      body: {
        resume_text: resumeText,
        resume_url: resumeUrl,
        github_username: githubUsername,
        tech_stack: techStack
      }
    });
  },

  // 4. AI Interview Question Generator
  generateInterviewQuestions: (coverLetter: string): Promise<InterviewGenResponse> => {
    return request<InterviewGenResponse>('/analyze/interview-questions', {
      method: 'POST',
      body: { cover_letter: coverLetter }
    });
  },

  // 5. Cover Letter Comparison
  compareCoverLetters: (originalText: string, improvedText: string): Promise<CoverLetterCompareResponse> => {
    return request<CoverLetterCompareResponse>('/analyze/cover-letter-compare', {
      method: 'POST',
      body: { original_text: originalText, improved_text: improvedText }
    });
  },

  // 6. Profile Management
  getProfile: (): Promise<UserProfile> => {
    return request<UserProfile>('/profile', { method: 'GET' });
  },

  updateProfile: (profileData: UserProfile): Promise<UserProfile> => {
    return request<UserProfile>('/profile', {
      method: 'POST',
      body: profileData
    });
  },

  // 7. History Logs
  getHistory: (): Promise<AnalysisHistoryItem[]> => {
    return request<AnalysisHistoryItem[]>('/history', { method: 'GET' });
  },

  deleteHistoryItem: (id: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/history/${id}`, { method: 'DELETE' });
  }
};
