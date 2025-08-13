
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialHods = [
    { id: 1, name: 'Dr. Chinedu Okoro', staffId: 'HOD/CSC/001', email: 'chinedu.okoro@university.edu', department: 'Computer Science', status: 'Active' },
    { id: 2, name: 'Dr. Fatima Aliyu', staffId: 'HOD/MEE/001', email: 'fatima.aliyu@university.edu', department: 'Mechanical Engineering', status: 'Active' },
    { id: 3, name: 'Dr. Adebayo Ogunbiyi', staffId: 'HOD/BCH/001', email: 'adebayo.o@university.edu', department: 'Biochemistry', status: 'Inactive' },
];

export default function ManageHodsPage() {
    const [hods, setHods] = useState(initialHods);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state for new HOD
    const [newHod, setNewHod] = useState({
        name: "",
        staffId: "",
        email: "",
        department: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewHod(prev => ({ ...prev, [id]: value }));
    }

    const handleSelectChange = (value: string) => {
        setNewHod(prev => ({ ...prev, department: value }));
    }

    const handleAddHod = () => {
        if (newHod.name && newHod.staffId && newHod.email && newHod.department) {
            const newEntry = {
                id: hods.length + 1,
                ...newHod,
                status: 'Active'
            };
            setHods([...hods, newEntry]);
            setIsDialogOpen(false);
            // Reset form
            setNewHod({ name: "", staffId: "", email: "", department: "" });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage HODs</h1>
                    <p className="text-muted-foreground">Create and manage accounts for Heads of Department.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create HOD Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline">Create New HOD Account</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new HOD and assign them to a department.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Full Name</Label>
                                <Input id="name" placeholder="e.g., Dr. Jane Doe" className="col-span-3" value={newHod.name} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="staffId" className="text-right">Staff ID</Label>
                                <Input id="staffId" placeholder="e.g., HOD/ENG/005" className="col-span-3" value={newHod.staffId} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" placeholder="e.g., jane.doe@university.edu" className="col-span-3" value={newHod.email} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="department" className="text-right">Department</Label>
                                <Select onValueChange={handleSelectChange}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                        <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={handleAddHod}>Create Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>HOD List</CardTitle>
                    <CardDescription>A list of all HODs in the university.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Staff ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hods.map((hod) => (
                                <TableRow key={hod.id}>
                                    <TableCell className="font-medium">{hod.name}</TableCell>
                                    <TableCell>{hod.staffId}</TableCell>
                                    <TableCell>{hod.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={hod.status === 'Active' ? 'default' : 'secondary'}>{hod.status}</Badge>
                                    </TableCell>
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
