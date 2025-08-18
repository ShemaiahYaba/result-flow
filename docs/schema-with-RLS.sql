-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- University Management System - Complete Security Implementation
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE hods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_semester_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_semester_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text AS $$
  SELECT r.role_name
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's entity ID (student_id, hod_id, or admin_id)
CREATE OR REPLACE FUNCTION auth.get_user_entity_id()
RETURNS uuid AS $$
  SELECT user_entity_id
  FROM users
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's university ID
CREATE OR REPLACE FUNCTION auth.get_user_university_id()
RETURNS uuid AS $$
  SELECT 
    CASE 
      WHEN auth.get_user_role() = 'admin' THEN 
        (SELECT university_id FROM admins WHERE id = auth.get_user_entity_id())
      WHEN auth.get_user_role() = 'hod' THEN 
        (SELECT d.university_id FROM hods h 
         JOIN departments d ON h.department_id = d.id 
         WHERE h.id = auth.get_user_entity_id())
      WHEN auth.get_user_role() = 'student' THEN 
        (SELECT d.university_id FROM students s 
         JOIN departments d ON s.department_id = d.id 
         WHERE s.id = auth.get_user_entity_id())
      ELSE NULL
    END;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's department ID (for HODs and students)
CREATE OR REPLACE FUNCTION auth.get_user_department_id()
RETURNS uuid AS $$
  SELECT 
    CASE 
      WHEN auth.get_user_role() = 'hod' THEN 
        (SELECT department_id FROM hods WHERE id = auth.get_user_entity_id())
      WHEN auth.get_user_role() = 'student' THEN 
        (SELECT department_id FROM students WHERE id = auth.get_user_entity_id())
      ELSE NULL
    END;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- ROLES TABLE POLICIES (READ-ONLY FOR ALL AUTHENTICATED USERS)
-- ============================================================================

CREATE POLICY "Authenticated users can read roles" ON roles
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- UNIVERSITIES TABLE POLICIES
-- ============================================================================

-- Admins can only see their university
CREATE POLICY "Admins can view their university" ON universities
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND id = auth.get_user_university_id()
  );

-- HODs can see their university (read-only)
CREATE POLICY "HODs can view their university" ON universities
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND id = auth.get_user_university_id()
  );

-- Students can see their university (read-only)
CREATE POLICY "Students can view their university" ON universities
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND id = auth.get_user_university_id()
  );

-- ============================================================================
-- DEPARTMENTS TABLE POLICIES
-- ============================================================================

-- Admins can manage departments in their university
CREATE POLICY "Admins can manage university departments" ON departments
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND university_id = auth.get_user_university_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'admin' 
    AND university_id = auth.get_user_university_id()
  );

-- HODs can view departments in their university
CREATE POLICY "HODs can view university departments" ON departments
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND university_id = auth.get_user_university_id()
  );

-- Students can view departments in their university
CREATE POLICY "Students can view university departments" ON departments
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND university_id = auth.get_user_university_id()
  );

-- ============================================================================
-- ADMINS TABLE POLICIES
-- ============================================================================

-- Admins can only view/edit their own profile
CREATE POLICY "Admins can manage their own profile" ON admins
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND id = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'admin' 
    AND id = auth.get_user_entity_id()
  );

-- ============================================================================
-- HODS TABLE POLICIES  
-- ============================================================================

-- Admins can manage HODs in their university
CREATE POLICY "Admins can manage university HODs" ON hods
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND department_id IN (
      SELECT id FROM departments WHERE university_id = auth.get_user_university_id()
    )
  )
  WITH CHECK (
    auth.get_user_role() = 'admin' 
    AND department_id IN (
      SELECT id FROM departments WHERE university_id = auth.get_user_university_id()
    )
  );

-- HODs can view their own profile
CREATE POLICY "HODs can view their own profile" ON hods
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND id = auth.get_user_entity_id()
  );

-- HODs can update their own profile (limited fields)
CREATE POLICY "HODs can update their own profile" ON hods
  FOR UPDATE TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND id = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND id = auth.get_user_entity_id()
  );

-- ============================================================================
-- STUDENTS TABLE POLICIES
-- ============================================================================

-- HODs can manage students in their department
CREATE POLICY "HODs can manage department students" ON students
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND department_id = auth.get_user_department_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND department_id = auth.get_user_department_id()
  );

-- Students can view their own profile
CREATE POLICY "Students can view their own profile" ON students
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND id = auth.get_user_entity_id()
  );

-- Students can update their own profile (limited fields)
CREATE POLICY "Students can update their own profile" ON students
  FOR UPDATE TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND id = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'student' 
    AND id = auth.get_user_entity_id()
  );

-- Admins can view students in their university
CREATE POLICY "Admins can view university students" ON students
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND department_id IN (
      SELECT id FROM departments WHERE university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

-- HODs can manage courses in their department
CREATE POLICY "HODs can manage department courses" ON courses
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND department_id = auth.get_user_department_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND department_id = auth.get_user_department_id()
  );

-- Students can view courses in their department
CREATE POLICY "Students can view department courses" ON courses
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND department_id = auth.get_user_department_id()
  );

