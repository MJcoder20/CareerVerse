
export interface SkillAssessment {
  label: string;
  score: number;
  max_score: number;
  percentage: number;
}

export interface AssessmentRecommendation {
  skill: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  action: string;
  learning_tasks: string[];
  portfolio_project: string;
  completion_goal: string;
}

export interface AssessmentResponse {
  session_id: number;
  overall_score: number;
  max_score: number;
  percentage: number;
  skill_scores: Record<string, SkillAssessment>;
  strengths: string[];
  improvement_areas: string[];
  recommendations: AssessmentRecommendation[];
  summary: string;
  created_at: string;
}
