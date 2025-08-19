
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/useDepartments";
import { useAuth } from "@/providers/UnifiedAuthProvider";
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

export const dynamic = 'force-dynamic';

export default function DepartmentsPage() {
    const { departments, loading, error, fetchDepartments } = useDepartments();
    const { authenticatedFetch } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptHod, setNewDeptHod] = useState("");
    const [newDeptCode, setNewDeptCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddDepartment = async () => {
        if (!newDeptName.trim() || !newDeptCode.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authenticatedFetch('/api/admin/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    department_name: newDeptName.trim(),
                    department_code: newDeptCode.trim().toUpperCase()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create department');
            }

            // Success - refresh departments list and close dialog
            await fetchDepartments();
            setIsDialogOpen(false);
            setNewDeptName("");
            setNewDeptHod("");
            setNewDeptCode("");
        } catch (error: any) {
            alert(`Error creating department: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Departments</h1>
                    <p className="text-muted-foreground">Manage university departments and assign HODs.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline">Add New Department</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new department.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" placeholder="e.g., Computer Science" className="col-span-3" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">       
                                <Label htmlFor="department_code" className="text-right">Department Code</Label>
                                <Input id="department_code" placeholder="e.g., CS" className="col-span-3" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={handleAddDepartment} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Save Department'}
                        </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Department List</CardTitle>
                    <CardDescription>A list of all departments in the university.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department Name</TableHead>
                                <TableHead>Department Code</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading departments...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-destructive">Error: {error}</TableCell>
                                </TableRow>
                            ) : departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No departments found</TableCell>
                                </TableRow>
                            ) : (
                                departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">{dept.department_name}</TableCell>
                                        <TableCell>{dept.department_code}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
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
