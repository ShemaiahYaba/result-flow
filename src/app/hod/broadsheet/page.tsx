"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Loader2 } from "lucide-react";
import { useHodBroadsheet } from "@/hooks/useHodBroadsheet";
import { useHodSemesters } from "@/hooks/useHodSemesters";

export const dynamic = 'force-dynamic';

export default function BroadsheetPage() {
    const { data, loading, error, fetchBroadsheet } = useHodBroadsheet();
    const { data: semesters, loading: semestersLoading, error: semestersError, fetchSemesters } = useHodSemesters();
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");

    const levels = [
        { value: 'all', label: 'All Levels' },
        { value: '100', label: '100 Level' },
        { value: '200', label: '200 Level' },
        { value: '300', label: '300 Level' },
        { value: '400', label: '400 Level' }
    ];

    useEffect(() => {
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (selectedSemester) {
            fetchBroadsheet(selectedSemester, selectedLevel === 'all' ? undefined : selectedLevel);
        }
    }, [selectedSemester, selectedLevel]);

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download
        alert('PDF download functionality to be implemented');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Results Broadsheet</h1>
                    <p className="text-muted-foreground">View a summary of all student results in the department.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map((semester) => (
                                <SelectItem key={semester.semester_id} value={semester.semester_id}>
                                    {semester.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleDownloadPDF} disabled={!data}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {(error || semestersError) && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error: {error || semestersError}</p>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Loading broadsheet data...</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {data && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {data.department_info.department_name} - {selectedLevel === 'all' ? 'All Levels' : `${selectedLevel} Level`}
                        </CardTitle>
                        <CardDescription>
                            {data.semester_info.semester_name} | {data.summary.total_students} students | 
                            Average GPA: {data.summary.average_gpa?.toFixed(2) || 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Matric No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="text-center">Level</TableHead>
                                    {data.courses.map((course) => (
                                        <TableHead key={course.course_id} className="text-center">
                                            {course.course_code}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">GPA</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.students.map((student) => (
                                    <TableRow key={student.student_id}>
                                        <TableCell className="font-mono">{student.matric_number}</TableCell>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell className="text-center">{student.level}</TableCell>
                                        {data.courses.map((course) => (
                                            <TableCell key={course.course_id} className="text-center">
                                                {student.course_scores[course.course_code] ?? '-'}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-semibold">
                                            {student.gpa?.toFixed(2) || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        
                        {data.students.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No students found for the selected criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
