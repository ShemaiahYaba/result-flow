-- Add grading policies and marksheet columns tables to existing schema
-- These tables integrate with the university management system

-- ============================================================================
-- GRADING POLICIES TABLE (University-scoped)
-- ============================================================================

CREATE TABLE grading_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id uuid NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    policy_name text NOT NULL,
    min_score integer NOT NULL CHECK (min_score >= 0 AND min_score <= 100),
    max_score integer NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
    grade text NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
    grade_point numeric(3,2) NOT NULL CHECK (grade_point >= 0 AND grade_point <= 5),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure score ranges are valid
    CONSTRAINT valid_score_range CHECK (max_score >= min_score),
    -- Ensure no overlapping score ranges for same university
    UNIQUE(university_id, min_score, max_score)
);

-- ============================================================================
-- MARKSHEET COLUMNS TABLE (University-scoped)
-- ============================================================================

CREATE TABLE marksheet_columns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id uuid NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    column_name text NOT NULL,
    display_name text NOT NULL, -- User-friendly name for display
    column_type text NOT NULL CHECK (column_type IN ('identifier', 'score', 'text')),
    is_required boolean DEFAULT false,
    column_order integer NOT NULL DEFAULT 0, -- For ordering columns in marksheet
    validation_rules jsonb, -- Store validation rules as JSON
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure column names are unique per university
    UNIQUE(university_id, column_name),
    -- Ensure display names are unique per university
    UNIQUE(university_id, display_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Grading policies indexes
CREATE INDEX idx_grading_policies_university_id ON grading_policies(university_id);
CREATE INDEX idx_grading_policies_active ON grading_policies(is_active) WHERE is_active = true;
CREATE INDEX idx_grading_policies_score_range ON grading_policies(university_id, min_score, max_score);

-- Marksheet columns indexes
CREATE INDEX idx_marksheet_columns_university_id ON marksheet_columns(university_id);
CREATE INDEX idx_marksheet_columns_active ON marksheet_columns(is_active) WHERE is_active = true;
CREATE INDEX idx_marksheet_columns_order ON marksheet_columns(university_id, column_order);
CREATE INDEX idx_marksheet_columns_type ON marksheet_columns(column_type);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_grading_policies_updated_at 
    BEFORE UPDATE ON grading_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_marksheet_columns_updated_at 
    BEFORE UPDATE ON marksheet_columns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default grading policies for each university
INSERT INTO grading_policies (university_id, policy_name, min_score, max_score, grade, grade_point, description) VALUES 
-- UNILAG Grading Policy
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Distinction', 70, 100, 'A', 5.00, 'Distinction - Excellent Performance'),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Upper Credit', 60, 69, 'B', 4.00, 'Upper Credit - Very Good Performance'),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Lower Credit', 50, 59, 'C', 3.00, 'Lower Credit - Good Performance'),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Pass', 45, 49, 'D', 2.00, 'Pass - Satisfactory Performance'),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Compensatory Pass', 40, 44, 'E', 1.00, 'Compensatory Pass - Marginal Performance'),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Fail', 0, 39, 'F', 0.00, 'Fail - Unsatisfactory Performance'),

-- UI Grading Policy
((SELECT id FROM universities WHERE university_code = 'UI'), 'First Class', 70, 100, 'A', 5.00, 'First Class Honours'),
((SELECT id FROM universities WHERE university_code = 'UI'), 'Second Class Upper', 60, 69, 'B', 4.00, 'Second Class Honours (Upper Division)'),
((SELECT id FROM universities WHERE university_code = 'UI'), 'Second Class Lower', 50, 59, 'C', 3.00, 'Second Class Honours (Lower Division)'),
((SELECT id FROM universities WHERE university_code = 'UI'), 'Third Class', 45, 49, 'D', 2.00, 'Third Class Honours'),
((SELECT id FROM universities WHERE university_code = 'UI'), 'Pass', 40, 44, 'E', 1.00, 'Pass'),
((SELECT id FROM universities WHERE university_code = 'UI'), 'Fail', 0, 39, 'F', 0.00, 'Fail'),

