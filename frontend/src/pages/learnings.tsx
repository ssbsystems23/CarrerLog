import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useLearnings,
  useCreateLearning,
  useDeleteLearning,
} from "@/hooks/use-learnings";
import { RichTextEditor } from "@/components/rich-text-editor";
import { RichTextDisplay } from "@/components/rich-text-display";
import { htmlNotEmpty } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  BookOpen,
  Loader2,
  Plus,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  topic: z.string().refine(htmlNotEmpty, "Topic is required"),
  learned_date: z.string().min(1, "Date is required"),
  tags_input: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LearningsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useLearnings({
    page,
    size: 10,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateLearning();
  const deleteMutation = useDeleteLearning();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "", learned_date: "", tags_input: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags_input
      ? values.tags_input
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : undefined;

    await createMutation.mutateAsync({
      topic: values.topic,
      learned_date: values.learned_date,
      tags,
    });
    form.reset();
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learnings</h1>
          <p className="text-muted-foreground">
            Capture and search things you've learned
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Learning
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Learning</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Topic *</Label>
                  <Controller
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="What did you learn?"
                      />
                    )}
                  />
                  {form.formState.errors.topic && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.topic.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="learned_date">Date *</Label>
                    <Input
                      id="learned_date"
                      type="date"
                      {...form.register("learned_date")}
                    />
                    {form.formState.errors.learned_date && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.learned_date.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags_input">Tags</Label>
                    <Input
                      id="tags_input"
                      placeholder="e.g. react, typescript (comma-separated)"
                      {...form.register("tags_input")}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save Learning"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search learnings..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Learning List */}
      {!data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchInput ? "No matching learnings" : "No learnings yet"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchInput
                ? "Try adjusting your search."
                : "Click \"Add Learning\" to start capturing what you learn."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.learned_date), "MMM d, yyyy")}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive -mt-1"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <RichTextDisplay content={item.topic} />
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
    </div>
  );
}
