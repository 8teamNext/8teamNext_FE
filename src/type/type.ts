interface CrawlSuccess {
  url_index: number;
  status: "success";
  title: string;
  company: string;
  job_type: string;
  tech_stack: string[];
  tasks: string[];
}

interface CrawlFailed {
  url_index: number;
  status: "failed";
  error: string;
}

type CrawlResult = CrawlSuccess | CrawlFailed;

interface CrawlResponse {
  results: CrawlResult[];
}

interface CrawlRequest {
  urls: string[];
}
