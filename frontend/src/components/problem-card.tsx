import type { Problem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stripHtml } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

interface ProblemCardProps {
  problem: Problem;
  onClick?: () => void;
}

export function ProblemCard({ problem, onClick }: ProblemCardProps) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" : ""}
      onClick={onClick}
    >
      <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm md:text-base line-clamp-2">{problem.title}</CardTitle>
          <Badge className={difficultyColor[problem.difficulty]} variant="secondary">
            {problem.difficulty}
          </Badge>
        </div>
        {problem.company_context && (
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{problem.company_context}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
          {stripHtml(problem.situation)}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {problem.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {problem.tags && problem.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{problem.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">{format(new Date(problem.solved_at), "MMM d, yyyy")}</span>
            <span className="sm:hidden">{format(new Date(problem.solved_at), "MMM d")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
