# 📜 ResultFlow API Specification – Supabase Implementation (v1)

## Overview

This document restructures the ResultFlow API specification based on Supabase's out-of-the-box capabilities. APIs are categorized as either **Supabase Native** (auto-generated) or **Custom Functions** (requiring manual implementation).

---

## 🔐 Authentication & Authorization

### ✅ Supabase Auto REST

**Supabase Auth handles all authentication automatically:**

- **POST** `/auth/v1/token?grant_type=password` - Login
- **POST** `/auth/v1/logout` - Logout  
- **POST** `/auth/v1/refresh` - Refresh token
- **GET** `/auth/v1/user` - Get current user

**Tables needed:**
- `auth.users` (managed by Supabase)
- `profiles` (extends auth.users)

---

## 👤 Profile Management

### ✅ Supabase Auto REST

**All profile operations use standard REST endpoints:**

- **GET** `/rest/v1/profiles?select=*&id=eq.{user_id}` - Get profile
- **PATCH** `/rest/v1/profiles?id=eq.{user_id}` - Update profile
- **POST** `/rest/v1/profiles` - Create profile (on signup)

**Table: `profiles`**
```sql
profiles (
  id uuid references auth.users(id),
  fullname text,
  email text,
  phone_number text,
  department text,
  role text check (role in ('admin', 'hod', 'student')),
  created_at timestamp default now()
)
```

### ⚠️ Custom Function Required

**Password Update:**
- **POST** `/rpc/update_password` - Update user password
- **Type:** SQL RPC Function

---

## 🏢 Departments Management (Admin Only)

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/departments?select=*` - List departments
- **POST** `/rest/v1/departments` - Create department
- **PATCH** `/rest/v1/departments?id=eq.{id}` - Update department
- **DELETE** `/rest/v1/departments?id=eq.{id}` - Delete department

**Table: `departments`**
```sql
departments (
  id uuid default gen_random_uuid() primary key,
  department_name text unique not null,
  department_code text unique not null,
  hod_id uuid references profiles(id),
  created_at timestamp default now()
)
```

---

## 📊 Grading Policy Management (Admin Only)

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/grading_policies?select=*` - List grading policies
- **POST** `/rest/v1/grading_policies` - Create grading policy
- **PATCH** `/rest/v1/grading_policies?id=eq.{id}` - Update grading policy
- **DELETE** `/rest/v1/grading_policies?id=eq.{id}` - Delete grading policy

**Table: `grading_policies`**
```sql
grading_policies (
  id uuid default gen_random_uuid() primary key,
  grade text not null,
  min_score integer not null,
  max_score integer not null,
  created_at timestamp default now()
)
```

---

## 📋 Marksheet Format Configuration (Admin Only)

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/marksheet_columns?select=*` - List columns
- **POST** `/rest/v1/marksheet_columns` - Add column
- **PATCH** `/rest/v1/marksheet_columns?id=eq.{id}` - Update column
- **DELETE** `/rest/v1/marksheet_columns?id=eq.{id}` - Delete column

**Table: `marksheet_columns`**
```sql
marksheet_columns (
  id uuid default gen_random_uuid() primary key,
  column_name text not null,
  type text not null check (type in ('identifier', 'score', 'text')),
  required boolean default false,
  created_at timestamp default now()
)
```

---

## 👥 Student Registry (HOD Only)

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/students?select=*&department=eq.{department}` - List students
- **POST** `/rest/v1/students` - Add student
- **PATCH** `/rest/v1/students?matric_number=eq.{matric_number}` - Update student
- **DELETE** `/rest/v1/students?matric_number=eq.{matric_number}` - Delete student

**Table: `students`**
```sql
students (
  id uuid default gen_random_uuid() primary key,
  matric_number text unique not null,
  full_name text not null,
  level integer not null,
  department text not null,
  session text not null,
  created_at timestamp default now()
)
```

### ⚠️ Custom Function Required

**Bulk Upload:**
- **POST** `/rpc/bulk_upload_students` - Upload CSV/Excel file
- **Type:** Edge Function (handles file parsing)

---

## 📚 Course Management (HOD Only)

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/courses?select=*&department=eq.{department}` - List courses
- **POST** `/rest/v1/courses` - Add course
- **PATCH** `/rest/v1/courses?id=eq.{id}` - Update course
- **DELETE** `/rest/v1/courses?id=eq.{id}` - Delete course

**Table: `courses`**
```sql
courses (
  id uuid default gen_random_uuid() primary key,
  course_code text unique not null,
  course_title text not null,
  unit integer not null,
  level integer not null,
  semester text not null,
  department text not null,
  created_at timestamp default now()
)
```

---

## 📊 Results Management

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/results?select=*&student_id=eq.{student_id}` - Get student results
- **POST** `/rest/v1/results` - Add result
- **PATCH** `/rest/v1/results?id=eq.{id}` - Update result
- **DELETE** `/rest/v1/results?id=eq.{id}` - Delete result

