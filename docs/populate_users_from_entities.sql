-- Step 1: Populate users table from existing entity tables
-- This script fetches data from admins, hods, and students tables and inserts into users table

-- Insert admin users from admins table
INSERT INTO users (email, role_id, user_entity_id, is_active)
SELECT 
    a.email,
    (SELECT id FROM roles WHERE role_name = 'admin'),
    a.id,
    a.is_active
FROM admins a
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = a.email);

-- Insert HOD users from hods table  
INSERT INTO users (email, role_id, user_entity_id, is_active)
SELECT 
    h.email,
    (SELECT id FROM roles WHERE role_name = 'hod'),
    h.id,
    h.is_active
FROM hods h
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = h.email);

-- Insert student users from students table
INSERT INTO users (email, role_id, user_entity_id, is_active)
SELECT 
    s.email,
    (SELECT id FROM roles WHERE role_name = 'student'),
    s.id,
    s.is_active
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = s.email);

-- Verify the insertions
SELECT 
    'SUMMARY' as type,
    r.role_name,
    COUNT(*) as user_count
FROM users u
JOIN roles r ON u.role_id = r.id
GROUP BY r.role_name
ORDER BY r.role_name;

-- Show detailed user list
SELECT 
    u.email,
    r.role_name,
    u.is_active,
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
