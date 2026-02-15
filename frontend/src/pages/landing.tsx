import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Briefcase,
  Award,
  ArrowRight,
  Star,
  Lightbulb,
  Search,
} from "lucide-react";

export default function LandingPage() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CarrerLog</span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Your professional growth,
          <br />
          <span className="text-muted-foreground">all in one place.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          CarrerLog helps you document problems you've solved, prepare for
          interviews, track certifications, and build a searchable record of
          everything you learn throughout your career.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-4">
          Everything you need to grow
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Six focused tools that work together to keep your career on track.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Star className="h-5 w-5" />}
            title="Problem Log"
            description="Document every problem you solve using the STAR method. Rich text, images, tags, and full-text search."
          />
          <FeatureCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Interview Bank"
            description="Record real interview questions and your best answers. Filter by company and date to review before your next round."
          />
          <FeatureCard
            icon={<Lightbulb className="h-5 w-5" />}
            title="Learnings"
            description="Capture insights as they happen. Tag them, search them later. A personal knowledge base that grows with you."
          />
          <FeatureCard
            icon={<Briefcase className="h-5 w-5" />}
            title="Experience Timeline"
            description="Keep a clean record of your roles, companies, and dates. Always ready when you update your resume."
          />
          <FeatureCard
            icon={<Award className="h-5 w-5" />}
            title="Certifications"
            description="Track active and expired certifications with issue dates, expiry reminders, and credential links."
          />
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Search Everything"
            description="Full-text search across problems, learnings, and interview questions. Find anything in seconds."
          />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          Simple by design
        </h2>

        <div className="grid gap-12 md:grid-cols-3 text-center">
          <div>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted text-foreground font-bold text-sm mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Create an account</h3>
            <p className="text-sm text-muted-foreground">
              Sign up in seconds. Your data stays private and belongs to you.
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted text-foreground font-bold text-sm mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Log as you go</h3>
            <p className="text-sm text-muted-foreground">
              Solved a problem? Learned something new? Had an interview? Log it
              in 30 seconds with rich text and images.
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted text-foreground font-bold text-sm mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Search and review</h3>
            <p className="text-sm text-muted-foreground">
              Before an interview or performance review, search your history and
              come prepared with concrete examples.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-3">
            Start building your professional journal
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Free to use. No credit card required. Takes less than a minute to
            get started.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>CarrerLog</span>
          </div>
          <span>Built for problem solvers, everywhere.</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-6">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-muted mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
