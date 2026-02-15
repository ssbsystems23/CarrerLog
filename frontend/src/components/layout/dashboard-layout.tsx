import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuthStore } from "@/store/auth-store";

export function DashboardLayout() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
