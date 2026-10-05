import { useQuery } from "@tanstack/vue-query";

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error("Backend unavailable");
  return response.json();
}

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}
