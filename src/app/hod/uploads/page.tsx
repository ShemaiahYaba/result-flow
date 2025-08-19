
"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File as FileIcon, X, CheckCircle, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/providers/UnifiedAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useHodSemesters } from "@/hooks/useHodSemesters";
import UploadResultsDisplay from "@/components/dashboard/UploadResultsDisplay";

interface Course {
  course_id: string;
  course_code: string;
  course_title: string;
  level: number;
  semester: string;
  course_unit: number;
}

interface Semester {
  semester_id: string;
  session_name: string;
  semester_name: string;
  display_name: string;
  hod_id: string;
}

function UploadBox({ id, title, description, acceptedFiles, onFileSelect }: { 
    id: string; 
    title: string; 
    description: string; 
    acceptedFiles: string;
    onFileSelect?: (file: File | null) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            onFileSelect?.(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            onFileSelect?.(droppedFile);
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
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-card p-4">
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
                className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
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

export const dynamic = 'force-dynamic';

export default function HodUploadsPage() {
    const { authenticatedFetch } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [studentRegistryFile, setStudentRegistryFile] = useState<File | null>(null);
    const [courseRegistryFile, setCourseRegistryFile] = useState<File | null>(null);
    const [marksheetFile, setMarksheetFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<any>(null);
    const [currentUploadDetails, setCurrentUploadDetails] = useState<any>(null);

    // Use real semesters API
    const { data: semesters, loading: loadingSemesters, error: semestersError, fetchSemesters } = useHodSemesters();

    useEffect(() => {
        fetchCourses();
        fetchSemesters();
    }, [fetchSemesters]);

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await authenticatedFetch('/api/hod/courses');
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch courses');
            }
            
            setCourses(result.data || result);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleStudentRegistryUpload = async () => {
        if (!studentRegistryFile || !selectedSemester) {
            alert('Please select a file and semester');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', studentRegistryFile);
            formData.append('semester_id', selectedSemester);

            const response = await authenticatedFetch('/api/hod/uploads/student-registry', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Upload failed');
            }

            setUploadResults(result.data || result);
            alert(`Upload successful! Processed ${result.data?.processed_records || 0} records.`);
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCourseRegistryUpload = async () => {
        if (!courseRegistryFile || !selectedSemester) {
            alert('Please select a file and semester');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', courseRegistryFile);
            formData.append('semester_id', selectedSemester);

            const response = await authenticatedFetch('/api/hod/uploads/course-registry', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Upload failed');
            }

            setUploadResults(result.data || result);
            alert(`Upload successful! Processed ${result.data?.processed_records || 0} course records.`);
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleMarksheetUpload = async () => {
        if (!marksheetFile || !selectedCourse || !selectedSemester) {
            alert('Please select a file, course, and semester');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', marksheetFile);
            formData.append('course_id', selectedCourse);
            formData.append('semester_id', selectedSemester);

            const response = await authenticatedFetch('/api/hod/uploads/course-marksheet', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Upload failed');
            }

            setUploadResults(result.data || result);
            
            // Fetch detailed upload information including errors
            if (result.data?.upload_id || result.upload_id) {
                fetchUploadDetails(result.data?.upload_id || result.upload_id);
            }
            
            alert(`Upload successful! Processed ${result.data?.processed_records || 0} results and submitted for approval.`);
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const fetchUploadDetails = async (uploadId: string) => {
        try {
            const response = await authenticatedFetch(`/api/hod/upload-details?upload_id=${uploadId}`);
            const result = await response.json();
            
            if (response.ok && result.data?.uploads?.length > 0) {
                setCurrentUploadDetails(result.data.uploads[0]);
            }
        } catch (error) {
            console.error('Failed to fetch upload details:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Management</h1>
                <p className="text-gray-600">Upload student registries, course registries and course marksheets for your department.</p>
            </div>

            {/* Semester Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Semester</h2>
                {semestersError && (
                    <div className="text-red-600 text-sm mb-4">
                        Error loading semesters: {semestersError}
                    </div>
                )}
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingSemesters ? "Loading semesters..." : "Choose a semester"} />
                    </SelectTrigger>
                    <SelectContent>
                        {semesters.map((semester) => (
                            <SelectItem key={semester.semester_id} value={semester.semester_id}>
                                {semester.display_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student Registry Upload */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Registry Upload</h2>
                    <p className="text-gray-600 mb-6">Upload a CSV file containing student registration data.</p>
                    
                    <UploadBox 
                        id="student-registry"
                        title="Student Registry File"
                        description="CSV file with student data (matric_number, first_name, last_name, email, level)"
                        acceptedFiles=".csv,.xlsx"
                        onFileSelect={setStudentRegistryFile}
                    />
                    
                    <Button 
                        className="w-full mt-4" 
                        disabled={!studentRegistryFile || !selectedSemester || uploading}
                        onClick={handleStudentRegistryUpload}
                    >
                        {uploading ? 'Uploading...' : 'Upload Student Registry'}
                    </Button>
                </div>

                {/* Course Registry Upload */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Registry Upload</h2>
                    <p className="text-gray-600 mb-6">Upload a CSV file containing course registration data.</p>
                    
                    <UploadBox 
                        id="course-registry"
                        title="Course Registry File"
                        description="CSV file with course data (course_id, course_code, course_title, course_description)"
                        acceptedFiles=".csv,.xlsx"
                        onFileSelect={setCourseRegistryFile}
                    />
                    
                    <Button 
                        className="w-full mt-4" 
                        disabled={!courseRegistryFile || !selectedSemester || uploading}
                        onClick={handleCourseRegistryUpload}
                    >
                        {uploading ? 'Uploading...' : 'Upload Course Registry'}
                    </Button>
                </div>

                {/* Course Marksheet Upload */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Marksheet Upload</h2>
                    <p className="text-gray-600 mb-6">Upload course results for a specific course and semester.</p>
                    
                    {/* Course Selection */}
                    <div className="mb-4">
                        <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Course
                        </label>
                        <Select 
                            value={selectedCourse} 
                            onValueChange={setSelectedCourse}
                            disabled={loadingCourses}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Choose a course"} />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.course_id} value={course.course_id}>
                                        {course.course_code} - {course.course_title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <UploadBox 
                        id="course-marksheet"
                        title="Course Marksheet File"
                        description="CSV file with results (matric_number, score, grade)"
                        acceptedFiles=".csv,.xlsx"
                        onFileSelect={setMarksheetFile}
                    />
                    
                    <Button 
                        className="w-full mt-4" 
                        disabled={!marksheetFile || !selectedCourse || !selectedSemester || uploading}
                        onClick={handleMarksheetUpload}
                    >
                        {uploading ? 'Uploading...' : 'Upload Course Marksheet'}
                    </Button>
                </div>
            </div>

            {/* Upload Results */}
            {uploadResults && (
                <><div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
                    <div className="space-y-2">
                        <p><strong>Status:</strong> {uploadResults.status}</p>
                        <p><strong>Total Records:</strong> {uploadResults.total_records}</p>
                        <p><strong>Processed:</strong> {uploadResults.processed_records}</p>
                        <p><strong>Failed:</strong> {uploadResults.failed_records}</p>
                        <p><strong>Message:</strong> {uploadResults.message}</p>
                        {uploadResults.submission_id && (
                            <p><strong>Submission ID:</strong> {uploadResults.submission_id}</p>
                        )}
                    </div>
                </div>
                {currentUploadDetails && (
                    <UploadResultsDisplay uploads={[currentUploadDetails]} showCourseInfo={true} />
                )}
                </>
            )}
        </div>
    );
}
