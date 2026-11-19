export interface DiscoveryRequest {
  interests: string[];
  strengths: string[];
  work_styles: string[];
  priorities: string[];
}

export interface CareerRecommendation {
  career: string;
  description: string;
  match_score: number;
  reasons: string[];
  reality_check: string;
}

export interface DiscoveryResponse {
  recommendations: CareerRecommendation[];
  message: string;
}