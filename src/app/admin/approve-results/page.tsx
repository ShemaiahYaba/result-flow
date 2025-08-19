
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
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/UnifiedAuthProvider"

interface ResultSubmission {
  id: string;
  hod_id: string;
  hod_name: string;
  course_id: string;
  course_code: string;
  course_title: string;
  semester_id: string;
  semester_name: string;
  total_results: number;
  status: string;
  submission_notes: string | null;
  submitted_at: string;
  file_upload: {
    id: string;
    file_name: string;
    total_records: number;
    processed_records: number;
    failed_records: number;
    status: string;
  };
}

interface ApproveResultsResponse {
  submissions: ResultSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const dynamic = 'force-dynamic';

export default function ApproveResultsPage() {
    const [submissions, setSubmissions] = useState<ResultSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const { authenticatedFetch } = useAuth();

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await authenticatedFetch('/api/admin/approve-results');
            if (response.ok) {
                const data: ApproveResultsResponse = await response.json();
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (submissionId: string, action: 'approve' | 'reject', notes?: string) => {
        try {
            setActionLoading(submissionId);
            const response = await authenticatedFetch('/api/admin/approve-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    action,
                    admin_notes: notes || adminNotes
                })
            });

            if (response.ok) {
                // Refresh submissions after successful action
                await fetchSubmissions();
                setAdminNotes('');
            }
        } catch (error) {
            console.error('Failed to process submission:', error);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge variant="secondary">Pending</Badge>;
            case 'approved':
                return <Badge variant="default">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Approve Results</h1>
                    <p className="text-muted-foreground">Review and approve departmental result submissions.</p>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading submissions...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    {submissions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No pending submissions found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>HOD</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Results</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission.hod_name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{submission.course_code}</div>
                                                <div className="text-sm text-muted-foreground">{submission.course_title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{submission.semester_name}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{submission.total_results} results</div>
                                                <div className="text-muted-foreground">
                                                    {submission.file_upload.processed_records} processed, {submission.file_upload.failed_records} failed
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" title="View Details">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Button>
                                            {submission.status === 'submitted' && (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-primary hover:bg-primary/10 hover:text-primary"
                                                                disabled={actionLoading === submission.id}
                                                            >
                                                                {actionLoading === submission.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                                <span className="sr-only">Approve</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Approve Results</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will approve {submission.total_results} results for {submission.course_code} - {submission.course_title}. 
                                                                    Students will be able to view their results immediately.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
                                                                <Textarea
                                                                    id="approve-notes"
                                                                    placeholder="Add any notes about this approval..."
                                                                    value={adminNotes}
                                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                                />
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => handleApproval(submission.id, 'approve', adminNotes)}
                                                                >
                                                                    Approve Results
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                disabled={actionLoading === submission.id}
                                                            >
                                                                {actionLoading === submission.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                                <span className="sr-only">Reject</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Reject Results</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will reject the results for {submission.course_code} - {submission.course_title}. 
                                                                    The HOD will need to re-submit the results.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="reject-notes">Rejection Reason (Required)</Label>
                                                                <Textarea
                                                                    id="reject-notes"
                                                                    placeholder="Please provide a reason for rejection..."
                                                                    value={adminNotes}
                                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                    onClick={() => handleApproval(submission.id, 'reject', adminNotes)}
                                                                    disabled={!adminNotes.trim()}
                                                                >
                                                                    Reject Results
                                                                </AlertDialogAction>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
