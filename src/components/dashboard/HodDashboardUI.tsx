import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Book, Upload, LogOut } from "lucide-react";
import { HodStats } from "@/hooks/useHodDashboard";

interface HodDashboardUIProps {
  stats: HodStats;
  loading: boolean;
  error?: string | null;
  onLogout: () => void;
}

export function HodDashboardUI({ stats, loading, error, onLogout }: HodDashboardUIProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">HOD Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {stats.hodName || 'Head of Department'}. 
            {stats.department && stats.departmentCode && (
              <span> Managing {stats.department} ({stats.departmentCode})</span>
            )}
            {stats.university && (
              <span> at {stats.university}</span>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registeredStudents}</div>
            <p className="text-xs text-muted-foreground">
              In {stats.department}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departmental Courses
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departmentalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Across all levels
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <Button asChild>
                <Link href="/hod/uploads">
                    <Upload className="mr-2 h-4 w-4" /> Upload Results
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        {/* Placeholder for recent activity or notifications */}
      </div>
    </div>
  );
}
