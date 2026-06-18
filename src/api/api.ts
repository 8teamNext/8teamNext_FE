import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 크롤링 결과 타입
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

// 채용공고 URL 크롤링
export const crawlJobs = async (urls: string[]): Promise<CrawlResponse> => {
  const response = await client.post<CrawlResponse>("/crawl", { urls });
  return response.data;
};
