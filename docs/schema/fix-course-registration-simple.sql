-- Simplified fix for student course registration
-- This creates a basic view that should work with existing data

-- Drop the complex view if it exists
DROP VIEW IF EXISTS student_available_courses;

-- Create a simple view that shows all courses for students in their department
CREATE OR REPLACE VIEW student_available_courses AS
SELECT 
    s.id as student_id,
    s.matric_number,
    c.id as course_id,
    c.course_code,
    c.course_title,
    c.course_unit,
    c.level,
    c.semester,
    NULL as max_enrollment,
    0 as current_enrollment,
    true as registration_open,
    NULL as registration_start_date,
    NULL as registration_end_date,
    NULL as semester_name,
    NULL as session_name,
    'available' as enrollment_status
FROM students s
CROSS JOIN courses c
WHERE c.department_id = s.department_id
  AND c.is_active = true
  AND s.is_active = true;

-- Test the view
SELECT COUNT(*) as total_records FROM student_available_courses;

-- Test for a specific student
SELECT * FROM student_available_courses 
WHERE student_id = '0eccb9b9-89cb-4f95-8110-7cbcb6997abd' 
LIMIT 5;
