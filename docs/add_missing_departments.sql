-- Add missing departments that are referenced in HOD creation
-- Check which departments exist first
SELECT d.department_name, d.department_code, u.university_code 
FROM departments d 
JOIN universities u ON d.university_id = u.id 
ORDER BY u.university_code, d.department_code;

-- Add missing departments
INSERT INTO departments (university_id, department_name, department_code) 
SELECT (SELECT id FROM universities WHERE university_code = 'UI'), 'Mathematics', 'MTH'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'MTH' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'UI')
)
UNION ALL
SELECT (SELECT id FROM universities WHERE university_code = 'UI'), 'Physics', 'PHY'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'PHY' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'UI')
)
UNION ALL
SELECT (SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Physics', 'PHY'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'PHY' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'UNILAG')
)
UNION ALL
SELECT (SELECT id FROM universities WHERE university_code = 'OAU'), 'Computer Science', 'CSC'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'CSC' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'OAU')
)
UNION ALL
SELECT (SELECT id FROM universities WHERE university_code = 'OAU'), 'Mathematics', 'MTH'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'MTH' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'OAU')
);

-- Verify departments were created
SELECT d.department_name, d.department_code, u.university_code 
FROM departments d 
JOIN universities u ON d.university_id = u.id 
ORDER BY u.university_code, d.department_code;
