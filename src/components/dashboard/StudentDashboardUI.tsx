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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome! Here's an overview of your academic progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onDownloadTranscript}>
            <Download className="mr-2 h-4 w-4" /> Download Transcript
          </Button>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Current Semester Results</CardTitle>
              <CardDescription>{stats.semester}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.currentResults.map((result) => (
                    <TableRow key={result.code}>
                      <TableCell className="font-mono">{result.code}</TableCell>
                      <TableCell className="font-medium">{result.title}</TableCell>
                      <TableCell>{result.units}</TableCell>
                      <TableCell>{result.score}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{result.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-headline">Cumulative GPA (CGPA)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold">{stats.cgpa}</p>
              <p className="text-sm opacity-80">Out of 5.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Semester GPA (GPA)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">{stats.gpa}</p>
              <p className="text-xs text-muted-foreground">{stats.semester}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
