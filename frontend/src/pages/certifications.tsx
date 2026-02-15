import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  useCertifications,
  useCreateCertification,
} from "@/hooks/use-certifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Award, Plus, Loader2, ExternalLink, Calendar } from "lucide-react";

const certSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  expiry_date: z.string().optional(),
  credential_url: z.string().optional(),
});

type CertFormValues = z.infer<typeof certSchema>;

export default function CertificationsPage() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: certifications, isLoading } = useCertifications();
  const createCert = useCreateCertification();

  const form = useForm<CertFormValues>({
    resolver: zodResolver(certSchema),
    defaultValues: {
      name: "",
      issuer: "",
      issue_date: "",
      expiry_date: "",
      credential_url: "",
    },
  });

  const onSubmit = async (data: CertFormValues) => {
    setError("");
    try {
      await createCert.mutateAsync({
        name: data.name,
        issuer: data.issuer,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date || undefined,
        credential_url: data.credential_url || undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      setError("Failed to create certification. Please try again.");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setError("");
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground">
            Track your professional certifications
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
              <DialogDescription>
                Record a new professional certification.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Certification Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. AWS Solutions Architect"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  placeholder="e.g. Amazon Web Services"
                  {...form.register("issuer")}
                />
                {form.formState.errors.issuer && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.issuer.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    {...form.register("issue_date")}
                  />
                  {form.formState.errors.issue_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.issue_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...form.register("expiry_date")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if no expiry
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credential_url">Credential URL</Label>
                <Input
                  id="credential_url"
                  type="url"
                  placeholder="https://..."
                  {...form.register("credential_url")}
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
                <Button type="submit" disabled={createCert.isPending}>
                  {createCert.isPending ? "Adding..." : "Add Certification"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!certifications || certifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              No certifications yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your professional certifications to showcase your expertise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => {
            const expired = isExpired(cert.expiry_date);
            return (
              <Card key={cert.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{cert.name}</CardTitle>
                    <Badge variant={expired ? "destructive" : "default"}>
                      {expired ? "Expired" : "Active"}
                    </Badge>
                  </div>
                  <CardDescription>{cert.issuer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Issued {format(new Date(cert.issue_date), "MMM yyyy")}
                    </span>
                    {cert.expiry_date && (
                      <span>
                        {" "}
                        &middot; Expires{" "}
                        {format(new Date(cert.expiry_date), "MMM yyyy")}
                      </span>
                    )}
                    {!cert.expiry_date && (
                      <span> &middot; No Expiry</span>
                    )}
                  </div>
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Credential
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
