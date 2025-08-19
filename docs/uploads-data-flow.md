# Uploads Data Flow

This document describes the database side-effects, validation, and approval workflow triggered by upload endpoints for HODs.

Related routes:
- `src/app/api/hod/uploads/student-registry/route.ts`
- `src/app/api/hod/uploads/course-marksheet/route.ts`

Security and RLS reference:
- `docs/schema/schema-with-RLS.sql`

---

## Student Registry Upload

Endpoint: `POST /api/hod/uploads/student-registry`

- Input (form-data):
  - `file`: CSV
  - `semester_id`: uuid

- CSV required columns:
  - `matric_number`, `first_name`, `last_name`, `email`, `level`
  - Optional handled: `middle_name`, `phone_number`

- Access context:
  - HOD department resolved from `hods.id = user.user_entity_id` → `hods.department_id`.

- Records created/updated:
  - file_uploads (create)
    - Fields: `uploaded_by_hod`, `file_type: 'student_registry'`, `file_name`, `file_path`, `semester_id`, `total_records: 0`, `status: 'uploaded'`
    - Then update to `status: 'processing'`, set `total_records`.
  - students (upsert-by-lookup)
    - If `matric_number` exists → reuse `students.id`.
    - Else insert: `first_name`, `middle_name?`, `last_name`, `matric_number`, `email`, `phone_number?`, `department_id` (from HOD).
  - student_semester_enrollments (insert)
    - `student_id`, `semester_id`, `level` (parsed), `enrollment_status: 'registered'`.
    - Duplicate insert ignored via SQL state `23505`.
  - student_course_enrollments (insert, many)
    - For department courses at given `level`: insert `student_semester_enrollment_id`, `course_id`, `status: 'enrolled'`.
  - file_uploads (finalize)
    - Update: `processed_records`, `failed_records`, `status: 'completed' | 'failed'`, `error_details?`, `processed_at`.

- Validation:
  - Presence of required columns/fields. Basic parsing of `level` to number.

- RLS/Permissions (highlights):
  - HODs manage `students`, `student_semester_enrollments`, `student_course_enrollments`, and their own `file_uploads`.
  - Admins can read within their university scope.

---

## Course Marksheet Upload

Endpoint: `POST /api/hod/uploads/course-marksheet`

- Input (form-data):
  - `file`: CSV
  - `course_id`: uuid
  - `semester_id`: uuid

- CSV required columns:
  - `matric_number`, `score`, `grade`

- Pre-checks:
  - Verify HOD-course access via `hod_courses_dropdown` using `user.user_entity_id` and `course_id`.

- Records created/updated:
  - file_uploads (create)
    - Fields: `uploaded_by_hod`, `file_type: 'course_marksheet'`, `file_name`, `file_path`, `semester_id`, `course_id`, `total_records: 0`, `status: 'uploaded'`.
    - Then update to `status: 'processing'`, set `total_records`.
  - results_new (upsert per row)
    - Resolve identities:
      - `students` by `matric_number` → `students.id`.
      - `student_semester_enrollments` by `(student_id, semester_id)` → `id`.
      - `student_course_enrollments` by `(student_semester_enrollment_id, course_id)` → `id`.
    - Upsert fields: `student_course_enrollment_id`, `score` [0..100], `grade` [A..F] (uppercased), `status: 'draft'`.
  - file_uploads (finalize)
    - Update: `processed_records`, `failed_records`, `status: 'completed' | 'failed'`, `error_details?`, `processed_at`.
  - result_submissions (create on success)
    - Insert: `hod_id`, `file_upload_id`, `course_id`, `semester_id`, `total_results` (processed count), `status: 'submitted'`, `submission_notes`.
    - On success, bulk link all `results_new` for `course_id` + `semester_id` by updating:
      - `submission_id` to the created submission
      - `status: 'submitted'`
      - Filter: results whose `student_course_enrollment_id` is in enrollments for the course/semester.
    - Handles unique violation (`23505`) → prevents duplicate submissions per course/semester.

- Validation:
  - Required columns; `score` numeric 0–100; `grade` in {A..F}; student/course/semester enrollment existence.

- RLS/Permissions (highlights):
  - HODs manage department `results_new`, their `file_uploads`, and their `result_submissions`.
  - Admins read/approve submissions and view results across their university.

---

## Status Lifecycle

- file_uploads.status: `uploaded` → `processing` → `completed` | `failed`
- results_new.status: `draft` → after submission link set to `submitted` → later `approved` by admin workflow
- result_submissions.status: created as `submitted` → later transitions via admin approval flow

---

## Idempotency & Error Handling

- Student registry: duplicate semester enrollments tolerated (ignore `23505`).
- Marksheet results: `upsert` avoids duplicate per student-course enrollment.
- Errors captured in `file_uploads.error_details` as JSON array of per-row messages.

---

## Tables Touched (by endpoint)

- Student Registry:
  - `hods` (read department context)
  - `file_uploads` (create + updates)
  - `students` (select or insert)
  - `student_semester_enrollments` (insert)
  - `courses` (read by department + level)
  - `student_course_enrollments` (insert)

- Course Marksheet:
  - `hod_courses_dropdown` (read access check)
  - `file_uploads` (create + updates)
  - `students` (read by `matric_number`)
  - `student_semester_enrollments` (read)
  - `student_course_enrollments` (read)
  - `results_new` (upsert + later update to link submission)
  - `result_submissions` (insert)

---

## Notes

- Grading policies and marksheet column templates are defined in `docs/schema/add_grading_marksheet_tables.sql`. Current upload requires only `matric_number`, `score`, `grade`, but the schema supports richer column configurations per university.
- Students only see `results_new` with `status = 'approved'` per RLS policies.
