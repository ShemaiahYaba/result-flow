import { z } from "zod";

// ============================================================
// RESULT SUBMISSION SCHEMAS
// ============================================================

// Base result submission schema
export const resultSubmissionSchema = z.object({
  id: z.string().uuid("Invalid result submission ID"),
  department_id: z.string().uuid("Invalid department ID"),
  course_id: z.string().uuid("Invalid course ID"),
  session_id: z.string().uuid("Invalid session ID"),
  submitted_by: z.string().uuid("Invalid submitted_by ID"),
  submitted_date: z.string().datetime("Invalid submitted_date timestamp").optional(),
  status: z.enum(["pending", "approved", "rejected"], {
    errorMap: () => ({ message: "Status must be pending, approved, or rejected" })
  }).default("pending"),
  approved_by: z.string().uuid("Invalid approved_by ID").optional(),
  approved_at: z.string().datetime("Invalid approved_at timestamp").optional(),
  rejection_reason: z.string()
    .max(1000, "Rejection reason must be less than 1000 characters")
    .optional(),
  file_url: z.string().url("Invalid file URL").optional(),
  file_hash: z.string()
    .length(64, "File hash must be exactly 64 characters")
    .regex(/^[a-fA-F0-9]+$/, "File hash must be hexadecimal")
    .optional(),
  version_number: z.number()
    .int("Version number must be an integer")
    .min(1, "Version number must be at least 1")
    .default(1),
  total_records: z.number()
    .int("Total records must be an integer")
    .min(0, "Total records must be at least 0")
    .optional(),
  processed_records: z.number()
    .int("Processed records must be an integer")
    .min(0, "Processed records must be at least 0")
    .optional(),
  failed_records: z.number()
    .int("Failed records must be an integer")
    .min(0, "Failed records must be at least 0")
    .optional(),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Result submission creation schema (without ID and timestamps)
export const createResultSubmissionSchema = resultSubmissionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Result submission update schema (all fields optional except ID)
export const updateResultSubmissionSchema = createResultSubmissionSchema.partial().extend({
  id: z.string().uuid("Invalid result submission ID"),
});

// Result submission search/filter schema
export const resultSubmissionSearchSchema = z.object({
  department_id: z.string().uuid("Invalid department ID").optional(),
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  submitted_by: z.string().uuid("Invalid submitted_by ID").optional(),
  approved_by: z.string().uuid("Invalid approved_by ID").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Result submission approval schema
export const resultSubmissionApprovalSchema = z.object({
  submission_id: z.string().uuid("Invalid submission ID"),
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status must be approved or rejected" })
  }),
  rejection_reason: z.string()
    .max(1000, "Rejection reason must be less than 1000 characters")
    .optional(),
}).strict().refine((data) => {
  if (data.status === "rejected" && !data.rejection_reason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when status is rejected",
  path: ["rejection_reason"],
});

// Bulk result submission approval schema
export const bulkResultSubmissionApprovalSchema = z.object({
  submissions: z.array(z.object({
    submission_id: z.string().uuid("Invalid submission ID"),
    status: z.enum(["approved", "rejected"]),
    rejection_reason: z.string().max(1000).optional(),
  }))
    .min(1, "At least one submission is required")
    .max(50, "Maximum 50 submissions can be approved at once"),
}).strict();

// Result submission file upload schema
export const resultSubmissionFileSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine((file) => {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];
      return allowedTypes.includes(file.type);
    }, "File must be Excel (.xlsx, .xls) or CSV format"),
  department_id: z.string().uuid("Invalid department ID"),
  course_id: z.string().uuid("Invalid course ID"),
  session_id: z.string().uuid("Invalid session ID"),
  version_number: z.number()
    .int("Version number must be an integer")
    .min(1, "Version number must be at least 1")
    .default(1),
}).strict();

// Result submission processing schema
export const resultSubmissionProcessingSchema = z.object({
  submission_id: z.string().uuid("Invalid submission ID"),
  total_records: z.number()
    .int("Total records must be an integer")
    .min(0, "Total records must be at least 0"),
  processed_records: z.number()
    .int("Processed records must be an integer")
    .min(0, "Processed records must be at least 0"),
  failed_records: z.number()
    .int("Failed records must be an integer")
    .min(0, "Failed records must be at least 0"),
  errors: z.array(z.object({
    row: z.number().int().min(1, "Row must be at least 1"),
    field: z.string().min(1, "Field must be at least 1 character"),
    message: z.string().min(1, "Message must be at least 1 character"),
  })).optional(),
}).strict();

// Result submission statistics schema
export const resultSubmissionStatisticsSchema = z.object({
  department_id: z.string().uuid("Invalid department ID").optional(),
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  submitted_by: z.string().uuid("Invalid submitted_by ID").optional(),
  date_from: z.string().datetime("Invalid date_from").optional(),
  date_to: z.string().datetime("Invalid date_to").optional(),
}).strict();

// Result submission history schema
export const resultSubmissionHistorySchema = z.object({
  id: z.string().uuid("Invalid submission history ID"),
  submission_id: z.string().uuid("Invalid submission ID"),
  old_status: z.enum(["pending", "approved", "rejected"]).optional(),
  new_status: z.enum(["pending", "approved", "rejected"]).optional(),
  changed_by: z.string().uuid("Invalid changed_by ID").optional(),
  change_reason: z.string()
    .max(1000, "Change reason must be less than 1000 characters")
    .optional(),
  changed_at: z.string().datetime("Invalid changed_at timestamp").optional(),
}).strict();

// Result submission history creation schema
export const createResultSubmissionHistorySchema = resultSubmissionHistorySchema.omit({
  id: true,
});

// ============================================================
// TYPES
// ============================================================

export type ResultSubmissionInput = z.infer<typeof resultSubmissionSchema>;
export type CreateResultSubmissionInput = z.infer<typeof createResultSubmissionSchema>;
export type UpdateResultSubmissionInput = z.infer<typeof updateResultSubmissionSchema>;
export type ResultSubmissionSearchInput = z.infer<typeof resultSubmissionSearchSchema>;
export type ResultSubmissionApprovalInput = z.infer<typeof resultSubmissionApprovalSchema>;
export type BulkResultSubmissionApprovalInput = z.infer<typeof bulkResultSubmissionApprovalSchema>;
export type ResultSubmissionFileInput = z.infer<typeof resultSubmissionFileSchema>;
export type ResultSubmissionProcessingInput = z.infer<typeof resultSubmissionProcessingSchema>;
export type ResultSubmissionStatisticsInput = z.infer<typeof resultSubmissionStatisticsSchema>;
export type ResultSubmissionHistoryInput = z.infer<typeof resultSubmissionHistorySchema>;
export type CreateResultSubmissionHistoryInput = z.infer<typeof createResultSubmissionHistorySchema>; 