import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const pastResultsData = {
    "2022_2023_2": {
        gpa: "4.60",
        results: [
            { code: 'CSC 311', title: 'Data Structures', units: 3, grade: 'A', score: 75 },
            { code: 'CSC 321', title: 'Operating Systems', units: 3, grade: 'B', score: 65 },
        ]
    },
    "2022_2023_1": {
        gpa: "4.80",
        results: [
            { code: 'CSC 211', title: 'Intro to Programming II', units: 3, grade: 'A', score: 88 },
            { code: 'MTH 211', title: 'Calculus II', units: 3, grade: 'A', score: 82 },
        ]
    }
}

export const dynamic = 'force-dynamic';

export default function PastResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Past Results</h1>
        <p className="text-muted-foreground">
          View your academic history and results from previous semesters.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(pastResultsData).map(([semesterId, data]) => {
            const [year, , semester] = semesterId.split('_');
            const session = `${year}/${parseInt(year)+1}`;
            const semesterText = semester === '1' ? '1st Semester' : '2nd Semester';

            return (
                <AccordionItem value={semesterId} key={semesterId}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-4">
                            <span>{session} - {semesterText}</span>
                            <Badge variant="outline">GPA: {data.gpa}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Title</TableHead>
                                    <TableHead>Units</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.results.map((result) => (
                                    <TableRow key={result.code}>
                                        <TableCell className="font-mono">{result.code}</TableCell>
                                        <TableCell>{result.title}</TableCell>
                                        <TableCell>{result.units}</TableCell>
                                        <TableCell>{result.score}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">{result.grade}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            );
        })}
      </Accordion>
    </div>
  );
}
