'use client';

import React, { useState, useMemo } from 'react';
import { useStudents } from '@/hooks';
import { useGlobalContext } from '@/contexts/GlobalContext';
import {
  createStudentSchema,
  updateStudentSchema,
  type CreateStudentInput,
  type UpdateStudentInput,
  type StudentWithJoins
} from '@/lib/validation/students.schema';
import { validateData } from '@/lib/validation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Label } from './ui/label';
import { Loader2, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface StudentListProps {
  supabase: any;
  departmentId?: string;
  sessionId?: string;
}

export function StudentList({ supabase, departmentId, sessionId }: StudentListProps) {
  const { state, addNotification } = useGlobalContext();
  const { user } = state.auth;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithJoins | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<"" | "100" | "200" | "300" | "400" | "500">("");

  // ✅ Standard initial form data
  const emptyFormData: CreateStudentInput = {
    matric_number: '',
    full_name: '',
    level: '100',
    department_id: departmentId || '',
    session_id: sessionId || '',
    profile_id: user?.id || '',
    is_active: true
  };

  const [formData, setFormData] = useState<CreateStudentInput>(emptyFormData);

  const {
    students,
    isLoading,
    isError,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch
  } = useStudents(supabase, {
    departmentId,
    sessionId,
    limit: 100,
    enableRealtime: true
  });

  // ✅ Filter students
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const matchesSearch =
        !searchTerm ||
        s.matric_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = !selectedLevel || s.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [students, searchTerm, selectedLevel]);

  // ✅ Reset form
  const resetForm = () => setFormData(emptyFormData);

  // ✅ Handle create student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateData(createStudentSchema, formData);
    if (!validation.success) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please check the form data and try again.',
        duration: 5000
      });
      return;
    }
    try {
      await createStudent.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  // ✅ Handle edit
  const handleEditStudent = (student: StudentWithJoins) => {
    setEditingStudent(student);
    setFormData({
      matric_number: student.matric_number,
      full_name: student.full_name,
      level: String(student.level) as "100" | "200" | "300" | "400" | "500",
      department_id: student.department_id,
      session_id: student.session_id,
      profile_id: student.profile_id,
      is_active: student.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  // ✅ Handle update student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updateData: UpdateStudentInput = {
      id: editingStudent.id,
      ...formData
    };

    const validation = validateData(updateStudentSchema, updateData);
    if (!validation.success) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please check the form data and try again.',
        duration: 5000
      });
      return;
    }

    try {
      await updateStudent.mutateAsync(updateData);
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  // ✅ Handle delete
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent.mutateAsync({ id: studentId });
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  // ✅ Handle dialog close
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    resetForm();
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Error loading students</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Students</h2>
          <p className="text-gray-600">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <Label htmlFor="matric_number">Matric Number</Label>
                <Input
                  id="matric_number"
                  value={formData.matric_number}
                  onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value as "100" | "200" | "300" | "400" | "500" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudent.isPending}>
                  {createStudent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLevel} onValueChange={(val) => setSelectedLevel(val as any)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="100">100 Level</SelectItem>
            <SelectItem value="200">200 Level</SelectItem>
            <SelectItem value="300">300 Level</SelectItem>
            <SelectItem value="400">400 Level</SelectItem>
            <SelectItem value="500">500 Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.matric_number}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.level} Level</Badge>
                    </TableCell>
                    <TableCell>
                      {student.departments?.department_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditStudent(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStudent(student.id)} disabled={deleteStudent.isPending}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div>
              <Label htmlFor="edit_matric_number">Matric Number</Label>
              <Input
                id="edit_matric_number"
                value={formData.matric_number}
                onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value as "100" | "200" | "300" | "400" | "500" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
