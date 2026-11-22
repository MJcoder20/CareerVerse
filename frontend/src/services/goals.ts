
import { api } from "./api";

export interface CareerGoal {
  id: number;
  career_role: string;
  target_simulations: number;
  target_xp: number;
  completed_simulations: number;
  current_xp: number;
  simulation_progress: number;
  xp_progress: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CareerGoalInput {
  career_role: string;
  target_simulations: number;
  target_xp: number;
}

export const getCareerGoal = async (): Promise<CareerGoal | null> => {
  const response = await api.get("/goals");
  return response.data;
};

export const createCareerGoal = async (
  goal: CareerGoalInput
): Promise<CareerGoal> => {
  const response = await api.post("/goals", goal);
  return response.data;
};

export const updateCareerGoal = async (
  goal: CareerGoalInput
): Promise<CareerGoal> => {
  const response = await api.put("/goals", goal);
  return response.data;
};
