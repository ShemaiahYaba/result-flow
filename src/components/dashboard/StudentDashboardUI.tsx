import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, LogOut } from "lucide-react";
import { StudentStats } from "@/hooks/useStudentDashboard";
import Link from "next/link";

interface StudentDashboardUIProps {
  stats: StudentStats;
  loading: boolean;
  onLogout: () => void;
  onDownloadTranscript: () => void;
}

export function StudentDashboardUI({ stats, loading, onLogout, onDownloadTranscript }: StudentDashboardUIProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {stats.student_info?.first_name}! Track your academic progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onDownloadTranscript} disabled>
            <Download className="mr-2 h-4 w-4" /> Download Transcript
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      {stats.student_info && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{stats.student_info.first_name} {stats.student_info.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matric Number</p>
                <p className="font-mono font-medium">{stats.student_info.matric_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{stats.student_info.department_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">University</p>
                <p className="font-medium">{stats.student_info.university_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Performance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CGPA</CardTitle>
            <CardDescription className="text-blue-100">Cumulative Grade Point Average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.cgpa?.toFixed(2) || '0.00'}</div>
            <p className="text-sm text-blue-100 mt-1">Out of 5.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Level</CardTitle>
            <CardDescription>Academic Level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.academic_summary?.current_level || 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Units Attempted</CardTitle>
            <CardDescription>Total Credit Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.academic_summary?.total_units_attempted || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Credit Units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Units Passed</CardTitle>
            <CardDescription>Successfully Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.academic_summary?.total_units_passed || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Credit Units</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your academic resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/student/course-registration">
                <div className="text-2xl">📚</div>
                <span>Course Registration</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/student/past-results">
                <div className="text-2xl">📊</div>
                <span>View Results</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/student/profile">
                <div className="text-2xl">👤</div>
                <span>My Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
