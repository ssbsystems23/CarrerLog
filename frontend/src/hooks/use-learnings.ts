import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Learning, LearningCreate, LearningListResponse } from "@/types";

export function useLearnings(params: {
  page?: number;
  size?: number;
  search?: string;
  tag?: string;
} = {}) {
  const { page = 1, size = 10, search, tag } = params;

  return useQuery({
    queryKey: ["learnings", { page, size, search, tag }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("size", String(size));
      if (search) searchParams.set("search", search);
      if (tag) searchParams.set("tag", tag);
      const res = await api.get<LearningListResponse>(`/learnings?${searchParams}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LearningCreate) => {
      const res = await api.post<Learning>("/learnings", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learnings"] });
    },
  });
}

export function useDeleteLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/learnings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learnings"] });
    },
  });
}
