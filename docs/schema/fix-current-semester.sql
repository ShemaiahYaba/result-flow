-- Fix for course registration button not working
-- Set a current semester to enable course registration

-- First, check if there are any semesters
SELECT COUNT(*) as total_semesters FROM academic_semesters;

-- Check if any semester is marked as current
SELECT COUNT(*) as current_semesters FROM academic_semesters WHERE is_current = true;

-- If no current semester exists, set the most recent one as current
-- Update the most recent semester to be current
UPDATE academic_semesters 
SET is_current = true 
WHERE id = (
    SELECT id 
    FROM academic_semesters 
    ORDER BY created_at DESC 
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM academic_semesters WHERE is_current = true
);

-- Verify the update
SELECT 
    id,
    semester_name,
    is_current,
    created_at
FROM academic_semesters 
ORDER BY created_at DESC;
