# 📜 ResultFlow API Specification – Admin Module (v1)

## 1️⃣ Authentication

### POST /admin/login
Authenticate an admin user.

**Request Body:**
```json
{
  "staff_id": "ADMIN/001",
  "password": "********"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "expires_in": 3600
}
```

## 2️⃣ Dashboard Data

### GET /admin/dashboard/stats
Fetch overall dashboard statistics.

**Response:**
```json
{
  "total_hods": 12,
  "courses_ready_for_upload": 35,
  "pending_approvals": 10
}
```

## 3️⃣ Departments Management

### POST /admin/departments
Add a new department.

**Request Body:**
```json
{
  "department_name": "Computer Science",
  "hod_name": "Dr. Chinedu Okeke"
}
```

**Response:**
```json
{
  "message": "Department added successfully"
}
```

### GET /admin/departments
Fetch list of departments and their HODs.

**Response:**
```json
[
  {
    "department_name": "Computer Science",
    "hod_name": "Dr. Chinedu Okeke"
  }
]
```

### POST /admin/departments/actions
Perform edit or delete action on a department.

**Request Body:**
```json
{
  "action": "edit",
  "department_id": 1,
  "department_name": "Computer Engineering",
  "hod_name": "Dr. Aisha Bello"
}
```

**Response:**
```json
{
  "message": "Department updated successfully"
}
```

## 4️⃣ Grading Policy Management

### GET /admin/grading-policy
Fetch all grading policies.

**Response:**
```json
[
  {
    "grade": "A",
    "min_score": 70,
    "max_score": 100
  }
]
```

### POST /admin/grading-policy/actions
Edit or delete an existing grade.

**Request Body:**
```json
{
  "action": "edit",
  "grade_id": 1,
  "grade": "B+",
  "min_score": 65,
  "max_score": 74
}
```

**Response:**
```json
{
  "message": "Grading policy updated successfully"
}
```

### POST /admin/grading-policy
Add a new grade rule.

**Request Body:**
```json
{
  "grade": "C",
  "min_score": 50,
  "max_score": 59
}
```

**Response:**
```json
{
  "message": "New grade added successfully"
}
```

## 5️⃣ Marksheet Format Configuration

### GET /admin/marksheet/columns
Fetch all configured marksheet columns.

**Response:**
```json
[
  {
    "column_name": "Matric No",
    "type": "identifier",
    "required": true
  },
  {
    "column_name": "Score",
    "type": "score",
    "required": true
  }
]
```

### POST /admin/marksheet/columns/actions
Edit or delete a marksheet column.

**Request Body:**
```json
{
  "action": "delete",
  "column_id": 2
}
```

**Response:**
```json
{
  "message": "Column deleted successfully"
}
```

### POST /admin/marksheet/columns
Add a new column to the marksheet format.

**Request Body:**
```json
{
  "column_name": "Course Title",
  "type": "text",
  "required": true
}
```

**Response:**
```json
{
  "message": "New column added successfully"
}
```

## 6️⃣ Results Approval Workflow

### GET /admin/result-submissions
Fetch all submitted departmental results awaiting approval.

**Response:**
```json
[
  {
    "submission_id": 101,
    "department": "Computer Science",
    "course": "CSC101 - Introduction to Computing",
    "submitted_date": "2025-06-01",
    "status": "Pending"
  }
]
```

### POST /admin/result-submissions/actions
View, approve, or reject a submitted result.

**Request Body:**
```json
{
  "action": "approve",
  "submission_id": 101
}
```

**Response:**
```json
{
  "message": "Result approved successfully"
}
```

## 7️⃣ Profile Management

### GET /admin/profile
Fetch admin profile information.

**Response:**
```json
{
  "fullname": "Prof. Akinwale Johnson",
  "email": "admin@university.edu",
  "phone_number": "+2348100000000"
}
```

### POST /admin/profile
Update admin profile details.

**Request Body:**
```json
{
  "fullname": "Prof. Akinwale Johnson",
  "email": "admin@university.edu",
  "phone_number": "+2348100000000"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### POST /admin/profile/password
Update admin password.

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

## ✅ Notes

- All Admin endpoints are protected with JWT authentication.
- Admin defines:
  - Department-HOD assignments
  - Grading policy
  - Marksheet format (which HOD uploads must follow)
  - Final approval/rejection of submitted departmental results.

