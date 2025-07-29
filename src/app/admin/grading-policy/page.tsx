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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const initialGrades = [
    { grade: 'A', minScore: 70, maxScore: 100 },
    { grade: 'B', minScore: 60, maxScore: 69 },
    { grade: 'C', minScore: 50, maxScore: 59 },
    { grade: 'D', minScore: 45, maxScore: 49 },
    { grade: 'F', minScore: 0, maxScore: 44 },
];

export default function GradingPolicyPage() {
    const [grades, setGrades] = useState(initialGrades);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Grading Policy</h1>
                    <p className="text-muted-foreground">Define and manage the university's grading structure.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Grade
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline">Add New Grade</DialogTitle>
                        <DialogDescription>
                            Define a new grade and its corresponding score range.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="grade" className="text-right">Grade</Label>
                                <Input id="grade" placeholder="e.g., A+" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="min-score" className="text-right">Min Score</Label>
                                <Input id="min-score" type="number" placeholder="e.g., 70" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="max-score" className="text-right">Max Score</Label>
                                <Input id="max-score" type="number" placeholder="e.g., 100" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={() => setIsDialogOpen(false)}>Save Grade</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Current Grading Policy</CardTitle>
                    <CardDescription>This policy will be applied to all results processed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Grade</TableHead>
                                <TableHead>Minimum Score</TableHead>
                                <TableHead>Maximum Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades.map((g) => (
                                <TableRow key={g.grade}>
                                    <TableCell className="font-medium">{g.grade}</TableCell>
                                    <TableCell>{g.minScore}</TableCell>
                                    <TableCell>{g.maxScore}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
