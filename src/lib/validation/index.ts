// ============================================================
// VALIDATION SCHEMAS INDEX
// ============================================================
// Central export file for all Zod validation schemas
// ============================================================

// ============================================================
// PROFILE SCHEMAS
// ============================================================
export * from './profiles.schema';

// ============================================================
// DEPARTMENT SCHEMAS
// ============================================================
export * from './departments.schema';

// ============================================================
// GRADING POLICY SCHEMAS
// ============================================================
export * from './gradingPolicies.schema';

// ============================================================
// MARKSHEET COLUMN SCHEMAS
// ============================================================
export * from './marksheetColumns.schema';

// ============================================================
// STUDENT SCHEMAS
// ============================================================
export * from './students.schema';

// ============================================================
// COURSE SCHEMAS
// ============================================================
export * from './courses.schema';

// ============================================================
// RESULT SCHEMAS
// ============================================================
export * from './results.schema';

// ============================================================
// RESULT SUBMISSION SCHEMAS
// ============================================================
export * from './resultSubmissions.schema';

// ============================================================
// RPC PARAMETER SCHEMAS
// ============================================================
export * from './rpcParams.schema';

// ============================================================
// COMMON VALIDATION UTILITIES
// ============================================================

import { z } from 'zod';

// Common validation patterns
export const validationPatterns = {
  // UUID validation
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Email validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone number validation (international format)
  phone: /^\+?[1-9]\d{1,14}$/,
  
  // Matric number validation
  matricNumber: /^[A-Z]\/[A-Z]{2}\/\d{2}\/\d{7}$/,
  
  // Staff ID validation
  staffId: /^[A-Z]{2,3}\d{3,6}$/,
  
  // Course code validation
  courseCode: /^[A-Z]{2,4}\d{3,4}$/,
  
  // Department code validation
  departmentCode: /^[A-Z]{2,6}$/,
  
  // Session name validation
  sessionName: /^\d{4}\/\d{4}$/,
  
  // Grade validation
  grade: /^[A-F][+-]?$/,
  
  // File hash validation (SHA-256)
  fileHash: /^[a-fA-F0-9]{64}$/,
  
  // Setting key validation
  settingKey: /^[a-z_]+$/,
} as const;

// Common validation schemas
export const commonSchemas = {
  // UUID schema
  uuid: z.string().regex(validationPatterns.uuid, "Invalid UUID format"),
  
  // Email schema
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  
  // Phone number schema
  phone: z.string().regex(validationPatterns.phone, "Invalid phone number format").max(20, "Phone number too long"),
  
  // Matric number schema
  matricNumber: z.string()
    .min(5, "Matric number too short")
    .max(50, "Matric number too long")
    .regex(validationPatterns.matricNumber, "Invalid matric number format"),
  
  // Staff ID schema
  staffId: z.string()
    .min(3, "Staff ID too short")
    .max(50, "Staff ID too long")
    .regex(validationPatterns.staffId, "Invalid staff ID format"),
  
  // Course code schema
  courseCode: z.string()
    .min(3, "Course code too short")
    .max(20, "Course code too long")
    .regex(validationPatterns.courseCode, "Invalid course code format"),
  
  // Department code schema
  departmentCode: z.string()
    .min(2, "Department code too short")
    .max(20, "Department code too long")
    .regex(validationPatterns.departmentCode, "Invalid department code format"),
  
  // Session name schema
  sessionName: z.string()
    .min(4, "Session name too short")
    .max(20, "Session name too long")
    .regex(validationPatterns.sessionName, "Invalid session name format"),
  
  // Grade schema
  grade: z.string()
    .min(1, "Grade too short")
    .max(5, "Grade too long")
    .regex(validationPatterns.grade, "Invalid grade format"),
  
  // File hash schema
  fileHash: z.string()
    .length(64, "File hash must be exactly 64 characters")
    .regex(validationPatterns.fileHash, "Invalid file hash format"),
  
  // Setting key schema
  settingKey: z.string()
    .min(2, "Setting key too short")
    .max(100, "Setting key too long")
    .regex(validationPatterns.settingKey, "Invalid setting key format"),
  
  // Score schema (0-100)
  score: z.number()
    .int("Score must be an integer")
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  
  // Grade point schema (0-5)
  gradePoint: z.number()
    .min(0, "Grade point must be at least 0")
    .max(5, "Grade point must be at most 5")
    .multipleOf(0.01, "Grade point must have at most 2 decimal places"),
  
  // Unit schema (1-6)
  unit: z.number()
    .int("Unit must be an integer")
    .min(1, "Unit must be at least 1")
    .max(6, "Unit must be at most 6"),
  
  // Timestamp schema
  timestamp: z.string().datetime("Invalid timestamp format"),
  
  // URL schema
  url: z.string().url("Invalid URL format"),
  
  // File schema (for uploads)
  file: z.instanceof(File, { message: "File is required" }),
  
  // Pagination schema
  pagination: z.object({
    page: z.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
  }).strict(),
  
  // Search schema
  search: z.object({
    search: z.string().max(100, "Search term too long").optional(),
  }).strict(),
} as const;

