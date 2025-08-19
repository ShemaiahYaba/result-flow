
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
import { useGradingPolicy } from "@/hooks/useGradingPolicy";

export default function GradingPolicyPage() {
    const { policies, loading, error, createPolicy, updatePolicy, deletePolicy } = useGradingPolicy();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newGrade, setNewGrade] = useState({policy_name: "", grade: "", min_score: 0, max_score: 0, grade_point: 0, description: "" });
    const [editingPolicy, setEditingPolicy] = useState<string | null>(null);

    const handleAddGrade = async () => {
        if (newGrade.policy_name && newGrade.grade && newGrade.min_score >= 0 && newGrade.max_score > newGrade.min_score && newGrade.grade_point >= 0) {
            try {
                await createPolicy(newGrade);
                setIsDialogOpen(false);
                setNewGrade({policy_name: "", grade: "", min_score: 0, max_score: 0, grade_point: 0, description: "" });
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleDeleteGrade = async (id: string) => {
        if (confirm('Are you sure you want to delete this grading policy?')) {
            try {
                await deletePolicy(id);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };


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
                                <Label htmlFor="policy-name" className="text-right">Policy Name</Label>
                                <Input id="policy-name" placeholder="e.g., Distinction" className="col-span-3" value={newGrade.policy_name} onChange={e => setNewGrade({...newGrade, policy_name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="grade" className="text-right">Grade</Label>
                                <Input id="grade" placeholder="e.g., A" className="col-span-3" value={newGrade.grade} onChange={e => setNewGrade({...newGrade, grade: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="grade-point" className="text-right">Grade Point</Label>
                                <Input id="grade-point" type="number" step="0.01" placeholder="e.g., 5.00" className="col-span-3" value={newGrade.grade_point} onChange={e => setNewGrade({...newGrade, grade_point: parseFloat(e.target.value)})} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="min-score" className="text-right">Min Score</Label>
                                <Input id="min-score" type="number" placeholder="e.g., 70" className="col-span-3" value={newGrade.min_score} onChange={e => setNewGrade({...newGrade, min_score: parseInt(e.target.value)})} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="max-score" className="text-right">Max Score</Label>
                                <Input id="max-score" type="number" placeholder="e.g., 100" className="col-span-3" value={newGrade.max_score} onChange={e => setNewGrade({...newGrade, max_score: parseInt(e.target.value)})} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Input id="description" placeholder="e.g., Excellent Performance" className="col-span-3" value={newGrade.description} onChange={e => setNewGrade({...newGrade, description: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={handleAddGrade}>Save Grade</Button>
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
                                <TableHead>Policy Name</TableHead>
                                <TableHead className="w-[100px]">Grade</TableHead>
                                <TableHead>Grade Point</TableHead>
                                <TableHead>Min Score</TableHead>
                                <TableHead>Max Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading grading policies...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-destructive">Error: {error}</TableCell>
                                </TableRow>
                            ) : policies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No grading policies found</TableCell>
                                </TableRow>
                            ) : (
                                policies.map((policy) => (
                                    <TableRow key={policy.id}>
                                        <TableCell className="font-medium">{policy.policy_name}</TableCell>
                                        <TableCell>{policy.grade}</TableCell>
                                        <TableCell>{policy.grade_point}</TableCell>
                                        <TableCell>{policy.min_score}</TableCell>
                                        <TableCell>{policy.max_score}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteGrade(policy.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
