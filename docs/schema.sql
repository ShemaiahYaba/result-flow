-- ============================================
-- 🔒 ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marksheet_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 🔐 PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================
-- 🔐 STUDENT ENROLLMENTS
-- ============================================
-- Students can see only their own enrollment records
CREATE POLICY "Students can view own enrollment"
ON student_enrollments
FOR SELECT
USING (profile_id = auth.uid());

-- HODs can manage enrollments in their department
CREATE POLICY "HODs can manage department enrollments"
ON student_enrollments
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM profiles p
        JOIN department_heads dh ON dh.department_id = p.department_id
        WHERE p.id = student_enrollments.profile_id
          AND dh.profile_id = auth.uid()
          AND dh.is_active = true
          AND (dh.end_date IS NULL OR dh.end_date >= CURRENT_DATE)
    )
);

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments"
ON student_enrollments
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================
-- 🔐 STUDENT COURSES
-- ============================================
CREATE POLICY "Students can view own courses"
ON student_courses
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM student_enrollments e
        WHERE e.id = student_courses.enrollment_id
          AND e.profile_id = auth.uid()
    )
);

CREATE POLICY "HODs can manage department student courses"
ON student_courses
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM student_enrollments e
        JOIN profiles p ON p.id = e.profile_id
        JOIN department_heads dh ON dh.department_id = p.department_id
        WHERE e.id = student_courses.enrollment_id
          AND dh.profile_id = auth.uid()
          AND dh.is_active = true
    )
);

CREATE POLICY "Admins can manage all student courses"
ON student_courses
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================
-- 🔐 RESULTS
-- ============================================
CREATE POLICY "Students can view own results"
ON results
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM student_enrollments e
        WHERE e.id = results.enrollment_id
          AND e.profile_id = auth.uid()
    )
);

CREATE POLICY "HODs can manage department results"
ON results
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM student_enrollments e
        JOIN profiles p ON p.id = e.profile_id
        JOIN department_heads dh ON dh.department_id = p.department_id
        WHERE e.id = results.enrollment_id
          AND dh.profile_id = auth.uid()
          AND dh.is_active = true
    )
);

CREATE POLICY "Admins can manage all results"
ON results
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================
-- 🔐 RESULT SUBMISSIONS
-- ============================================
CREATE POLICY "HODs can manage department submissions"
ON result_submissions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM department_heads dh
        WHERE dh.department_id = result_submissions.department_id
          AND dh.profile_id = auth.uid()
          AND dh.is_active = true
    )
);

CREATE POLICY "Admins can manage all submissions"
ON result_submissions
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================
-- 🔐 COURSES & DEPARTMENTS
-- ============================================
CREATE POLICY "All authenticated users can view courses"
ON courses
FOR SELECT
USING (true);

CREATE POLICY "HODs can manage their department courses"
ON courses
FOR ALL
USING (
        EXISTS (
        SELECT 1 FROM department_heads dh
        WHERE dh.department_id = courses.department_id
          AND dh.profile_id = auth.uid()
          AND dh.is_active = true
    )
);

CREATE POLICY "Admins can manage all courses"
ON courses
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "All authenticated users can view departments"
ON departments
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all departments"
ON departments
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
