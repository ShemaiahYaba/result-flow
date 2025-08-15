import { z } from "zod";

// ============================================================
// PROFILE SCHEMAS
// ============================================================

// Base profile schema for common fields
const baseProfileSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
  fullname: z.string().min(2, "Full name must be at least 2 characters").max(255, "Full name must be less than 255 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  phone_number: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  role: z.enum(["admin", "hod", "student"]).describe("Role must be admin, hod, or student"),
  status: z.enum(["active", "inactive", "suspended"]).default("active").describe("Status must be active, inactive, or suspended"),
});

// Student-specific profile schema
export const studentProfileSchema = baseProfileSchema.extend({
  role: z.literal("student"),
  matric_number: z.string()
    .min(5, "Matric number must be at least 5 characters")
    .max(50, "Matric number must be less than 50 characters")
    .regex(/^[A-Z]\/[A-Z]{2}\/\d{2}\/\d{7}$/, "Matric number must follow format: F/HD/21/1234567"),
  staff_id: z.never().optional(), // Students don't have staff IDs
});

// HOD/Admin profile schema
export const staffProfileSchema = baseProfileSchema.extend({
  role: z.enum(["admin", "hod"]),
  staff_id: z.string()
    .min(3, "Staff ID must be at least 3 characters")
    .max(50, "Staff ID must be less than 50 characters")
    .regex(/^[A-Z]{2,3}\d{3,6}$/, "Staff ID must follow format: ADM123 or HOD456"),
  matric_number: z.never().optional(), // Staff don't have matric numbers
});

// Union schema for all profile types
export const profileSchema = z.discriminatedUnion("role", [
  studentProfileSchema,
  staffProfileSchema,
])

// Profile creation schema (without ID and timestamps)
const createStudentProfileSchema = studentProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
const createStaffProfileSchema = staffProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const createProfileSchema = z.discriminatedUnion("role", [
  createStudentProfileSchema,
  createStaffProfileSchema,
]);

// Profile update schema (all fields optional except ID)
const updateStudentProfileSchema = createStudentProfileSchema.partial().extend({
  id: z.string().uuid("Invalid profile ID"),
});
const updateStaffProfileSchema = createStaffProfileSchema.partial().extend({
  id: z.string().uuid("Invalid profile ID"),
});
export const updateProfileSchema = z.discriminatedUnion("role", [
  updateStudentProfileSchema,
  updateStaffProfileSchema,
]);

// Profile login schema
export const profileLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

// Profile password update schema
export const passwordUpdateSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(8, "New password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirm_password: z.string().min(1, "Password confirmation is required"),
}).strict().refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Profile search/filter schema
export const profileSearchSchema = z.object({
  role: z.enum(["admin", "hod", "student"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type ProfileInput = z.infer<typeof profileSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileLoginInput = z.infer<typeof profileLoginSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type ProfileSearchInput = z.infer<typeof profileSearchSchema>;
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type StaffProfileInput = z.infer<typeof staffProfileSchema>; 