**Table: `results`**
```sql
results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  course_id uuid references courses(id),
  score integer not null,
  grade text,
  session text not null,
  semester text not null,
  submitted_by uuid references profiles(id),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp default now()
)
```

### ⚠️ Custom Function Required

**Bulk Upload Results:**
- **POST** `/rpc/bulk_upload_results` - Upload marksheet
- **Type:** Edge Function (handles file parsing and validation)

**Calculate GPA/CGPA:**
- **GET** `/rpc/calculate_gpa?student_id={id}&session={session}&semester={semester}` - Calculate GPA
- **GET** `/rpc/calculate_cgpa?student_id={id}` - Calculate CGPA
- **Type:** SQL RPC Functions

---

## 📈 Dashboard Statistics

### ⚠️ Custom Function Required

**Admin Dashboard:**
- **GET** `/rpc/admin_dashboard_stats` - Get admin statistics
- **Type:** SQL RPC Function

**HOD Dashboard:**
- **GET** `/rpc/hod_dashboard_stats?department={department}` - Get HOD statistics
- **Type:** SQL RPC Function

---

## 📄 Broadsheet Generation

### ⚠️ Custom Function Required

**Generate Broadsheet:**
- **GET** `/rpc/generate_broadsheet?session={session}&semester={semester}&level={level}&department={department}` - Generate broadsheet data
- **Type:** SQL RPC Function

**Download Broadsheet:**
- **GET** `/rpc/download_broadsheet?session={session}&semester={semester}&level={level}&department={department}&format={pdf|excel}` - Download as PDF/Excel
- **Type:** Edge Function (handles file generation)

---

## 📋 Results Approval Workflow

### ✅ Supabase Auto REST

**Standard CRUD operations:**

- **GET** `/rest/v1/result_submissions?select=*&status=eq.pending` - List pending submissions
- **PATCH** `/rest/v1/result_submissions?id=eq.{id}` - Update submission status

**Table: `result_submissions`**
```sql
result_submissions (
  id uuid default gen_random_uuid() primary key,
  department text not null,
  course_id uuid references courses(id),
  submitted_by uuid references profiles(id),
  submitted_date timestamp default now(),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references profiles(id),
  approved_at timestamp,
  created_at timestamp default now()
)
```

---

## 📄 Transcript Generation

### ⚠️ Custom Function Required

**Generate Transcript:**
- **GET** `/rpc/generate_transcript?student_id={id}&format=pdf` - Generate PDF transcript
- **Type:** Edge Function (handles PDF generation)

---

## 🔒 Row Level Security (RLS) Policies

### Required RLS Policies:

```sql
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students: HODs can only access their department's students
CREATE POLICY "HODs can access department students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.department = students.department
      AND profiles.role = 'hod'
    )
  );

-- Results: Students can only view their own results
CREATE POLICY "Students can view own results" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = results.student_id 
      AND students.matric_number = (
        SELECT matric_number FROM profiles WHERE profiles.id = auth.uid()
      )
    )
  );

-- Admin policies for all tables
CREATE POLICY "Admins can access all" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

---

## 📊 Summary

### ✅ Supabase Native Endpoints (Auto-generated): 85%
- Authentication & Authorization
- Profile Management
- Departments Management
- Grading Policy Management
- Marksheet Format Configuration
- Student Registry (CRUD)
- Course Management
- Results Management (CRUD)
- Results Approval Workflow

### ⚠️ Custom Functions Required: 15%

**Edge Functions (File Processing):**
- Bulk upload students from CSV/Excel
- Bulk upload results from marksheet
- Download broadsheet as PDF/Excel
- Generate transcript PDF

**SQL RPC Functions (Complex Queries):**
- Update password
- Calculate GPA/CGPA
- Admin dashboard statistics
- HOD dashboard statistics
- Generate broadsheet data

---

## 🚀 Implementation Priority

1. **Phase 1:** Set up Supabase project and create all tables
2. **Phase 2:** Implement RLS policies
3. **Phase 3:** Create SQL RPC functions for calculations
4. **Phase 4:** Create Edge Functions for file processing
5. **Phase 5:** Test all endpoints and security

This structure leverages Supabase's strengths while keeping custom development minimal and focused on business logic. 