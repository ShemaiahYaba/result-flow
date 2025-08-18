-- First, get role IDs for reference
-- Run this to see your role IDs:
-- SELECT id, role_name FROM roles;

-- You'll need to replace these UUIDs with your actual role IDs from the roles table
-- Get them by running: SELECT id, role_name FROM roles ORDER BY role_name;

-- Example role IDs (replace with your actual ones):
-- SET @admin_role_id = 'your-admin-role-uuid';
-- SET @hod_role_id = 'your-hod-role-uuid'; 
-- SET @student_role_id = 'your-student-role-uuid';

-- INSERT University Admins (matching schema.sql test data)
INSERT INTO users (email, role_id, user_entity_id, is_active) VALUES
('admin@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'UNILAG-ADM001'), true),
('admin@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'UI-ADM001'), true),
('admin@oau.edu.ng', (SELECT id FROM roles WHERE role_name = 'admin'), (SELECT id FROM admins WHERE admin_id = 'OAU-ADM001'), true);

-- INSERT HODs (matching schema.sql test data)
INSERT INTO users (email, role_id, user_entity_id, is_active) VALUES
('hod.csc@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UNILAG-HOD001'), true),
('hod.mth@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UNILAG-HOD002'), true),
('hod.phy@unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UNILAG-HOD003'), true),
('hod.csc@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UI-HOD001'), true),
('hod.mth@ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'UI-HOD002'), true),
('hod.mee@oau.edu.ng', (SELECT id FROM roles WHERE role_name = 'hod'), (SELECT id FROM hods WHERE staff_id = 'OAU-HOD001'), true);

-- INSERT Students (matching schema.sql test data with correct matric numbers)
INSERT INTO users (email, role_id, user_entity_id, is_active) VALUES
('adebayo.johnson@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/CSC/2021/001'), true),
('fatima.ibrahim@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/CSC/2021/002'), true),
('chidi.okafor@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/CSC/2020/001'), true),
('blessing.eze@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/MTH/2022/001'), true),
('olumide.adebisi@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/MTH/2021/001'), true),
('kemi.ogundipe@student.unilag.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UNILAG/PHY/2021/001'), true),
('segun.adesanya@student.ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UI/CSC/2021/001'), true),
('amina.bello@student.ui.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'UI/CSC/2020/001'), true),
('tolu.adeyemi@student.oau.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'OAU/MEE/2021/001'), true),
('funmi.ogunleye@student.oau.edu.ng', (SELECT id FROM roles WHERE role_name = 'student'), (SELECT id FROM students WHERE matric_number = 'OAU/MEE/2020/001'), true);

-- Now link to Supabase Auth users
UPDATE users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = users.email)
WHERE auth_user_id IS NULL;

-- Verify the data was inserted and linked correctly
SELECT 
    u.email,
    u.auth_user_id,
    au.email as auth_email,
    r.role_name,
    CASE 
        WHEN r.role_name = 'admin' THEN a.admin_id
        WHEN r.role_name = 'hod' THEN h.staff_id  
        WHEN r.role_name = 'student' THEN s.matric_no
    END as entity_identifier
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN admins a ON u.user_entity_id = a.id AND r.role_name = 'admin'
LEFT JOIN hods h ON u.user_entity_id = h.id AND r.role_name = 'hod'
LEFT JOIN students s ON u.user_entity_id = s.id AND r.role_name = 'student'
ORDER BY r.role_name, u.email;

-- Check for any users that weren't linked to auth
SELECT email, auth_user_id 
FROM users 
WHERE auth_user_id IS NULL;
