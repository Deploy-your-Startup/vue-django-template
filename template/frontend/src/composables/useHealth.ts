import { useQuery } from "@tanstack/vue-query";
import services from "../services";

export const fetchHealth = () => services.backend.getHealth();

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}
