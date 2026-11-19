import { api } from "./api";
import type {
  DiscoveryRequest,
  DiscoveryResponse,
} from "../types/discovery";

export const discoveryService = {
  async getRecommendations(
    data: DiscoveryRequest
  ): Promise<DiscoveryResponse> {
    const response = await api.post<DiscoveryResponse>(
      "/discovery/recommendations",
      data
    );

    return response.data;
  },
};