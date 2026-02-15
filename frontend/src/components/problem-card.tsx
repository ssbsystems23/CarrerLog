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
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{problem.title}</CardTitle>
          <Badge className={difficultyColor[problem.difficulty]} variant="secondary">
            {problem.difficulty}
          </Badge>
        </div>
        {problem.company_context && (
          <p className="text-sm text-muted-foreground">{problem.company_context}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {stripHtml(problem.situation)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {problem.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(problem.solved_at), "MMM d, yyyy")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
