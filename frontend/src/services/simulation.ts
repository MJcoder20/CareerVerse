
import { api } from "./api";
import type { SimulationResponse } from "../types/simulation";
import type { SimulationHistoryItem } from "../types/simulationHistory";

export interface Achievement {
  key: string;
  title: string;
  description: string;
  target: number;
  type: "simulations" | "score";
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  xp_reward: number;
}

export interface UserProgress {
  total_xp: number;
  level: number;
  xp_in_level: number;
  xp_to_next_level: number;
  level_progress: number;
  completed_simulations: number;
  achievements: Achievement[];
}

export interface ScoreHistoryItem {
  session_id: number;
  career_slug: string;
  percentage: number;
  overall_score: number;
  max_score: number;
  completed_at: string;
}

export interface CareerSimulationCount {
  career_slug: string;
  completed_count: number;
}

export interface SkillHistoryItem {
  session_id: number;
  percentage: number;
  completed_at: string;
}

export interface SkillInsight {
  skill: string;
  label: string;
  average_score: number;
  first_score: number;
  latest_score: number;
  change: number;
  trend: "improving" | "declining" | "stable";
  assessment_count: number;
  history: SkillHistoryItem[];
}

export interface SimulationAnalytics {
  total_assessments: number;
  average_score: number;
  highest_score: number;
  latest_score: number | null;
  score_history: ScoreHistoryItem[];
  completed_simulations_by_career: CareerSimulationCount[];
  skill_insights: SkillInsight[];
}

export const simulationService = {
  async start(): Promise<SimulationResponse> {
    const response = await api.post<SimulationResponse>(
      "/simulations/start",
      {
        career_slug: "software-engineer",
        scenario_id: "nexatech-login-outage",
      }
    );

    return response.data;
  },

  async getSession(sessionId: number): Promise<SimulationResponse> {
    const response = await api.get<SimulationResponse>(
      `/simulations/${sessionId}`
    );

    return response.data;
  },

  async getHistory(): Promise<SimulationHistoryItem[]> {
    const response = await api.get<SimulationHistoryItem[]>(
      "/simulations/history"
    );

    return response.data;
  },

  async getProgress(): Promise<UserProgress> {
    const response = await api.get<UserProgress>(
      "/simulations/progress"
    );

    return response.data;
  },

  async getAnalytics(): Promise<SimulationAnalytics> {
    const response = await api.get<SimulationAnalytics>(
      "/simulations/analytics"
    );

    return response.data;
  },

  async submitDecision(
    sessionId: number,
    optionId: string
  ): Promise<SimulationResponse> {
    const response = await api.post<SimulationResponse>(
      `/simulations/${sessionId}/decisions`,
      { option_id: optionId }
    );

    return response.data;
  },
};
