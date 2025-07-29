
"use client";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

const initialResults = [
    { id: 1, department: 'Computer Science', course: 'CSC 411 - Compiler Construction', submittedOn: '2023-11-20', status: 'Pending' },
    { id: 2, department: 'Mechanical Engineering', course: 'MEE 501 - Advanced Thermodynamics', submittedOn: '2023-11-19', status: 'Pending' },
    { id: 3, department: 'Biochemistry', course: 'BCH 305 - Enzymology', submittedOn: '2023-11-18', status: 'Pending' },
    { id: 4, department: 'Computer Science', course: 'CSC 421 - Artificial Intelligence', submittedOn: '2023-11-15', status: 'Approved' },
];

type Result = typeof initialResults[0];

export default function ApproveResultsPage() {
    const [results, setResults] = useState<Result[]>(initialResults);

    const handleApproval = (id: number, newStatus: 'Approved' | 'Rejected') => {
        setResults(results.map(result => 
            result.id === id ? { ...result, status: newStatus } : result
        ));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Approve Results</h1>
                <p className="text-muted-foreground">Review and approve departmental result submissions.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Result Submissions</CardTitle>
                    <CardDescription>Approve results to make them available to students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result) => (
                                <TableRow key={result.id}>
                                    <TableCell className="font-medium">{result.department}</TableCell>
                                    <TableCell>{result.course}</TableCell>
                                    <TableCell>{result.submittedOn}</TableCell>
                                    <TableCell>
                                        <Badge variant={result.status === 'Pending' ? 'secondary' : result.status === 'Approved' ? 'default' : 'destructive'}>{result.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                        </Button>
                                        {result.status === 'Pending' && (
                                            <>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-primary">
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to approve?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will publish the results for {result.course}. This cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleApproval(result.id, 'Approved')}>Approve</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reject</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to reject?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will reject the results for {result.course}. You will need to notify the HOD to re-submit.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleApproval(result.id, 'Rejected')}>Reject</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
