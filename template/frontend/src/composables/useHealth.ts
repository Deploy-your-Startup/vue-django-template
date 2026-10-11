import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import services from "../services";
import type { HealthResponse } from "../services/backend/generated";

export const fetchHealth = (): Promise<HealthResponse> =>
  services.backend.getHealth();

export function useHealth(): UseQueryReturnType<HealthResponse, Error> {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}
