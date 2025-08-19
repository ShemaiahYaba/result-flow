'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  Upload
} from 'lucide-react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

interface UploadRecord {
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

interface UploadHistoryResponse {
  uploads: UploadRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UploadHistoryPage() {
  const { authenticatedFetch } = useAuth();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const fetchUploads = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`/api/hod/upload-details?page=${page}&limit=10`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch upload history');
      }
      
      // Handle route factory response format
      const data = result.data || result;
      setUploads(data.uploads || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upload history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleErrorExpansion = (uploadId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(uploadId)) {
      newExpanded.delete(uploadId);
    } else {
      newExpanded.add(uploadId);
    }
    setExpandedErrors(newExpanded);
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.course?.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.course?.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || upload.status === statusFilter;
    const matchesType = typeFilter === 'all' || upload.file_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading upload history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload History</h1>
        <p className="text-gray-600">Track and manage your file uploads and their processing status.</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student_registry">Student Registry</SelectItem>
                <SelectItem value="course_marksheet">Course Marksheet</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => fetchUploads(currentPage)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Records */}
      <div className="space-y-4">
        {filteredUploads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
              <p className="text-gray-500">
                {uploads.length === 0 
                  ? "You haven't uploaded any files yet." 
                  : "No uploads match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUploads.map((upload) => (
            <Card key={upload.id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <CardTitle className="text-lg font-semibold">{upload.file_name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {upload.file_type.replace('_', ' ').toUpperCase()} • 
                        Uploaded {formatDate(upload.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(upload.status)}
                </div>
                
                {upload.course && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Course:</strong> {upload.course.course_code} - {upload.course.course_title}</p>
                    {upload.semester && (
                      <p><strong>Semester:</strong> {upload.semester.semester_name}</p>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
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

                {/* Status Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Status:</strong>{' '}
                    {upload.status === 'completed' && upload.failed_records === 0
                      ? `Successfully processed ${upload.processed_records} ${upload.file_type.replace('_', ' ')} records`
                      : upload.status === 'failed'
                      ? `Processing failed with ${upload.failed_records} errors`
                      : upload.status === 'processing'
                      ? 'Processing in progress...'
                      : `Processed ${upload.processed_records} records with ${upload.failed_records} failures`
                    }
                  </p>
                  {upload.processed_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Processed: {formatDate(upload.processed_at)}
                    </p>
                  )}
                </div>

                {/* Error Details */}
                {upload.error_details?.errors && upload.error_details.errors.length > 0 && (
                  <div className="border border-red-200 rounded-lg">
                    <Button
                      variant="ghost"
                      onClick={() => toggleErrorExpansion(upload.id)}
                      className="w-full justify-between p-4 h-auto text-red-700 hover:bg-red-50"
                    >
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        {upload.error_details.errors.length} Processing Error{upload.error_details.errors.length !== 1 ? 's' : ''}
                      </span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {expandedErrors.has(upload.id) && (
                      <div className="border-t border-red-200 bg-red-50 p-4">
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                            {upload.error_details.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => fetchUploads(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => fetchUploads(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => fetchUploads(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
