import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationReturnType,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import services from "../services";
import type { EntryResponse } from "../services/backend/generated";

export function useEntries(): {
  entries: UseQueryReturnType<EntryResponse[], Error>;
  create: UseMutationReturnType<EntryResponse, Error, string, unknown>;
} {
  const queryClient = useQueryClient();
  const entries = useQuery({
    queryKey: ["entries"],
    queryFn: () => services.backend.getEntries(),
  });
  const create = useMutation({
    mutationFn: (title: string) =>
      services.backend.createEntry({ entryRequest: { title } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  });
  return { entries, create };
}
