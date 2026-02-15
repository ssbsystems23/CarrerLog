import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import api from "@/lib/axios";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string>("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate executions (React Strict Mode runs effects twice)
    if (hasProcessed.current) {
      return;
    }

    async function handleCallback() {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication was cancelled or failed");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Mark as processed before making the request
      hasProcessed.current = true;

      try {
        // Exchange code for token
        const response = await api.post("/auth/google/callback", { code });
        const { access_token, user } = response.data;

        // Save auth state
        setAuth(access_token, user);

        // Redirect to dashboard
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Authentication error:", err);
        const errorMessage =
          (err as any)?.response?.data?.detail ||
          "Authentication failed. Please try again.";
        setError(errorMessage);
        setTimeout(() => navigate("/login"), 3000);
      }
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-500 text-lg font-semibold mb-2">
              {error}
            </div>
            <p className="text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <div>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
