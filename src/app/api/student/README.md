# Student API Documentation

This directory contains all Student API endpoints following the ResultFlow API specification.

## Authentication

All endpoints require JWT authentication with `student` role. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Base URL

```
/api/student
```

## Endpoints

### Profile Management

#### `GET /api/student/profile`
Fetch student's profile details.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "fullname": "John Doe",
    "email": "johndoe@email.com",
    "phone_number": "+2348100000000",
    "department": "Computer Science",
    "department_id": "uuid",
    "matric_number": "F/HD/21/1234567",
    "level": "200",
    "role": "student"
  }
}
```

#### `PATCH /api/student/profile`
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
  "ok": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

#### `POST /api/student/profile/password`
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
  "ok": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### Academic Records

#### `GET /api/student/results/current`
Fetch current semester results.

**Response:**
```json
{
  "ok": true,
  "data": {
    "semester": "2024/2025 - First Semester",
    "session": "2024/2025",
    "courses": [
      {
        "course_code": "MTH101",
        "course_title": "Calculus I",
        "unit": 3,
        "score": 85,
        "grade": "A",
        "grade_point": 5.0,
        "status": "approved"
      }
    ]
  }
}
```

#### `GET /api/student/results/past`
Fetch past academic session results.

**Response:**
```json
{
  "ok": true,
  "data": {
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
            "grade": "B+",
            "grade_point": 4.0,
            "status": "approved"
          }
        ]
      }
    ]
  }
}
```

#### `GET /api/student/results/gpa`
Fetch current semester GPA.

**Response:**
```json
{
  "ok": true,
  "data": {
    "semester": "2024/2025 - First Semester",
    "session": "2024/2025",
    "gpa": 4.50
  }
}
```

#### `GET /api/student/results/cgpa`
Fetch overall CGPA.

**Response:**
```json
{
  "ok": true,
  "data": {
    "cgpa": 4.35,
    "total_units": 45,
    "total_grade_points": 195.75
  }
}
```

#### `GET /api/student/results`
Fetch student results with filtering and pagination.

**Query Parameters:**
- `session_id` (optional): Filter by academic session UUID
- `semester` (optional): Filter by semester (`First`, `Second`, `Summer`)
- `course_id` (optional): Filter by course UUID
- `limit` (optional): Number of results per page (1-100, default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "course_code": "MTH101",
        "course_title": "Calculus I",
        "unit": 3,
        "score": 85,
        "grade": "A",
        "grade_point": 5.0,
        "status": "approved",
        "session_name": "2024/2025",
        "semester_name": "First",
        "created_at": "2024-08-17T22:53:58.000Z"
      }
    ],
    "meta": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Course Information

#### `GET /api/student/courses`
Fetch available courses with optional filters.

**Query Parameters:**
- `level` (optional): Filter by level (`100`, `200`, `300`, `400`, `500`)
- `semester` (optional): Filter by semester (`First`, `Second`, `Summer`)
- `session_id` (optional): Filter by academic session UUID
- `limit` (optional): Number of results per page (1-100, default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "course_code": "MTH101",
        "course_title": "Calculus I",
        "unit": 3,
        "level": "100",
        "semester": "First",
        "department_id": "uuid",
        "description": "Introduction to differential and integral calculus",
        "is_active": true
      }
    ],
    "meta": {
      "total": 15,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### `GET /api/student/enrollments`
Fetch student's course enrollments (current and history).

**Response:**
```json
{
  "ok": true,
  "data": {
    "current": [
      {
        "id": "uuid",
        "student_id": "uuid",
        "course_id": "uuid",
        "session_id": "uuid",
        "enrollment_date": "2024-08-01T00:00:00.000Z",
        "is_active": true,
        "course": {
          "id": "uuid",
          "course_code": "MTH101",
          "course_title": "Calculus I",
          "unit": 3,
          "level": "100",
          "semester": "First",
          "department_id": "uuid",
          "description": "Introduction to calculus",
          "is_active": true
        }
      }
    ],
    "history": [],
    "meta": {
      "current_count": 6,
      "history_count": 12
    }
  }
}
```

### Documents

#### `GET /api/student/transcript`
Download transcript (currently returns JSON, PDF generation to be implemented).

**Response:**
Returns transcript data as JSON with appropriate headers for download.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (development only)"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `AUTHENTICATION_ERROR` (401): Authentication required or invalid
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API endpoints are subject to rate limiting. Respect the rate limits to ensure consistent service availability.

## Data Security

- All endpoints enforce Row Level Security (RLS) through Supabase
- Students can only access their own data
- No sensitive information is exposed in error messages
- All inputs are validated using Zod schemas

## Development

### Adding New Endpoints

1. Create route handler in appropriate directory
2. Use `makeRoute` factory from `/src/lib/api/routeFactory.ts`
3. Define input/output schemas in `/src/schemas/student/api.ts`
4. Add documentation to this README
5. Create test cases

### Testing

Use the provided `.http` files in `/tests/api/student/` for manual testing with REST clients.
