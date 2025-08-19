-- Update existing HOD courses dropdown to include course offerings
DROP VIEW IF EXISTS hod_courses_dropdown;

CREATE OR REPLACE VIEW hod_courses_dropdown AS
SELECT 
    c.id as course_id,
    c.course_code,
    c.course_title,
    c.level,
    c.semester,
    c.course_unit,
    co.id as offering_id,
    co.max_enrollment,
    co.current_enrollment,
    co.registration_open,
    sem.semester_name,
    sess.session_name,
    h.id as hod_id
FROM courses c
JOIN departments d ON c.department_id = d.id
JOIN hods h ON d.id = h.department_id
LEFT JOIN course_offerings co ON c.id = co.course_id
LEFT JOIN academic_semesters sem ON co.semester_id = sem.id
LEFT JOIN academic_sessions sess ON sem.session_id = sess.id
WHERE c.is_active = true AND h.is_active = true
ORDER BY c.level, c.course_code;

-- Update student available courses view to include enrollment capacity info
DROP VIEW IF EXISTS student_available_courses;

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
