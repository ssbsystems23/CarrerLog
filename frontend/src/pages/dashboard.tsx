import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatCard } from "@/components/stat-card";
import { ProblemCard } from "@/components/problem-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { List, Award, Briefcase, Loader2 } from "lucide-react";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your professional journey
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Problems"
          value={stats.total_problems}
          icon={List}
          description="Problems logged with STAR method"
        />
        <StatCard
          title="Certifications"
          value={stats.total_certifications}
          icon={Award}
          description="Professional certifications earned"
        />
        <StatCard
          title="Experiences"
          value={stats.total_experiences}
          icon={Briefcase}
          description="Work experiences tracked"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.problems_by_difficulty).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No problems logged yet. Start adding problems to see your
                difficulty breakdown.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.problems_by_difficulty).map(
                  ([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center gap-2">
                      <Badge
                        className={difficultyColor[difficulty] ?? ""}
                        variant="secondary"
                      >
                        {difficulty}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Problems</h2>
        {stats.recent_problems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No problems logged yet. Head to the Problems page to start
                tracking your problem-solving journey.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.recent_problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
