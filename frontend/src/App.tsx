import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import "@/store/theme-store"; // applies saved theme class on load

const LandingPage = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/pages/login"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const ExperiencesPage = lazy(() => import("@/pages/experiences"));
const NewProblemPage = lazy(() => import("@/pages/new-problem"));
const ProblemsPage = lazy(() => import("@/pages/problems"));
const CertificationsPage = lazy(() => import("@/pages/certifications"));
const LearningsPage = lazy(() => import("@/pages/learnings"));
const InterviewBankPage = lazy(() => import("@/pages/interview-bank"));

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/problems/new" element={<NewProblemPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/learnings" element={<LearningsPage />} />
            <Route path="/interview-bank" element={<InterviewBankPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
