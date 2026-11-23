import { api } from "./api";

export interface CareerCoachResponse {
  career_role: string;
  assessment_count: number;
  completed_simulations: number;
  current_xp: number;
  coaching: string;
}

export const careerCoachService = {
  async getInsights(): Promise<CareerCoachResponse> {
    const response = await api.get<CareerCoachResponse>(
      "/career-coach/insights"
    );

    return response.data;
  },
};