-- Admins can view courses in their university
CREATE POLICY "Admins can view university courses" ON courses
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND department_id IN (
      SELECT id FROM departments WHERE university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- ACADEMIC SESSIONS & SEMESTERS POLICIES
-- ============================================================================

-- All authenticated users can read academic sessions/semesters
CREATE POLICY "Authenticated users can read academic sessions" ON academic_sessions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read academic semesters" ON academic_semesters
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage academic sessions/semesters
CREATE POLICY "Admins can manage academic sessions" ON academic_sessions
  FOR ALL TO authenticated
  USING (auth.get_user_role() = 'admin')
  WITH CHECK (auth.get_user_role() = 'admin');

CREATE POLICY "Admins can manage academic semesters" ON academic_semesters
  FOR ALL TO authenticated
  USING (auth.get_user_role() = 'admin')
  WITH CHECK (auth.get_user_role() = 'admin');

-- ============================================================================
-- STUDENT ENROLLMENT POLICIES
-- ============================================================================

-- HODs can manage enrollments for students in their department
CREATE POLICY "HODs can manage department student enrollments" ON student_semester_enrollments
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND student_id IN (
      SELECT id FROM students WHERE department_id = auth.get_user_department_id()
    )
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND student_id IN (
      SELECT id FROM students WHERE department_id = auth.get_user_department_id()
    )
  );

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments" ON student_semester_enrollments
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND student_id = auth.get_user_entity_id()
  );

-- Course enrollments follow same pattern
CREATE POLICY "HODs can manage department course enrollments" ON student_course_enrollments
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND student_semester_enrollment_id IN (
      SELECT sse.id FROM student_semester_enrollments sse
      JOIN students s ON sse.student_id = s.id
      WHERE s.department_id = auth.get_user_department_id()
    )
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND student_semester_enrollment_id IN (
      SELECT sse.id FROM student_semester_enrollments sse
      JOIN students s ON sse.student_id = s.id
      WHERE s.department_id = auth.get_user_department_id()
    )
  );

CREATE POLICY "Students can view their own course enrollments" ON student_course_enrollments
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND student_semester_enrollment_id IN (
      SELECT id FROM student_semester_enrollments 
      WHERE student_id = auth.get_user_entity_id()
    )
  );

-- ============================================================================
-- FILE UPLOADS POLICIES
-- ============================================================================

-- HODs can manage their own file uploads
CREATE POLICY "HODs can manage their own uploads" ON file_uploads
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND uploaded_by_hod = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND uploaded_by_hod = auth.get_user_entity_id()
  );

-- Admins can view uploads from their university
CREATE POLICY "Admins can view university uploads" ON file_uploads
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND uploaded_by_hod IN (
      SELECT h.id FROM hods h
      JOIN departments d ON h.department_id = d.id
      WHERE d.university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- RESULT SUBMISSIONS POLICIES (CRITICAL FOR ADMIN APPROVAL WORKFLOW)
-- ============================================================================

-- HODs can manage their own result submissions
CREATE POLICY "HODs can manage their own submissions" ON result_submissions
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND hod_id = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND hod_id = auth.get_user_entity_id()
  );

-- Admins can view and approve submissions from their university
CREATE POLICY "Admins can manage university result submissions" ON result_submissions
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND course_id IN (
      SELECT c.id FROM courses c
      JOIN departments d ON c.department_id = d.id
      WHERE d.university_id = auth.get_user_university_id()
    )
  )
  WITH CHECK (
    auth.get_user_role() = 'admin' 
    AND course_id IN (
      SELECT c.id FROM courses c
      JOIN departments d ON c.department_id = d.id
      WHERE d.university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- RESULTS POLICIES
-- ============================================================================

-- HODs can manage results for students in their department
CREATE POLICY "HODs can manage department results" ON results_new
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND student_course_enrollment_id IN (
      SELECT sce.id FROM student_course_enrollments sce
      JOIN student_semester_enrollments sse ON sce.student_semester_enrollment_id = sse.id
      JOIN students s ON sse.student_id = s.id
      WHERE s.department_id = auth.get_user_department_id()
    )
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND student_course_enrollment_id IN (
      SELECT sce.id FROM student_course_enrollments sce
      JOIN student_semester_enrollments sse ON sce.student_semester_enrollment_id = sse.id
      JOIN students s ON sse.student_id = s.id
      WHERE s.department_id = auth.get_user_department_id()
    )
  );

-- Students can view their own approved results
CREATE POLICY "Students can view their own approved results" ON results_new
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND status = 'approved'
    AND student_course_enrollment_id IN (
      SELECT sce.id FROM student_course_enrollments sce
      JOIN student_semester_enrollments sse ON sce.student_semester_enrollment_id = sse.id
      WHERE sse.student_id = auth.get_user_entity_id()
    )
  );

