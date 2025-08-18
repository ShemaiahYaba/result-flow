-- Check which users exist in your users table
SELECT email, user_entity_id FROM users ORDER BY email;

-- Check which HODs exist
SELECT email, staff_id FROM hods ORDER BY email;

-- Check which admins exist  
SELECT email, admin_id FROM admins ORDER BY email;

-- Check which students exist
SELECT email, matric_number FROM students ORDER BY email;

-- Check which Supabase Auth accounts exist
SELECT email FROM auth.users ORDER BY email;

-- See which emails from your list actually exist in the users table vs missing
SELECT 'EXISTS' as status, email FROM users
UNION ALL  
SELECT 'MISSING' as status, email FROM (
    VALUES 
    ('admin@unilag.edu.ng'),
    ('admin2@unilag.edu.ng'),
    ('admin@ui.edu.ng'),
    ('admin2@ui.edu.ng'),
    ('admin@oau.edu.ng'),
    ('admin2@oau.edu.ng'),
    ('hod.csc@unilag.edu.ng'),
    ('hod.mth@unilag.edu.ng'),
    ('hod.phy@unilag.edu.ng'),
    ('hod.csc@ui.edu.ng'),
    ('hod.mth@ui.edu.ng'),
    ('hod.mee@oau.edu.ng'),
    ('adebayo.johnson@student.unilag.edu.ng'),
    ('fatima.ibrahim@student.unilag.edu.ng'),
    ('chidi.okafor@student.unilag.edu.ng'),
    ('blessing.eze@student.unilag.edu.ng'),
    ('olumide.adebisi@student.unilag.edu.ng'),
    ('kemi.ogundipe@student.unilag.edu.ng'),
    ('segun.adesanya@student.ui.edu.ng'),
    ('amina.bello@student.ui.edu.ng'),
    ('tolu.adeyemi@student.oau.edu.ng'),
    ('funmi.ogunleye@student.oau.edu.ng')
) AS all_emails(email)
WHERE email NOT IN (SELECT email FROM users)
ORDER BY status, email;
