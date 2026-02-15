export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Problem {
  id: string;
  user_id: string;
  title: string;
  company_context: string | null;
  difficulty: "Easy" | "Medium" | "Hard";
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  solved_at: string;
  created_at: string;
}

export interface ProblemCreate {
  title: string;
  company_context?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
  solved_at?: string;
}

export interface ProblemUpdate {
  title?: string;
  company_context?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  tags?: string[];
  solved_at?: string;
}

export interface ProblemListResponse {
  items: Problem[];
  total: number;
  page: number;
  size: number;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  created_at: string;
}

export interface ExperienceCreate {
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string | null;
  created_at: string;
}

export interface CertificationCreate {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_url?: string;
}

export interface InterviewQuestion {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  company: string;
  asked_date: string;
  created_at: string;
}

export interface InterviewQuestionCreate {
  question: string;
  answer: string;
  company: string;
  asked_date: string;
}

export interface Learning {
  id: string;
  user_id: string;
  topic: string;
  learned_date: string;
  tags: string[];
  created_at: string;
}

export interface LearningCreate {
  topic: string;
  learned_date?: string;
  tags?: string[];
}

export interface LearningListResponse {
  items: Learning[];
  total: number;
  page: number;
  size: number;
}

export interface DashboardStats {
  total_problems: number;
  total_experiences: number;
  total_certifications: number;
  problems_by_difficulty: Record<string, number>;
  recent_problems: Problem[];
}
