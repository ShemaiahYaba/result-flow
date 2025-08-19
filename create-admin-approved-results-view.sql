-- Create admin approved results view
-- This view shows approved result submissions scoped to each admin's university

CREATE OR REPLACE VIEW admin_approved_results AS
SELECT 
    rs.id as submission_id,
    d.department_name,
    c.course_code,
    c.course_title,
    c.course_code || ' - ' || c.course_title as course_info,
    rs.submitted_at,
    rs.reviewed_at,
    rs.status,
    rs.total_results,
    h.first_name || ' ' || COALESCE(h.middle_name || ' ', '') || h.last_name as submitted_by_hod,
    h.staff_id as hod_staff_id,
    rs.submission_notes,
    rs.review_notes,
    rs.reviewed_by_admin as reviewed_by_admin_id,
    ra.first_name || ' ' || COALESCE(ra.middle_name || ' ', '') || ra.last_name as reviewed_by_admin_name,
    a.id as admin_id,
    rs.course_id,
    rs.semester_id,
    rs.hod_id,
    rs.file_upload_id
FROM result_submissions rs
JOIN courses c ON rs.course_id = c.id
JOIN departments d ON c.department_id = d.id  
JOIN universities u ON d.university_id = u.id
JOIN hods h ON rs.hod_id = h.id
JOIN admins a ON u.id = a.university_id
LEFT JOIN admins ra ON rs.reviewed_by_admin = ra.id
WHERE a.is_active = true 
  AND rs.status = 'approved'
ORDER BY rs.reviewed_at DESC;
