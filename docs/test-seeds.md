# Test Seed Data Documentation
## University Management System - Complete Test Dataset

This document provides comprehensive documentation of all seed data included in the updated university management system schema. The seed data is designed to enable robust testing of all system features including multi-university support, role-based access control, and academic workflows.

## Overview

The seed data includes:
- **3 Universities** with distinct codes and configurations
- **6 Departments** across multiple universities  
- **6 Academic Sessions** (2 per university) with semesters
- **6 Admins** (2 per university) with unique staff IDs
- **6 HODs** (2 per university) with unique staff IDs
- **10 Students** across different universities and departments
- **12 Courses** with university-specific course codes
- **9 User Accounts** for authentication testing
- **Sample Enrollments and Results** for workflow testing

## Universities

| University Code | University Name | Description |
|----------------|-----------------|-------------|
| UNILAG | University of Lagos | Primary test university with multiple departments |
| UI | University of Ibadan | Secondary test university for multi-tenant testing |
| OAU | Obafemi Awolowo University | Third university for comprehensive testing |

## Departments by University

### UNILAG Departments
- **Computer Science (CSC)** - Primary CS department
- **Mathematics (MTH)** - Mathematics department  
- **Physics (PHY)** - Physics department

### UI Departments
- **Computer Science (CSC)** - CS department at UI
- **Mathematics (MTH)** - Mathematics department at UI

### OAU Departments  
- **Mechanical Engineering (MEE)** - Engineering department

## Academic Sessions

Each university has current and previous academic sessions:

### UNILAG Sessions
- **2023/2024** (Sept 2023 - July 2024) - Previous session
- **2024/2025** (Sept 2024 - July 2025) - Current session

### UI Sessions
- **2023/2024** (Sept 2023 - July 2024) - Previous session  
- **2024/2025** (Sept 2024 - July 2025) - Current session

### OAU Sessions
- **2023/2024** (Sept 2023 - July 2024) - Previous session
- **2024/2025** (Sept 2024 - July 2025) - Current session

Each session includes both first and second semester records.

## Administrative Staff

### University Admins

| University | Admin ID | Name | Email |
|-----------|----------|------|-------|
| UNILAG | UNILAG-ADM001 | Dr. Adebayo Ogundimu | admin@unilag.edu.ng |
| UNILAG | UNILAG-ADM002 | Prof. Kemi Adeleke | admin2@unilag.edu.ng |
| UI | UI-ADM001 | Prof. Taiwo Adeyemi | admin@ui.edu.ng |
| UI | UI-ADM002 | Dr. Funmi Ogundipe | admin2@ui.edu.ng |
| OAU | OAU-ADM001 | Prof. Segun Adesanya | admin@oau.edu.ng |
| OAU | OAU-ADM002 | Dr. Bola Adebisi | admin2@oau.edu.ng |

### Heads of Department (HODs)

| University | Staff ID | Name | Department | Email |
|-----------|----------|------|------------|-------|
| UNILAG | UNILAG-HOD001 | Prof. Chidi Okafor | Computer Science | hod.csc@unilag.edu.ng |
| UNILAG | UNILAG-HOD002 | Dr. Fatima Ibrahim | Mathematics | hod.mth@unilag.edu.ng |
| UNILAG | UNILAG-HOD003 | Prof. Blessing Eze | Physics | hod.phy@unilag.edu.ng |
| UI | UI-HOD001 | Dr. Amina Bello | Computer Science | hod.csc@ui.edu.ng |
| UI | UI-HOD002 | Prof. Olumide Adebisi | Mathematics | hod.mth@ui.edu.ng |
| OAU | OAU-HOD001 | Prof. Tolu Adeyemi | Mechanical Engineering | hod.mee@oau.edu.ng |

## Students

### UNILAG Students

| Matric Number | Name | Department | Email | Level |
|--------------|------|------------|-------|-------|
| UNILAG/CSC/2021/001 | Adebayo Kunle Johnson | Computer Science | adebayo.johnson@student.unilag.edu.ng | 400 |
| UNILAG/CSC/2021/002 | Fatima Aisha Ibrahim | Computer Science | fatima.ibrahim@student.unilag.edu.ng | 400 |
| UNILAG/CSC/2020/001 | Chidi Emmanuel Okafor | Computer Science | chidi.okafor@student.unilag.edu.ng | 500 |
| UNILAG/MTH/2022/001 | Blessing Chioma Eze | Mathematics | blessing.eze@student.unilag.edu.ng | 300 |
| UNILAG/MTH/2021/001 | Olumide Tunde Adebisi | Mathematics | olumide.adebisi@student.unilag.edu.ng | 400 |
| UNILAG/PHY/2021/001 | Kemi Folake Ogundipe | Physics | kemi.ogundipe@student.unilag.edu.ng | 400 |

### UI Students

| Matric Number | Name | Department | Email | Level |
|--------------|------|------------|-------|-------|
| UI/CSC/2021/001 | Segun Ayo Adesanya | Computer Science | segun.adesanya@student.ui.edu.ng | 400 |
| UI/CSC/2020/001 | Amina Zainab Bello | Computer Science | amina.bello@student.ui.edu.ng | 500 |

### OAU Students