-- OAU Grading Policy
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Excellent', 70, 100, 'A', 5.00, 'Excellent Performance'),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Very Good', 60, 69, 'B', 4.00, 'Very Good Performance'),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Good', 50, 59, 'C', 3.00, 'Good Performance'),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Fair', 45, 49, 'D', 2.00, 'Fair Performance'),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Poor', 40, 44, 'E', 1.00, 'Poor Performance'),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'Fail', 0, 39, 'F', 0.00, 'Fail');

-- Insert default marksheet columns for each university
INSERT INTO marksheet_columns (university_id, column_name, display_name, column_type, is_required, column_order) VALUES 
-- UNILAG Marksheet Columns
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'matric_number', 'Matric Number', 'identifier', true, 1),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'student_name', 'Student Name', 'text', true, 2),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'ca_score', 'CA Score', 'score', true, 3),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'exam_score', 'Exam Score', 'score', true, 4),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'total_score', 'Total Score', 'score', true, 5),
((SELECT id FROM universities WHERE university_code = 'UNILAG'), 'grade', 'Grade', 'text', true, 6),

-- UI Marksheet Columns
((SELECT id FROM universities WHERE university_code = 'UI'), 'matric_number', 'Matric Number', 'identifier', true, 1),
((SELECT id FROM universities WHERE university_code = 'UI'), 'student_name', 'Student Name', 'text', true, 2),
((SELECT id FROM universities WHERE university_code = 'UI'), 'continuous_assessment', 'Continuous Assessment', 'score', true, 3),
((SELECT id FROM universities WHERE university_code = 'UI'), 'examination', 'Examination', 'score', true, 4),
((SELECT id FROM universities WHERE university_code = 'UI'), 'total', 'Total', 'score', true, 5),
((SELECT id FROM universities WHERE university_code = 'UI'), 'grade', 'Grade', 'text', true, 6),

-- OAU Marksheet Columns
((SELECT id FROM universities WHERE university_code = 'OAU'), 'matric_number', 'Matric Number', 'identifier', true, 1),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'student_name', 'Student Name', 'text', true, 2),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'test_score', 'Test Score', 'score', true, 3),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'exam_score', 'Exam Score', 'score', true, 4),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'total_score', 'Total Score', 'score', true, 5),
((SELECT id FROM universities WHERE university_code = 'OAU'), 'letter_grade', 'Letter Grade', 'text', true, 6);

-- ============================================================================
-- ADMIN VIEWS FOR NEW TABLES
-- ============================================================================

-- Admin grading policies view (university-scoped)
CREATE OR REPLACE VIEW admin_grading_policies_view AS
SELECT 
    gp.id,
    gp.policy_name,
    gp.min_score,
    gp.max_score,
    gp.grade,
    gp.grade_point,
    gp.description,
    gp.is_active,
    gp.created_at,
    gp.updated_at,
    a.id as admin_id
FROM grading_policies gp
JOIN universities u ON gp.university_id = u.id
JOIN admins a ON u.id = a.university_id
WHERE a.is_active = true AND gp.is_active = true
ORDER BY gp.min_score DESC;

-- Admin marksheet columns view (university-scoped)
CREATE OR REPLACE VIEW admin_marksheet_columns_view AS
SELECT 
    mc.id,
    mc.column_name,
    mc.display_name,
    mc.column_type,
    mc.is_required,
    mc.column_order,
    mc.validation_rules,
    mc.is_active,
    mc.created_at,
    mc.updated_at,
    a.id as admin_id
FROM marksheet_columns mc
JOIN universities u ON mc.university_id = u.id
JOIN admins a ON u.id = a.university_id
WHERE a.is_active = true AND mc.is_active = true
ORDER BY mc.column_order;
