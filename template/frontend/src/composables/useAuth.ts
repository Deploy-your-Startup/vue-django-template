import { computed } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { login, logout, whoAmI } from "../auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["identity"],
    queryFn: whoAmI,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return {
    identity: computed(() => data.value ?? null),
    isAuthenticated: computed(() => Boolean(data.value)),
    isLoading: isPending,
    login,
    logout,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["identity"] }),
  };
}
