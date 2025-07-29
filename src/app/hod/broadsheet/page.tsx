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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download } from "lucide-react";

const broadsheetData = [
    { matric: 'F/HD/21/1234567', name: 'John Doe', csc101: 75, csc102: 80, gpa: 4.5 },
    { matric: 'F/HD/21/1234568', name: 'Jane Smith', csc101: 65, csc102: 72, gpa: 3.8 },
    { matric: 'F/HD/21/1234569', name: 'Peter Jones', csc101: 85, csc102: 90, gpa: 5.0 },
    { matric: 'F/HD/21/1234570', name: 'Mary Williams', csc101: 55, csc102: 60, gpa: 3.0 },
    { matric: 'F/HD/21/1234571', name: 'David Brown', csc101: 48, csc102: 52, gpa: 2.5 },
];

export default function BroadsheetPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Results Broadsheet</h1>
                    <p className="text-muted-foreground">View a summary of all student results in the department.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="2022-2023-1">
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2022-2023-1">2022/2023 - 1st Semester</SelectItem>
                            <SelectItem value="2021-2022-2">2021/2022 - 2nd Semester</SelectItem>
                            <SelectItem value="2021-2022-1">2021/2022 - 1st Semester</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Computer Science - 100 Level, 1st Semester</CardTitle>
                    <CardDescription>Broadsheet showing scores and GPA for each student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Matric No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>CSC 101</TableHead>
                                <TableHead>CSC 102</TableHead>
                                <TableHead className="text-right">GPA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {broadsheetData.map((student) => (
                                <TableRow key={student.matric}>
                                    <TableCell className="font-mono">{student.matric}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.csc101}</TableCell>
                                    <TableCell>{student.csc102}</TableCell>
                                    <TableCell className="text-right font-semibold">{student.gpa.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
