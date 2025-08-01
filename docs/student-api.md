# 📜 ResultFlow API Specification – Student Module (v1)

## 1️⃣ Authentication

### POST /students/login
Authenticate a student user using matriculation number.

**Request Body:**
```json
{
  "matric_number": "F/HD/21/1234567",
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

## 2️⃣ Profile Management

### GET /students/profile
Fetch student's profile details.

**Response:**
```json
{
  "fullname": "John Doe",
  "email": "johndoe@email.com",
  "phone_number": "+2348100000000",
  "department": "Computer Science"
}
```

### POST /students/profile
Update student's profile information.

**Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "john.doe@email.com",
  "phone_number": "+2348100000000"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### POST /students/profile/password
Update student's password.

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

## 3️⃣ Results and Academic Records

### GET /students/results/current
Fetch current semester results.

**Response:**
```json
{
  "semester": "2024/2025 - First Semester",
  "courses": [
    {
      "course_code": "MTH101",
      "course_title": "Calculus I",
      "unit": 3,
      "score": 85,
      "grade": "A"
    }
  ]
}
```

### GET /students/results/gpa
Fetch current semester GPA.

**Response:**
```json
{
  "semester": "2024/2025 - First Semester",
  "gpa": 4.50
}
```

### GET /students/results/cgpa
Fetch overall CGPA.

**Response:**
```json
{
  "cgpa": 4.35
}
```

### GET /students/results/past
Fetch past academic session results.

**Response:**
```json
{
  "sessions": [
    {
      "session": "2023/2024",
      "semester": "Second Semester",
      "gpa": 4.20,
      "courses": [
        {
          "course_code": "PHY102",
          "course_title": "Physics II",
          "unit": 3,
          "score": 76,
          "grade": "B+"
        }
      ]
    }
  ]
}
```

### GET /students/transcript
Download transcript as PDF.

**Response:**
Binary PDF file (with Content-Type: application/pdf).

## ✅ Notes

- All endpoints require JWT Authentication after login.
- `department` field in `/students/profile` is read-only.
- Endpoints follow REST naming conventions (GET for retrieval, POST for updates).

