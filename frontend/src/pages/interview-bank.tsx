import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useInterviewQuestions,
  useCreateInterviewQuestion,
  useDeleteInterviewQuestion,
} from "@/hooks/use-interview-questions";
import { RichTextEditor } from "@/components/rich-text-editor";
import { RichTextDisplay } from "@/components/rich-text-display";
import { htmlNotEmpty } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Loader2,
  Plus,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import type { InterviewQuestion } from "@/types";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().refine(htmlNotEmpty, "Answer is required"),
  company: z.string().min(1, "Company is required"),
  asked_date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

function QuestionCard({
  item,
  onDelete,
}: {
  item: InterviewQuestion;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="truncate">{item.question}</span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {item.company}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.asked_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-1">Answer</h4>
            <RichTextDisplay content={item.answer} />
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function InterviewBankPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useInterviewQuestions({
    company: companyFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const createMutation = useCreateInterviewQuestion();
  const deleteMutation = useDeleteInterviewQuestion();

  // Build list of unique companies for the filter dropdown
  const { data: allData } = useInterviewQuestions();
  const companies = useMemo(() => {
    if (!allData) return [];
    const set = new Set(allData.map((q) => q.company));
    return Array.from(set).sort();
  }, [allData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: "", answer: "", company: "", asked_date: "" },
  });

  const onSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync(values);
    form.reset();
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Interview Bank</h1>
          <p className="text-muted-foreground">
            Log and review interview questions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Interview Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="What was the interview question?"
                  rows={3}
                  {...form.register("question")}
                />
                {form.formState.errors.question && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.question.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Controller
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Your answer or ideal response"
                    />
                  )}
                />
                {form.formState.errors.answer && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.answer.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google"
                    {...form.register("company")}
                  />
                  {form.formState.errors.company && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.company.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asked_date">Date Asked</Label>
                  <Input
                    id="asked_date"
                    type="date"
                    {...form.register("asked_date")}
                  />
                  {form.formState.errors.asked_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.asked_date.message}
                    </p>
                  )}
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
                  {createMutation.isPending ? "Saving..." : "Save Question"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={companyFilter || "all"}
          onValueChange={(v) => setCompanyFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
        {(companyFilter || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCompanyFilter("");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Question List */}
      {!data || data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              {companyFilter || dateFrom || dateTo
                ? "No matching questions"
                : "No interview questions yet"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {companyFilter || dateFrom || dateTo
                ? "Try adjusting your filters."
                : "Click \"Add Question\" to start building your interview bank."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {data.length} question{data.length !== 1 ? "s" : ""}. Click to
            expand.
          </p>
          {data.map((item) => (
            <QuestionCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
