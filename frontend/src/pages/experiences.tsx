import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useExperiences, useCreateExperience } from "@/hooks/use-experiences";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Briefcase, Plus, Loader2, Building2, Calendar } from "lucide-react";

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  description: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperiencesPage() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: experiences, isLoading } = useExperiences();
  const createExperience = useCreateExperience();

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      role: "",
      start_date: "",
      end_date: "",
      description: "",
    },
  });

  const onSubmit = async (data: ExperienceFormValues) => {
    setError("");
    try {
      await createExperience.mutateAsync({
        company: data.company,
        role: data.role,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        description: data.description || undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      setError("Failed to create experience. Please try again.");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setError("");
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const sortedExperiences = experiences
    ? [...experiences].sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
    : [];

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Experiences</h1>
          <p className="text-muted-foreground">
            Your professional experience timeline
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Experience</DialogTitle>
              <DialogDescription>
                Add a new work experience to your timeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
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
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Senior Analyst"
                  {...form.register("role")}
                />
                {form.formState.errors.role && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...form.register("start_date")}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.start_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...form.register("end_date")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if current role
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your responsibilities and achievements..."
                  rows={4}
                  {...form.register("description")}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createExperience.isPending}>
                  {createExperience.isPending ? "Adding..." : "Add Experience"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedExperiences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No experiences yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start building your professional timeline by adding your work
              experiences.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {sortedExperiences.map((exp) => (
              <div key={exp.id} className="relative flex gap-6 pl-4">
                {/* Timeline dot */}
                <div className="relative z-10 mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>

                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{exp.role}</CardTitle>
                        <p className="text-sm font-medium text-primary">
                          {exp.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDisplayDate(exp.start_date)} -{" "}
                          {exp.end_date
                            ? formatDisplayDate(exp.end_date)
                            : "Present"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {exp.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {exp.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
