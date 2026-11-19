
import { api } from "./api";

export interface RoadmapProgressResponse {
  completed_tasks: Record<string, boolean>;
}

export const roadmapService = {
  async getProgress(sessionId: number): Promise<RoadmapProgressResponse> {
    const response = await api.get<RoadmapProgressResponse>(
      `/simulations/${sessionId}/roadmap-progress`
    );
    return response.data;
  },

  async saveProgress(
    sessionId: number,
    completedTasks: Record<string, boolean>
  ): Promise<void> {
    await api.put(
      `/simulations/${sessionId}/roadmap-progress`,
      { completed_tasks: completedTasks }
    );
  },
};
