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
  score: number;
  title: string;
  message: string;
  options: SimulationOption[];
  feedback?: string | null;
}