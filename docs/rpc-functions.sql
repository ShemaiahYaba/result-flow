-- =============================================
-- 📜 ResultFlow RPC Functions for Supabase (v1)
-- =============================================
-- These functions plug into your existing schema to support the missing endpoints:
--  1️⃣ Calculate GPA
--  2️⃣ Calculate CGPA
--  3️⃣ Admin Dashboard Statistics
--  4️⃣ HOD Dashboard Statistics
--  5️⃣ Generate Broadsheet Data
-- =============================================

-- 1️⃣ CALCULATE GPA (per session & semester)
CREATE OR REPLACE FUNCTION calculate_gpa(
    p_student_id UUID,
    p_session_id UUID,
    p_semester semester_type
)
RETURNS TABLE (
    student_id UUID,
    session_id UUID,
    semester semester_type,
    total_units INT,
    total_points NUMERIC,
    gpa NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.student_id,
        r.session_id,
        c.semester,
        SUM(c.unit) AS total_units,
        SUM(c.unit * r.grade_point) AS total_points,
        CASE WHEN SUM(c.unit) > 0 THEN ROUND(SUM(c.unit * r.grade_point) / SUM(c.unit), 2)
             ELSE 0 END AS gpa
    FROM results r
    JOIN courses c ON c.id = r.course_id
    WHERE r.student_id = p_student_id
      AND r.session_id = p_session_id
      AND c.semester = p_semester
      AND r.status = 'approved'
    GROUP BY r.student_id, r.session_id, c.semester;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ CALCULATE CGPA (all sessions)
CREATE OR REPLACE FUNCTION calculate_cgpa(
    p_student_id UUID
)
RETURNS TABLE (
    student_id UUID,
    total_units INT,
    total_points NUMERIC,
    cgpa NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.student_id,
        SUM(c.unit) AS total_units,
        SUM(c.unit * r.grade_point) AS total_points,
        CASE WHEN SUM(c.unit) > 0 THEN ROUND(SUM(c.unit * r.grade_point) / SUM(c.unit), 2)
             ELSE 0 END AS cgpa
    FROM results r
    JOIN courses c ON c.id = r.course_id
    WHERE r.student_id = p_student_id
      AND r.status = 'approved'
    GROUP BY r.student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3️⃣ ADMIN DASHBOARD STATS
CREATE OR REPLACE FUNCTION admin_dashboard_stats()
RETURNS TABLE (
    total_students BIGINT,
    total_departments BIGINT,
    total_courses BIGINT,
    pending_results BIGINT,
    approved_results BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM students WHERE is_active = TRUE) AS total_students,
        (SELECT COUNT(*) FROM departments WHERE is_active = TRUE) AS total_departments,
        (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) AS total_courses,
        (SELECT COUNT(*) FROM results WHERE status = 'pending') AS pending_results,
        (SELECT COUNT(*) FROM results WHERE status = 'approved') AS approved_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4️⃣ HOD DASHBOARD STATS (per department)
CREATE OR REPLACE FUNCTION hod_dashboard_stats(
    p_department_id UUID
)
RETURNS TABLE (
    department_id UUID,
    total_students BIGINT,
    total_courses BIGINT,
    pending_results BIGINT,
    approved_results BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_department_id,
        (SELECT COUNT(*) FROM students s WHERE s.department_id = p_department_id AND is_active = TRUE) AS total_students,
        (SELECT COUNT(*) FROM courses c WHERE c.department_id = p_department_id AND is_active = TRUE) AS total_courses,
        (SELECT COUNT(*) FROM results r JOIN students s ON s.id = r.student_id WHERE s.department_id = p_department_id AND r.status = 'pending') AS pending_results,
        (SELECT COUNT(*) FROM results r JOIN students s ON s.id = r.student_id WHERE s.department_id = p_department_id AND r.status = 'approved') AS approved_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5️⃣ GENERATE BROADSHEET DATA
CREATE OR REPLACE FUNCTION generate_broadsheet(
    p_session_id UUID,
    p_semester semester_type,
    p_level student_level,
    p_department_id UUID
)
RETURNS TABLE (
    student_id UUID,
    matric_number VARCHAR,
    full_name VARCHAR,
    course_code VARCHAR,
    course_title VARCHAR,
    unit INT,
    score INT,
    grade VARCHAR,
    grade_point NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS student_id,
        s.matric_number,
        s.full_name,
        c.course_code,
        c.course_title,
        c.unit,
        r.score,
        r.grade,
        r.grade_point
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN courses c ON c.id = r.course_id
    WHERE r.session_id = p_session_id
      AND c.semester = p_semester
      AND s.level = p_level
      AND s.department_id = p_department_id
      AND r.status = 'approved'
    ORDER BY s.matric_number, c.course_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
