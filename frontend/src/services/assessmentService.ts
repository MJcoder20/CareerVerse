
import { api } from "./api";
import type { AssessmentResponse } from "../types/assessment";

export const assessmentService = {
  async getAssessment(sessionId: number): Promise<AssessmentResponse> {
    const response = await api.get<AssessmentResponse>(
      `/simulations/${sessionId}/assessment`
    );

    return response.data;
  },
};
