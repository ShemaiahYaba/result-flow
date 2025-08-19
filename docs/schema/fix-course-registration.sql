-- Fix for student course registration not displaying courses
-- This creates the missing student_available_courses view

-- Create student available courses view
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
    co.max_enrollment,
    co.current_enrollment,
    co.registration_open,
    co.registration_start_date,
    co.registration_end_date,
    sem.semester_name,
    sess.session_name,
    CASE 
        WHEN co.max_enrollment IS NULL THEN 'unlimited'
        WHEN co.current_enrollment >= co.max_enrollment THEN 'full'
        WHEN co.current_enrollment >= (co.max_enrollment * 0.8) THEN 'nearly_full'
        ELSE 'available'
    END as enrollment_status
FROM students s
JOIN student_semester_enrollments sse ON s.id = sse.student_id
JOIN academic_semesters sem ON sse.semester_id = sem.id
JOIN academic_sessions sess ON sem.session_id = sess.id
JOIN course_offerings co ON sem.id = co.semester_id
JOIN courses c ON co.course_id = c.id
WHERE c.level = sse.level
  AND c.department_id = s.department_id
  AND co.registration_open = true
  AND c.is_active = true
  AND s.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM student_course_enrollments sce 
    WHERE sce.course_id = c.id 
    AND sce.student_semester_enrollment_id = sse.id
  );

-- Alternative: If course_offerings table doesn't exist, create a simpler view
-- Uncomment this if the above fails due to missing course_offerings table:

/*
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
JOIN courses c ON c.department_id = s.department_id
WHERE c.is_active = true
  AND s.is_active = true;
*/
