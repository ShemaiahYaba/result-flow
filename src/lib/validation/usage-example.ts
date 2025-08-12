// ============================================================
// VALIDATION SCHEMAS USAGE EXAMPLES
// ============================================================
// This file demonstrates how to use the Zod validation schemas
// ============================================================

import {
  // Profile schemas
  profileSchema,
  createProfileSchema,
  updateProfileSchema,
  profileLoginSchema,
  passwordUpdateSchema,
  studentProfileSchema,
  staffProfileSchema,
  
  // Department schemas
  departmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  
  // Grading policy schemas
  gradingPolicySchema,
  createGradingPolicySchema,
  bulkGradingPolicySchema,
  
  // Student schemas
  studentSchema,
  createStudentSchema,
  bulkStudentSchema,
  studentImportSchema,
  
  // Course schemas
  courseSchema,
  createCourseSchema,
  bulkCourseSchema,
  
  // Result schemas
  resultSchema,
  createResultSchema,
  bulkResultSchema,
  resultApprovalSchema,
  
  // Result submission schemas
  resultSubmissionSchema,
  createResultSubmissionSchema,
  resultSubmissionApprovalSchema,
  resultSubmissionFileSchema,
  
  // RPC parameter schemas
  broadsheetGenerationSchema,
  transcriptGenerationSchema,
  gpaCalculationSchema,
  cgpaCalculationSchema,
  
  // Helper functions
  validateData,
  validateFormData,
  createFieldError,
  mergeValidationErrors,
  
  // Common schemas
  commonSchemas,
  commonEnums,
} from './index';

// ============================================================
// EXAMPLE 1: FORM VALIDATION
// ============================================================

export function validateLoginForm(formData: FormData) {
  const result = validateFormData(profileLoginSchema, formData);
  
  if (!result.success) {
    // Handle validation errors
    console.error('Login validation failed:', result.errors);
    return { success: false, errors: result.errors };
  }
  
  // Data is valid, proceed with login
  return { success: true, data: result.data };
}

// ============================================================
// EXAMPLE 2: API REQUEST VALIDATION
// ============================================================

export function validateCreateStudentRequest(data: unknown) {
  const result = validateData(createStudentSchema, data);
  
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  
  return { success: true, data: result.data };
}

// ============================================================
// EXAMPLE 3: BULK DATA VALIDATION
// ============================================================

export function validateBulkStudentImport(data: unknown) {
  const result = validateData(bulkStudentSchema, data);
  
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  
  return { success: true, data: result.data };
}

// ============================================================
// EXAMPLE 4: RPC PARAMETER VALIDATION
// ============================================================

export function validateBroadsheetGeneration(params: unknown) {
  const result = validateData(broadsheetGenerationSchema, params);
  
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  
  return { success: true, data: result.data };
}

// ============================================================
// EXAMPLE 5: FILE UPLOAD VALIDATION
// ============================================================

export function validateResultSubmissionFile(file: File, metadata: unknown) {
  // Validate file
  const fileResult = validateData(commonSchemas.file, file);
  if (!fileResult.success) {
    return { success: false, errors: fileResult.errors };
  }
  
  // Validate metadata
  let metadataObj: Record<string, unknown>;
  if (typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)) {
    metadataObj = metadata as Record<string, unknown>;
  } else {
    metadataObj = {};
  }

  const metadataResult = validateData(resultSubmissionFileSchema, {
    file,
    ...metadataObj
  });

  if (!metadataResult.success) {
    return { success: false, errors: metadataResult.errors };
  }
  
  return { success: true, data: metadataResult.data };
}

// ============================================================
// EXAMPLE 6: COMPLEX VALIDATION WITH CUSTOM RULES
// ============================================================

export function validateStudentWithCustomRules(data: unknown) {
  // First, validate basic student data
  const basicResult = validateData(createStudentSchema, data);
  if (!basicResult.success) {
    return { success: false, errors: basicResult.errors };
  }
  
  // Add custom business logic validation
  const student = basicResult.data;
  
  // Custom validation: Check if matric number is unique
  // This would typically involve a database check
  const matricNumberExists = false; // Simulate database check
  
  if (matricNumberExists) {
    return {
      success: false,
      errors: createFieldError('matric_number', 'Matric number already exists')
    };
  }
  
  // Custom validation: Check if department exists
  const departmentExists = true; // Simulate database check
  
  if (!departmentExists) {
    return {
      success: false,
      errors: createFieldError('department_id', 'Department does not exist')
    };
  }
  
  return { success: true, data: student };
}

// ============================================================
// EXAMPLE 7: CONDITIONAL VALIDATION
// ============================================================

export function validateProfileWithRole(data: unknown) {
  // Determine role from data
  const roleData = data as { role?: string };
  
  if (roleData.role === 'student') {
    return validateData(studentProfileSchema, data);
  } else if (roleData.role === 'admin' || roleData.role === 'hod') {
    return validateData(staffProfileSchema, data);
  } else {
    return validateData(profileSchema, data);
  }
}

