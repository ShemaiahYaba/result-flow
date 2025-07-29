import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

function UploadBox({ id, title, description, acceptedFiles }: { id: string; title: string; description: string; acceptedFiles: string; }) {
    return (
        <div className="flex items-center justify-center w-full">
            <Label htmlFor={id} className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{description}</p>
                    <p className="text-xs text-muted-foreground">Accepted formats: {acceptedFiles}</p>
                </div>
                <Input id={id} type="file" className="hidden" />
            </Label>
        </div>
    )
}

export default function UploadsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Upload Files</h1>
                <p className="text-muted-foreground">Upload student registries and course marksheets for result processing.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Student Registry</CardTitle>
                        <CardDescription>Upload the list of all registered students for the session. This should include matriculation numbers and names.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UploadBox 
                            id="student-registry-upload" 
                            title="Upload Student Registry"
                            description="Drag & drop or click to upload"
                            acceptedFiles="CSV, XLSX"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Course Marksheet</CardTitle>
                        <CardDescription>Upload a course-specific marksheet. Ensure it follows the admin-defined format for successful parsing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UploadBox 
                            id="marksheet-upload" 
                            title="Upload Marksheet"
                            description="Drag & drop or click to upload"
                            acceptedFiles="CSV, XLSX"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
