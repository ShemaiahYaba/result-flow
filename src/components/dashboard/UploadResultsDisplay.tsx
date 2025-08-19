'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

interface UploadResult {
  id: string;
  file_name: string;
  file_type: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  status: string;
  error_details?: {
    errors?: string[];
  } | null;
  uploaded_at: string;
  processed_at?: string | null;
  course?: {
    course_code: string;
    course_title: string;
  } | null;
  semester?: {
    semester_name: string;
  } | null;
}

interface UploadResultsDisplayProps {
  uploads: UploadResult[];
  showCourseInfo?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'processing':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'uploaded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function UploadResultsDisplay({ 
  uploads, 
  showCourseInfo = false 
}: UploadResultsDisplayProps) {
  if (!uploads || uploads.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No upload results found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {uploads.map((upload) => (
        <Card key={upload.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(upload.status)}
                Upload Results
              </CardTitle>
              <Badge className={getStatusColor(upload.status)}>
                {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
              </Badge>
            </div>
            {showCourseInfo && upload.course && (
              <div className="text-sm text-gray-600">
                <p><strong>Course:</strong> {upload.course.course_code} - {upload.course.course_title}</p>
                {upload.semester && (
                  <p><strong>Semester:</strong> {upload.semester.semester_name}</p>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* File Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">File Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>File Name:</strong> {upload.file_name}</p>
                <p><strong>File Type:</strong> {upload.file_type.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Uploaded:</strong> {formatDate(upload.uploaded_at)}</p>
                {upload.processed_at && (
                  <p><strong>Processed:</strong> {formatDate(upload.processed_at)}</p>
                )}
              </div>
            </div>

            {/* Processing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{upload.total_records}</div>
                <div className="text-sm text-blue-800">Total Records</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{upload.processed_records}</div>
                <div className="text-sm text-green-800">Processed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{upload.failed_records}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
            </div>

            {/* Success/Failure Message */}
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm">
                <strong>Message:</strong>{' '}
                {upload.status === 'completed' && upload.failed_records === 0
                  ? `Successfully processed ${upload.processed_records} ${upload.file_type.replace('_', ' ')} records`
                  : upload.status === 'failed'
                  ? `Processing failed with ${upload.failed_records} errors`
                  : upload.status === 'processing'
                  ? 'Processing in progress...'
                  : `Processed ${upload.processed_records} records with ${upload.failed_records} failures`
                }
              </p>
            </div>

            {/* Error Details */}
            {upload.error_details?.errors && upload.error_details.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">Processing Errors:</p>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {upload.error_details.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
