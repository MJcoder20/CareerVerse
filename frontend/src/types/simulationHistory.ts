export interface SimulationHistoryItem {
  session_id: number;
  career: string;
  scenario: string;
  status: "in_progress" | "completed";
  score: number;
  created_at: string;
}