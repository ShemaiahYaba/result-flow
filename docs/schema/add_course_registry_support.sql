-- ============================================================================
-- ADD COURSE REGISTRY UPLOAD SUPPORT
-- Adds support for course registry uploads to the existing schema
-- ============================================================================

-- 1. Update file_uploads table to support course_registry file type
-- ============================================================================

-- Drop the existing constraint
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_file_type_check;

-- Add the new constraint with course_registry support
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_file_type_check 
    CHECK (file_type IN ('student_registry', 'course_marksheet', 'course_registry'));

-- 2. Create course_registry_uploads tracking table
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_registry_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hod_id uuid NOT NULL REFERENCES hods(id) ON DELETE CASCADE,
    semester_id uuid NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
    file_upload_id uuid NOT NULL REFERENCES file_uploads(id) ON DELETE CASCADE,
    courses_added integer DEFAULT 0,
    courses_updated integer DEFAULT 0,
    status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    upload_summary jsonb,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(file_upload_id)
);

-- Add indexes for course registry uploads
CREATE INDEX IF NOT EXISTS idx_course_registry_uploads_hod ON course_registry_uploads(hod_id, created_at);
CREATE INDEX IF NOT EXISTS idx_course_registry_uploads_semester ON course_registry_uploads(semester_id, status);
CREATE INDEX IF NOT EXISTS idx_course_registry_uploads_status ON course_registry_uploads(status, created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_registry_uploads_updated_at 
    BEFORE UPDATE ON course_registry_uploads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Add RLS policies for course_registry_uploads
-- ============================================================================

-- Enable RLS
ALTER TABLE course_registry_uploads ENABLE ROW LEVEL SECURITY;

-- HODs can manage their own course registry uploads
CREATE POLICY "HODs can manage their own course registry uploads" ON course_registry_uploads
  FOR ALL TO authenticated
  USING (
    auth.get_user_role() = 'hod' 
    AND hod_id = auth.get_user_entity_id()
  )
  WITH CHECK (
    auth.get_user_role() = 'hod' 
    AND hod_id = auth.get_user_entity_id()
  );

-- Admins can view course registry uploads from their university
CREATE POLICY "Admins can view university course registry uploads" ON course_registry_uploads
  FOR SELECT TO authenticated
  USING (
    auth.get_user_role() = 'admin' 
    AND EXISTS (
      SELECT 1 FROM hods h
      JOIN departments d ON h.department_id = d.id
      JOIN universities u ON d.university_id = u.id
      JOIN admins a ON u.id = a.university_id
      WHERE h.id = course_registry_uploads.hod_id
      AND a.id = auth.get_user_entity_id()
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass course registry uploads" ON course_registry_uploads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================

/*
CHANGES MADE:
✅ Updated file_uploads.file_type constraint to include 'course_registry'
✅ Created course_registry_uploads table for tracking course registry uploads
✅ Added proper indexes for performance
✅ Added RLS policies for security
✅ Added updated_at trigger

USAGE:
- HODs can now upload course registry CSV files
- System tracks course additions and updates separately
- Proper audit trail with upload summaries
- Secure access via RLS policies

NEXT STEPS:
1. Apply this migration to the database
2. Update the API route to use 'course_registry' file_type
3. Test the course registry upload functionality
*/
