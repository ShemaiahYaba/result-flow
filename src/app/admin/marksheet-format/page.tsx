
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
import { useMarksheetFormat } from "@/hooks/useMarksheetFormat";

export default function MarksheetFormatPage() {
    const { columns, loading, error, createColumn, updateColumn, deleteColumn } = useMarksheetFormat();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newColumn, setNewColumn] = useState<{ column_name: string; display_name: string; column_type: 'identifier' | 'text' | 'score'; is_required: boolean }>({ column_name: "", display_name: "", column_type: "text", is_required: false });

    const handleAddColumn = async () => {
        if(newColumn.column_name && newColumn.display_name && newColumn.column_type) {
            try {
                await createColumn(newColumn);
                setIsDialogOpen(false);
                setNewColumn({ column_name: "", display_name: "", column_type: "text", is_required: false });
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleDeleteColumn = async (id: string) => {
        if (confirm('Are you sure you want to delete this column?')) {
            try {
                await deleteColumn(id);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

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
                                <Input id="column-name" placeholder="e.g., student_id" className="col-span-3" value={newColumn.column_name} onChange={e => setNewColumn({...newColumn, column_name: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="display-name" className="text-right">Display Name</Label>
                                <Input id="display-name" placeholder="e.g., Student ID" className="col-span-3" value={newColumn.display_name} onChange={e => setNewColumn({...newColumn, display_name: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="column-type" className="text-right">Type</Label>
                                <Select value={newColumn.column_type} onValueChange={value => setNewColumn({...newColumn, column_type: value as 'identifier' | 'text' | 'score'})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="identifier">Identifier</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="score">Score</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="column-required" className="text-right">Required</Label>
                                <Checkbox id="column-required" className="ml-4" checked={newColumn.is_required} onCheckedChange={checked => setNewColumn({...newColumn, is_required: !!checked})} />
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading marksheet format...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-destructive">Error: {error}</TableCell>
                                </TableRow>
                            ) : columns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No columns found</TableCell>
                                </TableRow>
                            ) : (
                                columns.map((col) => (
                                    <TableRow key={col.id}>
                                        <TableCell className="font-medium">{col.display_name}</TableCell>
                                        <TableCell><Badge variant="secondary">{col.column_type}</Badge></TableCell>
                                        <TableCell>{col.is_required ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteColumn(col.id)}
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
