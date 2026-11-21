export interface SimulationOption {
  id: string;
  label: string;
}

export interface SimulationResponse {
  session_id: number;
  career: string;
  scenario: string;
  status: string;
  current_step: number;
  total_steps: number;
  completed_steps: number;
  progress: number;
  score: number;
  title: string;
  message: string;
  options: SimulationOption[];
  feedback?: string | null;

  level_up?: {
    previous_level: number;
    new_level: number;
    xp_earned: number;
  };
  newly_unlocked_achievements?: string[];
}