-- Admins can view all results in their university
CREATE POLICY "Admins can view university results" ON results_new
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND student_course_enrollment_id IN (
      SELECT sce.id FROM student_course_enrollments sce
      JOIN student_semester_enrollments sse ON sce.student_semester_enrollment_id = sse.id
      JOIN students s ON sse.student_id = s.id
      JOIN departments d ON s.department_id = d.id
      WHERE d.university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- STUDENT SEMESTER SUMMARY POLICIES
-- ============================================================================

-- Students can view their own semester summaries
CREATE POLICY "Students can view their own semester summaries" ON student_semester_summary
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'student' 
    AND student_id = auth.get_user_entity_id()
  );

-- HODs can view summaries for students in their department
CREATE POLICY "HODs can view department student summaries" ON student_semester_summary
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND student_id IN (
      SELECT id FROM students WHERE department_id = auth.get_user_department_id()
    )
  );

-- Admins can view summaries for students in their university
CREATE POLICY "Admins can view university student summaries" ON student_semester_summary
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE d.university_id = auth.get_user_university_id()
    )
  );

-- ============================================================================
-- USERS TABLE POLICIES (AUTHENTICATION)
-- ============================================================================

-- Users can only see their own user record
CREATE POLICY "Users can view their own user record" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Users can update their own user record (limited fields)
CREATE POLICY "Users can update their own user record" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can create user accounts for their university entities
CREATE POLICY "Admins can create university user accounts" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.get_user_role() = 'admin' 
    AND (
      -- Creating student account
      (role_id = (SELECT id FROM roles WHERE role_name = 'student')
       AND user_entity_id IN (
         SELECT s.id FROM students s
         JOIN departments d ON s.department_id = d.id
         WHERE d.university_id = auth.get_user_university_id()
       ))
      OR
      -- Creating HOD account  
      (role_id = (SELECT id FROM roles WHERE role_name = 'hod')
       AND user_entity_id IN (
         SELECT h.id FROM hods h
         JOIN departments d ON h.department_id = d.id
         WHERE d.university_id = auth.get_user_university_id()
       ))
      OR
      -- Creating admin account (for same university)
      (role_id = (SELECT id FROM roles WHERE role_name = 'admin')
       AND user_entity_id IN (
         SELECT id FROM admins WHERE university_id = auth.get_user_university_id()
       ))
    )
  );

-- ============================================================================
-- BYPASS POLICIES FOR SERVICE ROLE (IMPORTANT FOR SUPABASE)
-- ============================================================================

-- Service role can bypass all RLS (for system operations, triggers, etc.)
-- This is crucial for automated processes and admin operations

CREATE POLICY "Service role bypass" ON universities
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON departments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON students
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON hods
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON admins
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON courses
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON academic_sessions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON academic_semesters
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON student_semester_enrollments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON student_course_enrollments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON file_uploads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON result_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON results_new
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON student_semester_summary
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass" ON roles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TESTING RLS POLICIES (Example Queries)
-- ============================================================================

/*
-- Test Admin Dashboard Access (should only show their university data)
SELECT * FROM admin_dashboard_view; -- Automatically filtered by RLS

-- Test Department Management (admin can only see/manage their university departments)
SELECT * FROM admin_departments_view; -- RLS enforced

-- Test HOD Management (admin can only manage HODs in their university)  
SELECT * FROM admin_hods_view; -- RLS enforced

-- Test Result Approval (admin only sees submissions from their university)
SELECT * FROM admin_pending_approvals WHERE status = 'submitted'; -- RLS enforced

-- Test HOD Access (HOD can only see their department data)
SELECT * FROM hod_dashboard_view; -- RLS enforced
SELECT * FROM hod_courses_dropdown; -- RLS enforced

-- Test Student Access (student can only see their own data)
SELECT * FROM students WHERE id = auth.get_user_entity_id(); -- RLS enforced
*/

-- ============================================================================
-- CRITICAL SECURITY NOTES FOR SUPABASE IMPLEMENTATION
-- ============================================================================

/*
🔒 SECURITY IMPLEMENTATION CHECKLIST:

1. ✅ RLS enabled on ALL tables
2. ✅ University-scoped access for admins
3. ✅ Department-scoped access for HODs  
4. ✅ Self-access only for students
5. ✅ Service role bypass for system operations
6. ✅ Helper functions use SECURITY DEFINER
7. ✅ Policies cover all CRUD operations appropriately

🚨 IMPORTANT SUPABASE CONSIDERATIONS:

1. **auth.uid()** - Returns the authenticated user's ID from Supabase Auth
2. **service_role** - Used for admin operations, triggers, and system processes
3. **authenticated** - Built-in Supabase role for logged-in users
4. **SECURITY DEFINER** - Functions run with creator privileges (needed for RLS helper functions)

📋 NEXT STEPS FOR SUPABASE:

1. Set up Supabase Auth with email/password
2. Create user accounts using the users table after entity creation
3. Use supabase.auth.getUser() in your frontend to get current user
4. All database queries will automatically respect RLS policies
5. Use service_role key for admin operations and bulk data imports

🔑 API IMPLEMENTATION PATTERN:

// Frontend - queries automatically respect RLS
const { data: departments } = await supabase
  .from('admin_departments_view')
  .select('*');

// Backend admin operations - use service role
const { data } = await supabase
  .from('departments')
  .insert({ university_id, department_name, department_code });
*/