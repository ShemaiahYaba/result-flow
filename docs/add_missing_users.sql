-- Add missing users to match your Supabase Auth accounts
-- Run check_missing_users.sql first to see exactly what's missing

-- Add missing admins (only if they don't already exist)
INSERT INTO admins (first_name, middle_name, last_name, admin_id, email, phone_number, university_id) 
SELECT 'Admin', 'Two', 'UNILAG', 'UNILAG-ADM002', 'admin2@unilag.edu.ng', '+234-800-ADM002', 
       (SELECT id FROM universities WHERE university_code = 'UNILAG')
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE admin_id = 'UNILAG-ADM002')
UNION ALL
SELECT 'Admin', 'Two', 'UI', 'UI-ADM002', 'admin2@ui.edu.ng', '+234-800-UI-ADM002', 
       (SELECT id FROM universities WHERE university_code = 'UI')
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE admin_id = 'UI-ADM002')
UNION ALL
SELECT 'Admin', 'Two', 'OAU', 'OAU-ADM002', 'admin2@oau.edu.ng', '+234-800-OAU-ADM002', 
       (SELECT id FROM universities WHERE university_code = 'OAU')
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE admin_id = 'OAU-ADM002');

-- Add missing HODs (only if they don't already exist)
INSERT INTO hods (first_name, middle_name, last_name, staff_id, email, phone_number, department_id) 
SELECT 'Dr. Physics', 'Head', 'UNILAG', 'UNILAG-HOD003', 'hod.phy@unilag.edu.ng', '+234-701-PHY-HOD',
       (SELECT id FROM departments WHERE department_code = 'PHY' AND university_id = (SELECT id FROM universities WHERE university_code = 'UNILAG'))
WHERE NOT EXISTS (SELECT 1 FROM hods WHERE staff_id = 'UNILAG-HOD003')
UNION ALL
SELECT 'Dr. Computer', 'Science', 'UI', 'UI-HOD001', 'hod.csc@ui.edu.ng', '+234-702-CSC-HOD',
       (SELECT id FROM departments WHERE department_code = 'CSC' AND university_id = (SELECT id FROM universities WHERE university_code = 'UI'))
WHERE NOT EXISTS (SELECT 1 FROM hods WHERE staff_id = 'UI-HOD001')
UNION ALL
SELECT 'Dr. Mathematics', 'Head', 'UI', 'UI-HOD002', 'hod.mth@ui.edu.ng', '+234-702-MTH-HOD',
       (SELECT id FROM departments WHERE department_code = 'MTH' AND university_id = (SELECT id FROM universities WHERE university_code = 'UI'))
WHERE NOT EXISTS (SELECT 1 FROM hods WHERE staff_id = 'UI-HOD002');

-- Add missing departments first (required for HODs)
-- Run add_missing_departments.sql before this file, or run these statements:

INSERT INTO departments (university_id, department_name, department_code) 
SELECT (SELECT id FROM universities WHERE university_code = 'UI'), 'Mathematics', 'MTH'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'MTH' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'UI')
)
UNION ALL
SELECT (SELECT id FROM universities WHERE university_code = 'UNILAG'), 'Physics', 'PHY'
WHERE NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE department_code = 'PHY' 
    AND university_id = (SELECT id FROM universities WHERE university_code = 'UNILAG')
);

-- Add missing students (check which departments exist first)
-- Note: You may need to add missing departments first if they don't exist

-- After adding missing users, update the users table (only if they don't already exist)
INSERT INTO users (email, role_id, user_entity_id, is_active) 
SELECT 'admin2@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'UNILAG-ADM002'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin2@unilag.edu.ng')
UNION ALL
SELECT 'admin2@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'UI-ADM002'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin2@ui.edu.ng')
UNION ALL
SELECT 'admin2@oau.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'OAU-ADM002'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin2@oau.edu.ng')
UNION ALL
SELECT 'hod.phy@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UNILAG-HOD003'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hod.phy@unilag.edu.ng')
UNION ALL
SELECT 'hod.csc@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UI-HOD001'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hod.csc@ui.edu.ng')
UNION ALL
SELECT 'hod.mth@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UI-HOD002'), true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hod.mth@ui.edu.ng');

-- Link all users to Supabase Auth
UPDATE users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = users.email)
WHERE auth_user_id IS NULL;

-- Verify everything is linked
SELECT 
    u.email,
    u.auth_user_id IS NOT NULL as has_auth_link,
    r.role_name,
    CASE 
        WHEN r.role_name = 'admin' THEN a.admin_id
        WHEN r.role_name = 'hod' THEN h.staff_id  
        WHEN r.role_name = 'student' THEN s.matric_number
    END as entity_identifier
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN admins a ON u.user_entity_id = a.id AND r.role_name = 'admin'
LEFT JOIN hods h ON u.user_entity_id = h.id AND r.role_name = 'hod'
LEFT JOIN students s ON u.user_entity_id = s.id AND r.role_name = 'student'
ORDER BY r.role_name, u.email;
