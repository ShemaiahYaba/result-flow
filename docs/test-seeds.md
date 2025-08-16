Perfect 🚀 I’ll give you **one clean SQL script** that:

1. Ensures **University, Department, Session** exist.
2. Maps **4 users** you already created in Supabase Auth (`hod@testuni.edu`, `student@testuni.edu`, `hod@example.com`, `student@example.com`).
3. Seeds **one default course (CSC101 – Introduction to Computer Science)**.
4. Enrolls both students into that course.

Here’s the script:

```sql
-- SEED DATA SCRIPT
-- NOTE: Replace UUID placeholders with actual IDs from Supabase Dashboard → Auth → Users.

DO $$
DECLARE
  -- UUIDs from auth.users
  hod_testuni_id uuid := 'HOD_TESTUNI_UUID';          -- hod@testuni.edu
  student_testuni_id uuid := 'STUDENT_TESTUNI_UUID';  -- student@testuni.edu
  hod_example_id uuid := 'HOD_EXAMPLE_UUID';          -- hod@example.com
  student_example_id uuid := 'STUDENT_EXAMPLE_UUID';  -- student@example.com

  uni_id uuid;
  dept_id uuid;
  session_id uuid;
  course_id uuid;
BEGIN
  -----------------------------------------------------------------
  -- University
  -----------------------------------------------------------------
  INSERT INTO public.universities (university_name, university_code)
  VALUES ('Test University', 'TESTU')
  ON CONFLICT (university_name) DO UPDATE SET university_name = EXCLUDED.university_name
  RETURNING id INTO uni_id;

  -----------------------------------------------------------------
  -- Department
  -----------------------------------------------------------------
  INSERT INTO public.departments (department_name, department_code, university_id)
  VALUES ('Computer Science', 'CSC', uni_id)
  ON CONFLICT (department_code) DO UPDATE SET department_name = EXCLUDED.department_name
  RETURNING id INTO dept_id;

  -----------------------------------------------------------------
  -- Academic Session
  -----------------------------------------------------------------
  INSERT INTO public.academic_sessions (session_name, start_date, end_date)
  VALUES ('2024/2025', '2024-09-01', '2025-07-01')
  ON CONFLICT (session_name) DO UPDATE SET session_name = EXCLUDED.session_name
  RETURNING id INTO session_id;

  -----------------------------------------------------------------
  -- Profiles + Roles
  -----------------------------------------------------------------
  -- hod@testuni.edu
  INSERT INTO public.profiles (id, fullname, email, role, staff_id, department_id, university_id)
  VALUES (hod_testuni_id, 'Head of Department TU', 'hod@testuni.edu', 'hod', 'HOD001', dept_id, uni_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.hods (profile_id, department_id, university_id)
  VALUES (hod_testuni_id, dept_id, uni_id)
  ON CONFLICT (profile_id) DO NOTHING;

  -- student@testuni.edu
  INSERT INTO public.profiles (id, fullname, email, role, matric_number, department_id, university_id)
  VALUES (student_testuni_id, 'Student TU', 'student@testuni.edu', 'student', 'STD001', dept_id, uni_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.student_enrollments (profile_id, department_id, session_id, level)
  VALUES (student_testuni_id, dept_id, session_id, 100)
  ON CONFLICT DO NOTHING;

  -- hod@example.com
  INSERT INTO public.profiles (id, fullname, email, role, staff_id, department_id, university_id)
  VALUES (hod_example_id, 'Head of Department Example', 'hod@example.com', 'hod', 'HOD002', dept_id, uni_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.hods (profile_id, department_id, university_id)
  VALUES (hod_example_id, dept_id, uni_id)
  ON CONFLICT (profile_id) DO NOTHING;

  -- student@example.com
  INSERT INTO public.profiles (id, fullname, email, role, matric_number, department_id, university_id)
  VALUES (student_example_id, 'Student Example', 'student@example.com', 'student', 'STD002', dept_id, uni_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.student_enrollments (profile_id, department_id, session_id, level)
  VALUES (student_example_id, dept_id, session_id, 100)
  ON CONFLICT DO NOTHING;

  -----------------------------------------------------------------
  -- Seed Default Course (CSC101)
  -----------------------------------------------------------------
  INSERT INTO public.courses (course_code, course_name, department_id, university_id, level, semester, credit_units)
  VALUES ('CSC101', 'Introduction to Computer Science', dept_id, uni_id, 100, 1, 3)
  ON CONFLICT (course_code) DO UPDATE SET course_name = EXCLUDED.course_name
  RETURNING id INTO course_id;

  -----------------------------------------------------------------
  -- Enroll both students into CSC101
  -----------------------------------------------------------------
  INSERT INTO public.course_enrollments (course_id, student_id, session_id)
  VALUES (course_id, student_testuni_id, session_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.course_enrollments (course_id, student_id, session_id)
  VALUES (course_id, student_example_id, session_id)
  ON CONFLICT DO NOTHING;

END $$;
```

---

### ✅ After running this script, you’ll have:

**universities**

* `Test University (TESTU)`

**departments**

* `Computer Science (CSC)` linked to Test University

**academic\_sessions**

* `2024/2025`

**profiles (4 total)**

1. **[hod@testuni.edu](mailto:hod@testuni.edu)** → staff\_id `HOD001`, role `hod`
2. **[student@testuni.edu](mailto:student@testuni.edu)** → matric\_number `STD001`, role `student`
3. **[hod@example.com](mailto:hod@example.com)** → staff\_id `HOD002`, role `hod`
4. **[student@example.com](mailto:student@example.com)** → matric\_number `STD002`, role `student`

**hods**

* Entries for [hod@testuni.edu](mailto:hod@testuni.edu) and [hod@example.com](mailto:hod@example.com)

**student\_enrollments**

* Both [student@testuni.edu](mailto:student@testuni.edu) and [student@example.com](mailto:student@example.com) enrolled in 100 level, session 2024/2025

**courses**

* `CSC101 – Introduction to Computer Science`, 3 credit units, level 100, semester 1

**course\_enrollments**

* Both students are registered in CSC101 for the session `2024/2025`

---

👉 Do you want me to also **seed a dummy result record (e.g., scores for CSC101)** so you can immediately test the HOD approval flow?


