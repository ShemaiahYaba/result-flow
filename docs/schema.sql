-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_name text NOT NULL UNIQUE,
  start_date date,
  end_date date,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT academic_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  university_id uuid NOT NULL,
  role text DEFAULT 'admin'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id),
  CONSTRAINT admins_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_code text NOT NULL UNIQUE,
  course_title text NOT NULL,
  unit integer NOT NULL,
  level integer NOT NULL,
  semester text NOT NULL,
  department_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.department_heads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid,
  profile_id uuid,
  is_active boolean DEFAULT true,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  CONSTRAINT department_heads_pkey PRIMARY KEY (id),
  CONSTRAINT department_heads_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT department_heads_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_name text NOT NULL UNIQUE,
  department_code text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  university_id uuid,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id)
);
CREATE TABLE public.grading_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  min_score integer NOT NULL,
  max_score integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT grading_policies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  department_id uuid NOT NULL,
  university_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT hods_pkey PRIMARY KEY (id),
  CONSTRAINT hods_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT hods_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id),
  CONSTRAINT hods_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.marksheet_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  column_name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['identifier'::text, 'score'::text, 'text'::text])),
  required boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT marksheet_columns_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  fullname text,
  email text UNIQUE,
  phone_number text,
  department_id uuid,
  role text CHECK (role = ANY (ARRAY['admin'::text, 'hod'::text, 'student'::text])),
  created_at timestamp without time zone DEFAULT now(),
  first_name text,
  middle_name text,
  last_name text,
  matric_number text,
  university_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.result_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid,
  submitted_by uuid,
  session_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  total_records integer,
  processed_records integer,
  failed_records integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT result_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT result_submissions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id),
  CONSTRAINT result_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.profiles(id),
  CONSTRAINT result_submissions_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id uuid,
  course_id uuid,
  score integer NOT NULL,
  grade text,
  session_id uuid,
  submitted_by uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT results_pkey PRIMARY KEY (id),
  CONSTRAINT results_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.student_enrollments(id),
  CONSTRAINT results_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id),
  CONSTRAINT results_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.student_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id uuid,
  course_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT student_courses_pkey PRIMARY KEY (id),
  CONSTRAINT student_courses_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.student_enrollments(id),
  CONSTRAINT student_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.student_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  department_id uuid,
  session_id uuid,
  level integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT student_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT student_enrollments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT student_enrollments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT student_enrollments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.universities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  university_name text NOT NULL UNIQUE,
  university_code text UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT universities_pkey PRIMARY KEY (id)
);