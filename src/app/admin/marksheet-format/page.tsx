
"use client";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const initialColumns = [
    { name: 'Matric No', type: 'Identifier', required: true },
    { name: 'CA', type: 'Score', required: true },
    { name: 'Exam', type: 'Score', required: true },
    { name: 'Total', type: 'Calculated', required: false },
];

type Column = typeof initialColumns[0];

export default function MarksheetFormatPage() {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newColumn, setNewColumn] = useState({ name: "", type: "Text", required: false });

    const handleAddColumn = () => {
        if(newColumn.name && newColumn.type) {
            setColumns([...columns, newColumn as Column]);
            setIsDialogOpen(false);
            setNewColumn({ name: "", type: "Text", required: false });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Marksheet Format</h1>
                    <p className="text-muted-foreground">Define the standard format for marksheet uploads.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Column
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="font-headline">Add New Column</DialogTitle>
                            <DialogDescription>
                                Add a new field to the marksheet format.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="column-name" className="text-right">Column Name</Label>
                                <Input id="column-name" placeholder="e.g., Full Name" className="col-span-3" value={newColumn.name} onChange={e => setNewColumn({...newColumn, name: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="column-type" className="text-right">Type</Label>
                                <Select value={newColumn.type} onValueChange={value => setNewColumn({...newColumn, type: value})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Identifier">Identifier</SelectItem>
                                        <SelectItem value="Text">Text</SelectItem>
                                        <SelectItem value="Score">Score</SelectItem>
                                        <SelectItem value="Calculated">Calculated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="column-required" className="text-right">Required</Label>
                                <Checkbox id="column-required" className="ml-4" checked={newColumn.required} onCheckedChange={checked => setNewColumn({...newColumn, required: !!checked})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddColumn}>Save Column</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Standard Marksheet Columns</CardTitle>
                    <CardDescription>All uploaded marksheets must adhere to this structure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Column Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {columns.map((col) => (
                                <TableRow key={col.name}>
                                    <TableCell className="font-medium">{col.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{col.type}</Badge></TableCell>
                                    <TableCell>{col.required ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
