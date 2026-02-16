import { useAuthStore } from "@/store/auth-store";
import { useMe } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Calendar, Mail, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Helper function to generate user initials
function getUserInitials(fullName: string): string {
  if (!fullName) return "U";
  const words = fullName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: freshUser, isLoading, isError } = useMe();

  // Use fresh data if available, otherwise fall back to store data
  const displayUser = freshUser || user;

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !displayUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive">Failed to load profile information</p>
          <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const initials = getUserInitials(displayUser.full_name);
  const memberSince = displayUser.created_at
    ? format(new Date(displayUser.created_at), "MMMM d, yyyy")
    : "N/A";
  const memberSinceRelative = displayUser.created_at
    ? formatDistanceToNow(new Date(displayUser.created_at), { addSuffix: true })
    : "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>Your account summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarFallback className="text-lg md:text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl md:text-2xl font-bold">{displayUser.full_name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{displayUser.email}</span>
                </div>
                <Badge variant={displayUser.is_active ? "default" : "destructive"} className="w-fit">
                  {displayUser.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Full Name</span>
              </div>
              <div className="sm:col-span-2 text-sm">{displayUser.full_name}</div>
            </div>

            <Separator />

            {/* Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Email Address</span>
              </div>
              <div className="sm:col-span-2 text-sm truncate">{displayUser.email}</div>
            </div>

            <Separator />

            {/* Account Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {displayUser.is_active ? (
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Account Status</span>
              </div>
              <div className="sm:col-span-2">
                <Badge variant={displayUser.is_active ? "default" : "destructive"}>
                  {displayUser.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Member Since */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member Since</span>
              </div>
              <div className="sm:col-span-2 text-sm">
                {memberSince}
                {memberSinceRelative && (
                  <span className="text-muted-foreground ml-1">({memberSinceRelative})</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings & Preferences Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Settings & Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Additional settings and preferences coming soon!</p>
            <p className="text-xs mt-2">This section will include theme preferences, notification settings, and more.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
