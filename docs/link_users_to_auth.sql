-- Step 2: Link existing users table records to Supabase Auth profiles
-- Run this AFTER populate_users_from_entities.sql

-- Update users table to link with Supabase Auth accounts
UPDATE users 
SET auth_user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = users.email
)
WHERE auth_user_id IS NULL;

-- Verify the linking worked
SELECT 
    'LINKED' as status,
    COUNT(*) as count
FROM users 
WHERE auth_user_id IS NOT NULL
UNION ALL
SELECT 
    'NOT_LINKED' as status,
    COUNT(*) as count
FROM users 
WHERE auth_user_id IS NULL;

-- Show detailed linking results
SELECT 
    u.email,
    u.auth_user_id IS NOT NULL as has_auth_link,
    au.email as auth_email,
    r.role_name,
    CASE 
        WHEN r.role_name = 'admin' THEN a.admin_id
        WHEN r.role_name = 'hod' THEN h.staff_id  
        WHEN r.role_name = 'student' THEN s.matric_number
    END as entity_identifier
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN auth.users au ON u.auth_user_id = au.id
LEFT JOIN admins a ON u.user_entity_id = a.id AND r.role_name = 'admin'
LEFT JOIN hods h ON u.user_entity_id = h.id AND r.role_name = 'hod'
LEFT JOIN students s ON u.user_entity_id = s.id AND r.role_name = 'student'
ORDER BY r.role_name, u.email;

-- Check for users without auth accounts (need to create these in Supabase)
SELECT 
    'MISSING_AUTH_ACCOUNT' as issue,
    u.email,
    r.role_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.auth_user_id IS NULL
ORDER BY r.role_name, u.email;
