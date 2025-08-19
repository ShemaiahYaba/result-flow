"use client"
import { useState, useEffect } from 'react';
import { withAuth } from '@/providers/UnifiedAuthProvider';
import { useAuth } from '@/providers/UnifiedAuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Users, Calendar, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  course_unit: number;
  level: number;
  semester: string;
  is_enrolled: boolean;
}

interface CurrentSemester {
  id: string;
  semester_name: string;
  session_name: string;
}

interface RegistrationData {
  courses: Course[];
  current_semester: CurrentSemester | null;
  student_level: number | null;
}

interface RegistrationResult {
  success: boolean;
  enrolled_courses: Array<{
    course_id: string;
    course_code: string;
    course_title: string;
  }>;
  failed_courses: Array<{
    course_id: string;
    course_code: string;
    error: string;
  }>;
}

function CourseRegistrationPage() {
  const { authenticatedFetch } = useAuth();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/student/course-registration');
      
      if (!response.ok) {
        throw new Error('Failed to fetch available courses');
      }

      const result = await response.json();
      const data = result.data || result;
      
      setRegistrationData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    const newSelection = new Set(selectedCourses);
    if (checked) {
      newSelection.add(courseId);
    } else {
      newSelection.delete(courseId);
    }
    setSelectedCourses(newSelection);
  };

  const handleRegistration = async () => {
    if (!registrationData?.current_semester || selectedCourses.size === 0) {
      return;
    }

    try {
      setRegistering(true);
      setError(null);
      setRegistrationResult(null);

      const response = await authenticatedFetch('/api/student/course-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_ids: Array.from(selectedCourses),
          semester_id: registrationData.current_semester.id
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      const data = result.data || result;
      
      setRegistrationResult(data);
      
      // Refresh the course list to show updated enrollment status
      await fetchAvailableCourses();
      setSelectedCourses(new Set());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const getTotalUnits = () => {
    if (!registrationData) return 0;
    return registrationData.courses
      .filter(course => selectedCourses.has(course.id))
      .reduce((total, course) => total + course.course_unit, 0);
  };

  const getEnrolledUnits = () => {
    if (!registrationData) return 0;
    return registrationData.courses
      .filter(course => course.is_enrolled)
      .reduce((total, course) => total + course.course_unit, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            No course registration data available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const availableCourses = registrationData.courses.filter(course => !course.is_enrolled);
  const enrolledCourses = registrationData.courses.filter(course => course.is_enrolled);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Registration</h1>
        <p className="text-gray-600">
          Register for courses for the current academic semester
        </p>
      </div>

      {/* Current Semester Info */}
      {registrationData.current_semester && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Semester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Session</p>
                <p className="font-semibold">{registrationData.current_semester.session_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-semibold">{registrationData.current_semester.semester_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-semibold">{registrationData.student_level || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Available Courses</p>
                <p className="text-2xl font-bold">{availableCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Enrolled Units</p>
                <p className="text-2xl font-bold">{getEnrolledUnits()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Selected Units</p>
                <p className="text-2xl font-bold">{getTotalUnits()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {registrationResult && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              {registrationResult.enrolled_courses.length > 0 && (
                <div>
                  <p className="font-semibold">Successfully registered for:</p>
                  <ul className="list-disc list-inside">
                    {registrationResult.enrolled_courses.map(course => (
                      <li key={course.course_id}>
                        {course.course_code} - {course.course_title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {registrationResult.failed_courses.length > 0 && (
                <div>
                  <p className="font-semibold text-red-600">Failed to register for:</p>
                  <ul className="list-disc list-inside">
                    {registrationResult.failed_courses.map(course => (
                      <li key={course.course_id} className="text-red-600">
                        {course.course_code}: {course.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Already Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Already Enrolled Courses</CardTitle>
            <CardDescription>
              Courses you are currently registered for this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {enrolledCourses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{course.course_code}</h3>
                      <Badge variant="secondary">{course.course_unit} units</Badge>
                      <Badge variant="outline">Enrolled</Badge>
                    </div>
                    <p className="text-gray-600">{course.course_title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Courses for Registration */}
      {availableCourses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>
              Select courses you want to register for this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableCourses.map(course => (
                <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={course.id}
                    checked={selectedCourses.has(course.id)}
                    onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{course.course_code}</h3>
                      <Badge variant="secondary">{course.course_unit} units</Badge>
                      <Badge variant="outline">{course.semester} semester</Badge>
                    </div>
                    <p className="text-gray-600">{course.course_title}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCourses.size > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Selected: {selectedCourses.size} courses ({getTotalUnits()} units)
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCourses(new Set())}
                      disabled={registering}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={handleRegistration}
                      disabled={registering || selectedCourses.size === 0}
                    >
                      {registering ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        'Register for Selected Courses'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Courses</h3>
            <p className="text-gray-600">
              All courses for your level have been registered for, or no courses are available for registration.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default withAuth(CourseRegistrationPage, ['student']);
