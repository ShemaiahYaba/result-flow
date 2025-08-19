"use client";

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, BookOpen, Trophy } from "lucide-react";
import { useStudentResults } from "@/hooks/useStudentResults";

export const dynamic = 'force-dynamic';

export default function PastResultsPage() {
  const { data, loading, error, fetchResults, getAvailableSessions, getAvailableLevels } = useStudentResults();
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleFilterChange = () => {
    const filters: any = {};
    if (selectedSession) filters.session_id = selectedSession;
    if (selectedLevel) filters.level = parseInt(selectedLevel);
    
    fetchResults(filters);
  };

  const clearFilters = () => {
    setSelectedSession('');
    setSelectedLevel('');
    fetchResults();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => fetchResults()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results data found.</p>
      </div>
    );
  }

  const availableSessions = getAvailableSessions();
  const availableLevels = getAvailableLevels();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Past Results</h1>
        <p className="text-muted-foreground">
          View your academic history and results from previous semesters.
        </p>
      </div>

      {/* Student Info & Academic Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.student_info.matric_number}</div>
            <p className="text-xs text-muted-foreground">{data.student_info.full_name}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.academic_summary.cumulative_gpa?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Cumulative GPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.academic_summary.total_units_attempted}</div>
            <p className="text-xs text-muted-foreground">
              {data.academic_summary.total_units_passed} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semesters</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.academic_summary.total_semesters}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Academic Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  {availableSessions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map(level => (
                    <SelectItem key={level} value={level.toString()}>{level} Level</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleFilterChange} variant="default">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Accordion type="single" collapsible className="w-full">
        {data.semester_results.map((semester) => (
          <AccordionItem value={semester.semester_id} key={semester.semester_id}>
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-4">
                <span>{semester.session_name} - {semester.semester_name}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">Level {semester.level}</Badge>
                  <Badge variant="outline">
                    GPA: {semester.semester_gpa?.toFixed(2) || 'N/A'}
                  </Badge>
                  <Badge variant="secondary">
                    {semester.total_units_attempted} units
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {semester.courses.length > 0 ? (
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
                    {semester.courses.map((course) => (
                      <TableRow key={course.result_id}>
                        <TableCell className="font-mono">{course.course_code}</TableCell>
                        <TableCell>{course.course_title}</TableCell>
                        <TableCell>{course.course_unit}</TableCell>
                        <TableCell>{course.score}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {course.grade}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No course results available for this semester.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {data.semester_results.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground">
            No academic results match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
