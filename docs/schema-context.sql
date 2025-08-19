-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_semesters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  semester_name text NOT NULL CHECK (semester_name = ANY (ARRAY['1st Semester'::text, '2nd Semester'::text])),
  semester_number integer NOT NULL CHECK (semester_number = ANY (ARRAY[1, 2])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_semesters_pkey PRIMARY KEY (id),
  CONSTRAINT academic_semesters_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id)
);
CREATE TABLE public.academic_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL,
  session_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT academic_sessions_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  admin_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  phone_number text,
  university_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.course_offerings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  instructor_id uuid,
  max_enrollment integer DEFAULT 50,
  current_enrollment integer DEFAULT 0,
  registration_open boolean DEFAULT true,
  registration_start_date timestamp with time zone,
  registration_end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_offerings_pkey PRIMARY KEY (id),
  CONSTRAINT course_offerings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_offerings_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.hods(id),
  CONSTRAINT course_offerings_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id)
);
CREATE TABLE public.course_registry_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hod_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  file_upload_id uuid,
  courses_added integer DEFAULT 0,
  courses_updated integer DEFAULT 0,
  status text DEFAULT 'processing'::text CHECK (status = ANY (ARRAY['processing'::text, 'completed'::text, 'failed'::text])),
  upload_summary jsonb,
  uploaded_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_registry_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT course_registry_uploads_file_upload_id_fkey FOREIGN KEY (file_upload_id) REFERENCES public.file_uploads(id),
  CONSTRAINT course_registry_uploads_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id),
  CONSTRAINT course_registry_uploads_hod_id_fkey FOREIGN KEY (hod_id) REFERENCES public.hods(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_code text NOT NULL UNIQUE,
  course_title text NOT NULL,
  course_unit integer NOT NULL CHECK (course_unit > 0),
  level integer NOT NULL CHECK (level = ANY (ARRAY[100, 200, 300, 400, 500])),
  semester text NOT NULL CHECK (semester = ANY (ARRAY['first'::text, 'second'::text])),
  department_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL,
  department_name text NOT NULL,
  department_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.file_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  uploaded_by_hod uuid NOT NULL,
  file_type text NOT NULL CHECK (file_type = ANY (ARRAY['student_registry'::text, 'course_marksheet'::text, 'course_registry'::text])),
  file_name text NOT NULL,
  file_path text NOT NULL,
  semester_id uuid NOT NULL,
  course_id uuid,
  total_records integer,
  processed_records integer DEFAULT 0,
  failed_records integer DEFAULT 0,
  status text DEFAULT 'uploaded'::text CHECK (status = ANY (ARRAY['uploaded'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  error_details jsonb,
  uploaded_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  upload_type text DEFAULT 'course_marksheet'::text CHECK (upload_type = ANY (ARRAY['student_registry'::text, 'course_marksheet'::text, 'course_registry'::text])),
  CONSTRAINT file_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT file_uploads_uploaded_by_hod_fkey FOREIGN KEY (uploaded_by_hod) REFERENCES public.hods(id),
  CONSTRAINT file_uploads_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT file_uploads_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id)
);
CREATE TABLE public.grading_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL,
  policy_name text NOT NULL,
  min_score integer NOT NULL CHECK (min_score >= 0 AND min_score <= 100),
  max_score integer NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
  grade text NOT NULL CHECK (grade = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'F'::text])),
  grade_point numeric NOT NULL CHECK (grade_point >= 0::numeric AND grade_point <= 5::numeric),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grading_policies_pkey PRIMARY KEY (id),
  CONSTRAINT grading_policies_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.hods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  staff_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  phone_number text,
  department_id uuid NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hods_pkey PRIMARY KEY (id),
  CONSTRAINT hods_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.marksheet_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL,
  column_name text NOT NULL,
  display_name text NOT NULL,
  column_type text NOT NULL CHECK (column_type = ANY (ARRAY['identifier'::text, 'score'::text, 'text'::text])),
  is_required boolean DEFAULT false,
  column_order integer NOT NULL DEFAULT 0,
  validation_rules jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT marksheet_columns_pkey PRIMARY KEY (id),
  CONSTRAINT marksheet_columns_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.result_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hod_id uuid NOT NULL,
  file_upload_id uuid NOT NULL,
  course_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  total_results integer NOT NULL,
  submission_notes text,
  status text DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY['submitted'::text, 'approved'::text, 'rejected'::text])),
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by_admin uuid,
  review_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT result_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT result_submissions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT result_submissions_reviewed_by_admin_fkey FOREIGN KEY (reviewed_by_admin) REFERENCES public.admins(id),
  CONSTRAINT result_submissions_hod_id_fkey FOREIGN KEY (hod_id) REFERENCES public.hods(id),
  CONSTRAINT result_submissions_file_upload_id_fkey FOREIGN KEY (file_upload_id) REFERENCES public.file_uploads(id),
  CONSTRAINT result_submissions_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id)
);
CREATE TABLE public.results_new (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_course_enrollment_id uuid NOT NULL UNIQUE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  grade text NOT NULL CHECK (grade = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'F'::text])),
  submission_id uuid,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT results_new_pkey PRIMARY KEY (id),
  CONSTRAINT results_new_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.result_submissions(id),
  CONSTRAINT results_new_student_course_enrollment_id_fkey FOREIGN KEY (student_course_enrollment_id) REFERENCES public.student_course_enrollments(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL UNIQUE CHECK (role_name = ANY (ARRAY['student'::text, 'hod'::text, 'admin'::text])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_semester_enrollment_id uuid NOT NULL,
  course_id uuid NOT NULL,
  enrollment_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'enrolled'::text CHECK (status = ANY (ARRAY['enrolled'::text, 'dropped'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT student_course_enrollments_student_semester_enrollment_id_fkey FOREIGN KEY (student_semester_enrollment_id) REFERENCES public.student_semester_enrollments(id),
  CONSTRAINT student_course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.student_semester_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  level integer NOT NULL CHECK (level = ANY (ARRAY[100, 200, 300, 400, 500])),
  enrollment_status text DEFAULT 'registered'::text CHECK (enrollment_status = ANY (ARRAY['registered'::text, 'withdrawn'::text, 'deferred'::text])),
  enrollment_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_semester_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT student_semester_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_semester_enrollments_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id)
);
CREATE TABLE public.student_semester_summary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  total_units_attempted integer DEFAULT 0,
  total_units_passed integer DEFAULT 0,
  total_grade_points numeric DEFAULT 0,
  semester_gpa numeric DEFAULT 0,
  cumulative_gpa numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_semester_summary_pkey PRIMARY KEY (id),
  CONSTRAINT student_semester_summary_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_semester_summary_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  matric_number text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  phone_number text,
  profile_photo_url text,
  department_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.universities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_name text NOT NULL UNIQUE,
  university_code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT universities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  role_id uuid NOT NULL,
  user_entity_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);