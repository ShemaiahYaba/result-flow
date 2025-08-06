
"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File as FileIcon, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function UploadBox({ id, title, description, acceptedFiles }: { id: string; title: string; description: string; acceptedFiles: string; }) {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            // You might want to trigger the hidden input's onChange as well
            if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
            }
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeFile = () => {
        setFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    if (file) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-card p-4">
                 <div className="flex items-center gap-4 p-4 rounded-lg bg-muted w-full">
                     <FileIcon className="h-8 w-8 text-primary" />
                     <div className="flex-1">
                         <p className="font-medium truncate">{file.name}</p>
                         <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                     </div>
                     <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={removeFile}>
                         <X className="h-4 w-4" />
                     </Button>
                 </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center w-full">
            <Label 
                htmlFor={id} 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{description}</p>
                    <p className="text-xs text-muted-foreground">Accepted formats: {acceptedFiles}</p>
                </div>
                <Input id={id} type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept={acceptedFiles.split(', ').map(ext => `.${ext.toLowerCase()}`).join(',')} />
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
            <div className="flex justify-end pt-4">
                <Button size="lg">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Uploads
                </Button>
            </div>
        </div>
    );
}
