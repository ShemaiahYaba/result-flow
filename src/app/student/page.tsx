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
import { Download } from "lucide-react";

const currentResults = [
    { code: 'CSC 411', title: 'Compiler Construction', units: 3, grade: 'A', score: 85 },
    { code: 'CSC 421', title: 'Artificial Intelligence', units: 3, grade: 'A', score: 92 },
    { code: 'CSC 431', title: 'Computer Networks', units: 3, grade: 'B', score: 68 },
    { code: 'CSC 499', title: 'Project', units: 6, grade: 'A', score: 78 },
];

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome, John Doe (F/HD/21/1234567)</p>
            </div>
             <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download Transcript
            </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Current Semester Results</CardTitle>
                        <CardDescription>2023/2024 - 1st Semester</CardDescription>
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
                                {currentResults.map((result) => (
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
                        <p className="text-6xl font-bold">4.75</p>
                        <p className="text-sm opacity-80">Out of 5.00</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Semester GPA (GPA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-primary">4.88</p>
                        <p className="text-xs text-muted-foreground">2023/2024 - 1st Semester</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
