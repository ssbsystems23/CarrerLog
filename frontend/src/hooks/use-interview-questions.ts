import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { InterviewQuestion, InterviewQuestionCreate } from "@/types";

export function useInterviewQuestions(params: {
  company?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const { company, dateFrom, dateTo } = params;

  return useQuery({
    queryKey: ["interview-questions", { company, dateFrom, dateTo }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (company) searchParams.set("company", company);
      if (dateFrom) searchParams.set("date_from", dateFrom);
      if (dateTo) searchParams.set("date_to", dateTo);
      const qs = searchParams.toString();
      const res = await api.get<InterviewQuestion[]>(
        `/interview-questions${qs ? `?${qs}` : ""}`
      );
      return res.data;
    },
  });
}

export function useCreateInterviewQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InterviewQuestionCreate) => {
      const res = await api.post<InterviewQuestion>("/interview-questions", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-questions"] });
    },
  });
}

export function useDeleteInterviewQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/interview-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-questions"] });
    },
  });
}
