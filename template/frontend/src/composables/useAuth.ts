import { computed, type ComputedRef, type Ref } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { login, logout, whoAmI, type Identity } from "../auth";

export function useAuth(): {
  identity: ComputedRef<Identity | null>;
  isAuthenticated: ComputedRef<boolean>;
  isLoading: Ref<boolean>;
  login: typeof login;
  logout: typeof logout;
  refresh: () => Promise<void>;
} {
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
