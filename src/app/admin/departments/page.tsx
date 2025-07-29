
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

const initialDepartments = [
    { id: 1, name: 'Computer Science', hod: 'Dr. Chinedu Okoro' },
    { id: 2, name: 'Mechanical Engineering', hod: 'Dr. Fatima Aliyu' },
    { id: 3, name: 'Biochemistry', hod: 'Dr. Adebayo Ogunbiyi' },
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState(initialDepartments);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptHod, setNewDeptHod] = useState("");

    const handleAddDepartment = () => {
        if (newDeptName && newDeptHod) {
            setDepartments([
                ...departments,
                {
                    id: departments.length + 1,
                    name: newDeptName,
                    hod: newDeptHod
                }
            ]);
            setIsDialogOpen(false);
            setNewDeptName("");
            setNewDeptHod("");
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
                                <Label htmlFor="hod" className="text-right">HOD</Label>
                                <Input id="hod" placeholder="e.g., Dr. John Doe" className="col-span-3" value={newDeptHod} onChange={(e) => setNewDeptHod(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={handleAddDepartment}>Save Department</Button>
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
                                <TableHead>Head of Department (HOD)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell>{dept.hod}</TableCell>
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
