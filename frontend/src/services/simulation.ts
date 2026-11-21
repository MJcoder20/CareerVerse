
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
