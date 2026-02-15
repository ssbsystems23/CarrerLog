import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProblem } from "@/hooks/use-problems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { htmlNotEmpty } from "@/lib/validation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Star } from "lucide-react";

const newProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company_context: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    errorMap: () => ({ message: "Difficulty is required" }),
  }),
  solved_at: z.string().optional(),
  situation: z.string().refine(htmlNotEmpty, "Situation is required"),
  task: z.string().refine(htmlNotEmpty, "Task is required"),
  action: z.string().refine(htmlNotEmpty, "Action is required"),
  result: z.string().refine(htmlNotEmpty, "Result is required"),
  tags_input: z.string().optional(),
});

type NewProblemFormValues = z.infer<typeof newProblemSchema>;

export default function NewProblemPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const createProblem = useCreateProblem();

  const form = useForm<NewProblemFormValues>({
    resolver: zodResolver(newProblemSchema),
    defaultValues: {
      title: "",
      company_context: "",
      difficulty: undefined,
      solved_at: "",
      situation: "",
      task: "",
      action: "",
      result: "",
      tags_input: "",
    },
  });

  const onSubmit = async (data: NewProblemFormValues) => {
    setError("");
    setSuccess(false);
    try {
      const tags = data.tags_input
        ? data.tags_input
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;

      await createProblem.mutateAsync({
        title: data.title,
        company_context: data.company_context || undefined,
        difficulty: data.difficulty,
        solved_at: data.solved_at || undefined,
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result,
        tags,
      });

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        navigate("/problems");
      }, 1500);
    } catch {
      setError("Failed to create problem. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log New Problem</h1>
        <p className="text-muted-foreground">
          Document a problem you solved using the STAR method
        </p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          Problem created successfully! Redirecting to problems list...
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Problem Details
            </CardTitle>
            <CardDescription>
              Basic information about the problem you solved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Reduced client onboarding time by 40%"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_context">Company / Context</Label>
                <Input
                  id="company_context"
                  placeholder="e.g. Acme Corp"
                  {...form.register("company_context")}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty *</Label>
                <Controller
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.difficulty && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.difficulty.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solved_at">Date Solved</Label>
                <Input
                  id="solved_at"
                  type="date"
                  {...form.register("solved_at")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags_input">Tags</Label>
              <Input
                id="tags_input"
                placeholder="e.g. process-improvement, leadership, interview (comma-separated)"
                {...form.register("tags_input")}
              />
              <p className="text-xs text-muted-foreground">
                Enter comma-separated tags to categorize this problem
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* STAR Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              STAR Method
            </CardTitle>
            <CardDescription>
              Break down your problem-solving approach using the Situation, Task,
              Action, Result framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Situation *</Label>
              <p className="text-xs text-muted-foreground">
                Describe the context and background. What was the environment?
                What were the constraints?
              </p>
              <Controller
                control={form.control}
                name="situation"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the situation you were facing..."
                  />
                )}
              />
              {form.formState.errors.situation && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.situation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Task *</Label>
              <p className="text-xs text-muted-foreground">
                What was your specific responsibility? What did you need to
                accomplish?
              </p>
              <Controller
                control={form.control}
                name="task"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe what you needed to achieve..."
                  />
                )}
              />
              {form.formState.errors.task && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.task.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Action *</Label>
              <p className="text-xs text-muted-foreground">
                What steps did you take? What tools, methods, or
                approaches did you use?
              </p>
              <Controller
                control={form.control}
                name="action"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the actions you took to solve the problem..."
                  />
                )}
              />
              {form.formState.errors.action && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.action.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Result *</Label>
              <p className="text-xs text-muted-foreground">
                What was the outcome? Include metrics if possible (e.g., 50%
                performance improvement).
              </p>
              <Controller
                control={form.control}
                name="result"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the results and impact of your solution..."
                  />
                )}
              />
              {form.formState.errors.result && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.result.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/problems")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createProblem.isPending}>
            {createProblem.isPending ? "Creating..." : "Create Problem"}
          </Button>
        </div>
      </form>
    </div>
  );
}
