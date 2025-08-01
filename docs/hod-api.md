# 📜 ResultFlow API Specification – HOD Module (v1)

## 1️⃣ Authentication

### POST /hod/login
Authenticate a HOD user using staff ID.

**Request Body:**
```json
{
  "staff_id": "HOD/CSC/2025",
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

### GET /hod/department
Fetch department details for the logged-in HOD.

**Response:**
```json
{
  "department_name": "Computer Science",
  "department_code": "CSC",
  "levels": [100, 200, 300, 400]
}
```

### GET /hod/registered-students
Fetch list of all registered students for the current session.

**Response:**
```json
[
  {
    "matric_number": "F/HD/21/1234567",
    "full_name": "Adewale Adekunle",
    "level": 200
  }
]
```

### GET /hod/departmental-courses
Fetch all departmental courses (across all levels).

**Response:**
```json
[
  {
    "course_code": "CSC101",
    "course_title": "Introduction to Computer Science",
    "unit": 3,
    "level": 100,
    "semester": "First"
  }
]
```

## 3️⃣ Data Uploads

### POST /hod/student-registry
Upload list of all registered students for the session.

**Request Body:** Multipart file upload (.xlsx or .csv) containing:

```csv
matric_number,full_name
F/HD/21/1234567,Adewale Adekunle
F/HD/21/1234568,Ngozi Okafor
```

**Response:**
```json
{
  "message": "Student registry uploaded successfully",
  "total_records": 50,
  "processed": 50,
  "failed": 0
}
```

### POST /hod/course-marksheet
Upload course-specific marksheet for a session.

**Request Body:** Multipart file upload (.xlsx or .csv) following admin-defined format:

```csv
matric_number,score
F/HD/21/1234567,75
F/HD/21/1234568,65
```

**Response:**
```json
{
  "message": "Course marksheet uploaded successfully",
  "course_code": "CSC101",
  "processed": 50,
  "failed": 2
}
```

## 4️⃣ Broadsheet Data

### GET /hod/broadsheet
Fetch broadsheet for a selected session, level, and semester.

**Query Parameters:**
```ini
session=2024/2025
semester=First
level=200
```

**Response:**
```json
{
  "department": "Computer Science",
  "session": "2024/2025",
  "semester": "First",
  "level": 200,
  "students": [
    {
      "matric_number": "F/HD/21/1234567",
      "full_name": "Adewale Adekunle",
      "courses": {
        "CSC101": 75,
        "CSC102": 80
      },
      "gpa": 4.50
    }
  ]
}
```

### GET /hod/broadsheet/download
Download broadsheet as a PDF or Excel file.

**Query Parameters:** same as `/hod/broadsheet`.

**Response:** Binary file (application/pdf or application/vnd.ms-excel).

## 5️⃣ Profile Management

### GET /hod/profile
Fetch HOD's profile information.

**Response:**
```json
{
  "fullname": "Dr. Chinedu Okeke",
  "email": "okeke@university.edu",
  "phone_number": "+2348100000000",
  "department": "Computer Science"
}
```

### POST /hod/profile
Update HOD profile details (except department).

**Request Body:**
```json
{
  "fullname": "Dr. Chinedu Okeke",
  "email": "okeke@university.edu",
  "phone_number": "+2348100000000"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### POST /hod/profile/password
Update password.

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

- All endpoints are protected and require a valid JWT from `/hod/login`.
- File uploads must conform to the admin-provided template to avoid parsing errors.
- `/hod/broadsheet` should support filtering by session, semester, level.
- `/hod/broadsheet/download` returns a binary file (PDF or Excel).