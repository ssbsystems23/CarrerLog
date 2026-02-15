import { useState, useEffect } from "react";
import { useProblems, useUpdateProblem, useDeleteProblem } from "@/hooks/use-problems";
import type { Problem, ProblemUpdate } from "@/types";
import { ProblemCard } from "@/components/problem-card";
import { RichTextEditor } from "@/components/rich-text-editor";
import { RichTextDisplay } from "@/components/rich-text-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

export default function ProblemsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState<ProblemUpdate>({});

  // Debounce search input so the API call only fires after 400ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useProblems({
    page,
    size: 10,
    difficulty: difficulty || undefined,
    search: debouncedSearch || undefined,
  });
  const updateProblem = useUpdateProblem();
  const deleteProblem = useDeleteProblem();

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleDifficultyFilter = (value: string) => {
    setDifficulty(value === "all" ? "" : value);
    setPage(1);
  };

  const openDetail = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const startEditing = () => {
    if (!selectedProblem) return;
    setEditData({
      title: selectedProblem.title,
      company_context: selectedProblem.company_context || "",
      difficulty: selectedProblem.difficulty,
      situation: selectedProblem.situation,
      task: selectedProblem.task,
      action: selectedProblem.action,
      result: selectedProblem.result,
      tags: selectedProblem.tags,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedProblem) return;
    try {
      const updated = await updateProblem.mutateAsync({
        id: selectedProblem.id,
        data: editData,
      });
      setSelectedProblem(updated);
      setIsEditing(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedProblem) return;
    try {
      await deleteProblem.mutateAsync(selectedProblem.id);
      setSelectedProblem(null);
      setShowDeleteConfirm(false);
    } catch {
      // error handled by mutation
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.size) : 0;

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">
            Browse and manage your problem-solving journal
          </p>
        </div>
        {isFetching && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={difficulty || "all"}
          onValueChange={handleDifficultyFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Problem List */}
      {!data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <List className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No problems found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchInput || difficulty
                ? "Try adjusting your filters."
                : "Start logging problems to build your knowledge base."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.items.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onClick={() => openDetail(problem)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Problem Detail Dialog */}
      <Dialog
        open={!!selectedProblem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProblem(null);
            setIsEditing(false);
            setShowDeleteConfirm(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProblem && !isEditing && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="text-xl">
                    {selectedProblem.title}
                  </DialogTitle>
                  <Badge
                    className={difficultyColor[selectedProblem.difficulty]}
                    variant="secondary"
                  >
                    {selectedProblem.difficulty}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedProblem.company_context && (
                    <span>{selectedProblem.company_context} &middot; </span>
                  )}
                  Solved {format(new Date(selectedProblem.solved_at), "MMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Situation</h4>
                  <RichTextDisplay content={selectedProblem.situation} />
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Task</h4>
                  <RichTextDisplay content={selectedProblem.task} />
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Action</h4>
                  <RichTextDisplay content={selectedProblem.action} />
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Result</h4>
                  <RichTextDisplay content={selectedProblem.result} />
                </div>

                {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-1">
                      {selectedProblem.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {showDeleteConfirm ? (
                <DialogFooter className="flex gap-2">
                  <p className="text-sm text-destructive mr-auto">
                    Are you sure? This cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteProblem.isPending}
                  >
                    {deleteProblem.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              ) : (
                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" onClick={startEditing}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </DialogFooter>
              )}
            </>
          )}

          {selectedProblem && isEditing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Problem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editData.title || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Situation</Label>
                  <RichTextEditor
                    content={editData.situation || ""}
                    onChange={(html) =>
                      setEditData({ ...editData, situation: html })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task</Label>
                  <RichTextEditor
                    content={editData.task || ""}
                    onChange={(html) =>
                      setEditData({ ...editData, task: html })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <RichTextEditor
                    content={editData.action || ""}
                    onChange={(html) =>
                      setEditData({ ...editData, action: html })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Result</Label>
                  <RichTextEditor
                    content={editData.result || ""}
                    onChange={(html) =>
                      setEditData({ ...editData, result: html })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProblem.isPending}
                >
                  {updateProblem.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
