import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Problem, ProblemCreate, ProblemListResponse, ProblemUpdate } from "@/types";

export function useProblems(params: {
  page?: number;
  size?: number;
  difficulty?: string;
  search?: string;
  tag?: string;
} = {}) {
  const { page = 1, size = 10, difficulty, search, tag } = params;

  return useQuery({
    queryKey: ["problems", { page, size, difficulty, search, tag }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("size", String(size));
      if (difficulty) searchParams.set("difficulty", difficulty);
      if (search) searchParams.set("search", search);
      if (tag) searchParams.set("tag", tag);
      const res = await api.get<ProblemListResponse>(`/problems?${searchParams}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problems", id],
    queryFn: async () => {
      const res = await api.get<Problem>(`/problems/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProblemCreate) => {
      const res = await api.post<Problem>("/problems", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProblemUpdate }) => {
      const res = await api.put<Problem>(`/problems/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/problems/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