// Common enums
export const commonEnums = {
  // User roles
  userRole: z.enum(["admin", "hod", "student"], {
    errorMap: () => ({ message: "Role must be admin, hod, or student" })
  }),
  
  // User status
  userStatus: z.enum(["active", "inactive", "suspended"], {
    errorMap: () => ({ message: "Status must be active, inactive, or suspended" })
  }),
  
  // Semester types
  semester: z.enum(["First", "Second", "Summer"], {
    errorMap: () => ({ message: "Semester must be First, Second, or Summer" })
  }),
  
  // Student levels
  studentLevel: z.enum(["100", "200", "300", "400", "500"], {
    errorMap: () => ({ message: "Level must be 100, 200, 300, 400, or 500" })
  }),
  
  // Result status
  resultStatus: z.enum(["pending", "approved", "rejected"], {
    errorMap: () => ({ message: "Status must be pending, approved, or rejected" })
  }),
  
  // Column types
  columnType: z.enum(["identifier", "score", "text", "number"], {
    errorMap: () => ({ message: "Type must be identifier, score, text, or number" })
  }),
  
  // Export formats
  exportFormat: z.enum(["pdf", "excel", "csv"], {
    errorMap: () => ({ message: "Format must be pdf, excel, or csv" })
  }),
} as const;

// ============================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================

/**
 * Validates data against a schema and returns a standardized error format
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[]>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format errors for frontend consumption
  const errors: Record<string, string[]> = {};
  
  for (const error of result.error.errors) {
    const path = error.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  }
  
  return { success: false, errors };
}

/**
 * Validates form data and returns field-specific errors
 */
export function validateFormData<T>(schema: z.ZodSchema<T>, formData: FormData): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[]>;
} {
  // Convert FormData to object
  const data: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle arrays (e.g., student_ids[])
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!data[arrayKey]) {
        data[arrayKey] = [];
      }
      data[arrayKey].push(value);
    } else {
      data[key] = value;
    }
  }
  
  return validateData(schema, data);
}

/**
 * Creates a validation error message for a specific field
 */
export function createFieldError(field: string, message: string): Record<string, string[]> {
  return { [field]: [message] };
}

/**
 * Merges multiple validation error objects
 */
export function mergeValidationErrors(...errorObjects: Record<string, string[]>[]): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  
  for (const errors of errorObjects) {
    for (const [field, messages] of Object.entries(errors)) {
      if (!merged[field]) {
        merged[field] = [];
      }
      merged[field].push(...messages);
    }
  }
  
  return merged;
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ValidationPatterns = typeof validationPatterns;
export type CommonSchemas = typeof commonSchemas;
export type CommonEnums = typeof commonEnums; 