| Matric Number | Name | Department | Email | Level |
|--------------|------|------------|-------|-------|
| OAU/MEE/2021/001 | Tolu Seyi Adeyemi | Mechanical Engineering | tolu.adeyemi@student.oau.edu.ng | 400 |
| OAU/MEE/2020/001 | Funmi Bola Ogunleye | Mechanical Engineering | funmi.ogunleye@student.oau.edu.ng | 500 |

## Courses

### UNILAG Courses

| Course Code | Course Name | Credits | Level | Semester | Department |
|------------|-------------|---------|-------|----------|------------|
| UNILAG-CSC411 | Software Engineering | 3 | 400 | First | Computer Science |
| UNILAG-CSC301 | Data Structures | 3 | 300 | First | Computer Science |
| UNILAG-MTH301 | Real Analysis | 3 | 300 | First | Mathematics |
| UNILAG-MTH401 | Complex Analysis | 3 | 400 | First | Mathematics |
| UNILAG-PHY301 | Quantum Mechanics | 3 | 300 | First | Physics |
| UNILAG-PHY401 | Statistical Mechanics | 3 | 400 | First | Physics |

### UI Courses

| Course Code | Course Name | Credits | Level | Semester | Department |
|------------|-------------|---------|-------|----------|------------|
| UI-CSC411 | Compiler Design | 3 | 400 | First | Computer Science |
| UI-CSC301 | Database Systems | 3 | 300 | First | Computer Science |
| UI-MTH301 | Linear Algebra | 3 | 300 | First | Mathematics |
| UI-MTH401 | Differential Equations | 3 | 400 | First | Mathematics |

### OAU Courses

| Course Code | Course Name | Credits | Level | Semester | Department |
|------------|-------------|---------|-------|----------|------------|
| OAU-MEE301 | Thermodynamics | 3 | 300 | First | Mechanical Engineering |
| OAU-MEE401 | Machine Design | 3 | 400 | First | Mechanical Engineering |

## User Accounts for Authentication

The following user accounts are created for testing authentication and authorization:

### Admin Accounts
- **admin@unilag.edu.ng** - UNILAG Admin (ID: 11111111-1111-1111-1111-111111111111)
- **admin@ui.edu.ng** - UI Admin (ID: 22222222-2222-2222-2222-222222222222)  
- **admin@oau.edu.ng** - OAU Admin (ID: 33333333-3333-3333-3333-333333333333)

### HOD Accounts
- **hod.csc@unilag.edu.ng** - UNILAG CSC HOD (ID: 44444444-4444-4444-4444-444444444444)
- **hod.mth@unilag.edu.ng** - UNILAG MTH HOD (ID: 55555555-5555-5555-5555-555555555555)
- **hod.csc@ui.edu.ng** - UI CSC HOD (ID: 66666666-6666-6666-6666-666666666666)

### Student Accounts  
- **adebayo.johnson@student.unilag.edu.ng** - UNILAG CSC Student (ID: 77777777-7777-7777-7777-777777777777)
- **fatima.ibrahim@student.unilag.edu.ng** - UNILAG CSC Student (ID: 88888888-8888-8888-8888-888888888888)
- **segun.adesanya@student.ui.edu.ng** - UI CSC Student (ID: 99999999-9999-9999-9999-999999999999)

*Note: All passwords are hashed using bcrypt with the placeholder `$2b$10$hashedpassword[N]`*

## Sample Enrollments and Results

### Current Semester Enrollments (2024/2025 First Semester)

Students are enrolled in the current semester with the following course registrations:

- **Adebayo Johnson (UNILAG)** - Level 400, enrolled in UNILAG-CSC411 (Software Engineering)
- **Fatima Ibrahim (UNILAG)** - Level 400, enrolled in UNILAG-CSC411 (Software Engineering)  
- **Chidi Okafor (UNILAG)** - Level 500, enrolled in current semester
- **Segun Adesanya (UI)** - Level 400, enrolled in UI-CSC411 (Compiler Design)

### Sample Results

The following approved results are available for testing:

| Student | Course | Score | Grade | Status |
|---------|--------|-------|-------|--------|
| Adebayo Johnson | UNILAG-CSC411 (Software Engineering) | 85 | A | Approved |
| Fatima Ibrahim | UNILAG-CSC411 (Software Engineering) | 78 | B | Approved |
| Segun Adesanya | UI-CSC411 (Compiler Design) | 92 | A | Approved |

## Key Features Demonstrated

This seed data enables testing of:

1. **Multi-University Support** - Three distinct universities with separate data
2. **University-Specific Staff IDs** - Unique prefixed staff IDs per university
3. **University-Specific Academic Sessions** - Sessions scoped to each university
4. **University-Specific Course Codes** - Courses prefixed with university codes
5. **Role-Based Access Control** - Admin, HOD, and Student roles with proper scoping
6. **Cross-University Data Isolation** - RLS policies ensure data separation
7. **Academic Workflows** - Enrollment, course registration, and result management
8. **Authentication Integration** - User accounts linked to entity records

## Usage Notes

- All staff IDs and admin IDs are unique per university with university prefixes
- Academic sessions are university-specific to prevent cross-university data leakage
- Course codes include university prefixes to ensure uniqueness across the system
- Student matric numbers follow university-specific formats
- User account IDs are fixed UUIDs for consistent testing
- Results include approved grades for testing HOD approval workflows

This comprehensive seed data provides a robust foundation for testing all aspects of the multi-university management system.


