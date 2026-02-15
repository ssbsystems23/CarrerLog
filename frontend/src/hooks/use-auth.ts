import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";

/**
 * Hook to fetch current user information
 * Automatically runs when user is authenticated
 */
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}