// ============================================================
// EXAMPLE 8: VALIDATION WITH TRANSFORMATIONS
// ============================================================

export function validateAndTransformStudentData(data: unknown) {
  const result = validateData(createStudentSchema, data);
  
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  
  // Transform the validated data
  const transformed = {
    ...result.data,
    full_name: result.data.full_name.trim().toUpperCase(),
    matric_number: result.data.matric_number.toUpperCase(),
    created_at: new Date().toISOString(),
  };
  
  return { success: true, data: transformed };
}

// ============================================================
// EXAMPLE 9: BATCH VALIDATION WITH ERROR AGGREGATION
// ============================================================

export function validateMultipleStudents(students: unknown[]) {
  const errors: Record<string, string[]> = {};
  const validStudents: any[] = [];
  
  for (let i = 0; i < students.length; i++) {
    const result = validateData(createStudentSchema, students[i]);
    
    if (!result.success) {
      // Prefix errors with index for batch processing
      for (const [field, messages] of Object.entries(result.errors)) {
        const prefixedField = `students[${i}].${field}`;
        errors[prefixedField] = messages;
      }
    } else {
      validStudents.push(result.data);
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: validStudents };
}

// ============================================================
// EXAMPLE 10: VALIDATION IN REACT COMPONENTS
// ============================================================

export function useFormValidation<T>(
  schema: any,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const validate = useCallback(() => {
    const result = validateData(schema, data);
    
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [data, schema]);
  
  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  
  const submit = useCallback(() => {
    if (validate()) {
      // Proceed with submission
      return { success: true, data };
    }
    return { success: false, errors };
  }, [data, validate]);
  
  return {
    data,
    errors,
    updateField,
    validate,
    submit,
  };
}

// ============================================================
// EXAMPLE 11: API ROUTE VALIDATION
// ============================================================

export async function handleCreateStudentAPI(request: Request) {
  try {
    const body = await request.json();
    
    const result = validateData(createStudentSchema, body);
    
    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        errors: result.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Proceed with database insertion
    // const student = await insertStudent(result.data);
    
    return new Response(JSON.stringify({
      success: true,
      data: result.data
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================
// EXAMPLE 12: EDGE FUNCTION VALIDATION
// ============================================================

export async function handleResultSubmissionEdge(request: Request) {
  try {
    const formData = await request.formData();
    
    // Validate file upload
    const file = formData.get('file') as File;
    const metadata = {
      department_id: formData.get('department_id'),
      course_id: formData.get('course_id'),
      session_id: formData.get('session_id'),
      version_number: parseInt(formData.get('version_number') as string),
    };
    
    const result = validateResultSubmissionFile(file, metadata);
    
    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        errors: result.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Process file upload
    // const submission = await processResultSubmission(result.data);
    
    return new Response(JSON.stringify({
      success: true,
      data: result.data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================
// EXAMPLE 13: RPC FUNCTION VALIDATION
// ============================================================

export async function handleGpaCalculationRPC(params: unknown) {
  const result = validateData(gpaCalculationSchema, params);
  
  if (!result.success) {
    throw new Error(`Invalid parameters: ${JSON.stringify(result.errors)}`);
  }
  
  const { student_id, session_id, semester, include_pending, include_failed } = result.data;
  
  // Perform GPA calculation
  // const gpa = await calculateGPA(student_id, session_id, semester, include_pending, include_failed);
  
  return {
    success: true,
    data: {
      student_id,
      session_id,
      semester,
      gpa: 3.75, // Mock result
      total_units: 18,
      total_grade_points: 67.5,
    }
  };
}

// ============================================================
// EXAMPLE 14: VALIDATION WITH CUSTOM ERROR MESSAGES
// ============================================================

export function validateWithCustomMessages(data: unknown) {
  // Create a custom schema with specific error messages
  const customSchema = createStudentSchema.extend({
    matric_number: createStudentSchema.shape.matric_number.refine(
      (val) => val.startsWith('F/HD/'),
      { message: 'Matric number must start with F/HD/' }
    ),
    full_name: createStudentSchema.shape.full_name.refine(
      (val) => val.split(' ').length >= 2,
      { message: 'Full name must contain at least first and last name' }
    ),
  });
  
  return validateData(customSchema, data);
}

// ============================================================
// EXAMPLE 15: VALIDATION FOR SEARCH/FILTER PARAMETERS
// ============================================================

export function validateStudentSearch(params: unknown) {
  const result = validateData(studentSchema, params);

  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  
  // Add default values
  const searchParams = {
    page: 1,
    limit: 20,
    ...result.data
  };
  
  return { success: true, data: searchParams };
}

// ============================================================
// TYPE IMPORTS FOR EXAMPLES
// ============================================================

import { useState, useCallback } from 'react';

// Note: These are just examples and would need to be properly integrated
// with your actual React components and API routes. 